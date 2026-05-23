const cron = require('node-cron');
const pool = require('../db');
const { emitToUser } = require('../socketManager');

const PENALTY_AMOUNT = 1000;

const processExpiredEmergencies = async () => {
  const client = await pool.connect();

  try {
    // Find all expired emergency appointments
    const { rows: expired } = await client.query(`
      SELECT a.id, a.patient_id, a.doctor_id, a.created_at, a.timeout_at,
             d.user_id AS doctor_user_id, d.warning_count, d.wallet_balance AS doctor_wallet,
             d.full_name AS doctor_name,
             p.user_id AS patient_user_id, p.full_name AS patient_name
      FROM appointments a
      JOIN doctors d ON d.id = a.doctor_id
      JOIN patients p ON p.id = a.patient_id
      WHERE a.is_emergency = TRUE
        AND a.status = 'Pending'
        AND a.penalty_applied = FALSE
        AND a.timeout_at < NOW()
    `);

    if (expired.length === 0) return;

    console.log(`[Emergency Scheduler] Processing ${expired.length} expired emergency appointments`);

    for (const appt of expired) {
      try {
        await client.query('BEGIN');

        const isFirstOffense = appt.warning_count === 0;
        const actionTaken = isFirstOffense ? 'warning' : 'penalty';
        const penaltyAmount = isFirstOffense ? 0 : PENALTY_AMOUNT;
        const newWarningCount = appt.warning_count + 1;

        // 1. Update doctor warning count and wallet
        if (isFirstOffense) {
          await client.query(
            'UPDATE doctors SET warning_count = $1 WHERE id = $2',
            [newWarningCount, appt.doctor_id]
          );
        } else {
          // Deduct penalty — allow negative balance
          await client.query(
            'UPDATE doctors SET warning_count = $1, wallet_balance = wallet_balance - $2 WHERE id = $3',
            [newWarningCount, PENALTY_AMOUNT, appt.doctor_id]
          );

          // Get updated wallet balance for transaction record
          const { rows: [doc] } = await client.query(
            'SELECT wallet_balance FROM doctors WHERE id = $1',
            [appt.doctor_id]
          );

          // Create penalty transaction
          await client.query(
            `INSERT INTO transactions (user_id, type, amount, balance_after, description, reference_id, reference_type, created_by, reversible)
             VALUES ($1, 'penalty', $2, $3, $4, $5, 'appointment', 'system', TRUE)`,
            [
              appt.doctor_user_id,
              -PENALTY_AMOUNT,
              doc.wallet_balance,
              `₹${PENALTY_AMOUNT} penalty for missed emergency request from ${appt.patient_name}`,
              appt.id,
            ]
          );
        }

        // 2. Update appointment status
        await client.query(
          `UPDATE appointments SET status = 'Expired', penalty_applied = TRUE,
           response_time_seconds = EXTRACT(EPOCH FROM (NOW() - created_at))::INT
           WHERE id = $1`,
          [appt.id]
        );

        // 3. Create emergency violation record
        await client.query(
          `INSERT INTO emergency_violations (doctor_id, appointment_id, violation_type, response_time_seconds, penalty_amount, warning_count_at_time, action_taken)
           VALUES ($1, $2, 'timeout', EXTRACT(EPOCH FROM (NOW() - $3::TIMESTAMP))::INT, $4, $5, $6)`,
          [appt.doctor_id, appt.id, appt.created_at, penaltyAmount, newWarningCount, actionTaken]
        );

        // 4. Update doctor metrics
        await client.query(`
          INSERT INTO doctor_metrics (doctor_id, total_emergency_requests, timeout_count, total_penalties, total_penalty_amount, warning_count, last_violation_at, reliability_score, response_rate_percentage)
          VALUES ($1, 1, 1, $2, $3, $4, NOW(),
            GREATEST(0, 100 - (1 * 20)), 0)
          ON CONFLICT (doctor_id) DO UPDATE SET
            total_emergency_requests = doctor_metrics.total_emergency_requests + 1,
            timeout_count = doctor_metrics.timeout_count + 1,
            total_penalties = doctor_metrics.total_penalties + $2,
            total_penalty_amount = doctor_metrics.total_penalty_amount + $3,
            warning_count = $4,
            last_violation_at = NOW(),
            reliability_score = GREATEST(0,
              ((doctor_metrics.accepted_count::NUMERIC /
                NULLIF(doctor_metrics.total_emergency_requests + 1, 0)) * 100)),
            response_rate_percentage = ((doctor_metrics.accepted_count::NUMERIC /
              NULLIF(doctor_metrics.total_emergency_requests + 1, 0)) * 100),
            updated_at = NOW()
        `, [appt.doctor_id, isFirstOffense ? 0 : 1, penaltyAmount, newWarningCount]);

        // 5. Activity logs
        const doctorLogTitle = isFirstOffense
          ? '⚠️ Emergency Warning Issued'
          : `🚨 ₹${PENALTY_AMOUNT} Penalty Applied`;
        const doctorLogDesc = isFirstOffense
          ? `You did not respond to ${appt.patient_name}'s emergency request within 10 minutes. This is your first warning. Future violations will incur ₹${PENALTY_AMOUNT} penalties.`
          : `₹${PENALTY_AMOUNT} has been deducted from your wallet for missing ${appt.patient_name}'s emergency request. Warning count: ${newWarningCount}`;

        await client.query(
          `INSERT INTO activity_logs (user_id, type, title, description) VALUES ($1, 'alert', $2, $3)`,
          [appt.doctor_user_id, doctorLogTitle, doctorLogDesc]
        );

        await client.query(
          `INSERT INTO activity_logs (user_id, type, title, description) VALUES ($1, 'alert', $2, $3)`,
          [appt.patient_user_id, '⚠️ Doctor Unavailable',
            `Dr. ${appt.doctor_name} did not respond to your emergency request in time. We are looking for another available specialist.`]
        );

        // 6. Create notifications
        await client.query(
          `INSERT INTO notifications (user_id, type, title, message, priority, data) VALUES ($1, $2, $3, $4, $5, $6)`,
          [appt.doctor_user_id, 'emergency_penalty', doctorLogTitle, doctorLogDesc, 'urgent',
            JSON.stringify({ appointmentId: appt.id, penaltyAmount, warningCount: newWarningCount })]
        );

        await client.query(
          `INSERT INTO notifications (user_id, type, title, message, priority, data) VALUES ($1, $2, $3, $4, $5, $6)`,
          [appt.patient_user_id, 'emergency_expired', '⚠️ Doctor Unavailable',
            `Dr. ${appt.doctor_name} did not respond in time. We're finding another specialist for you.`, 'urgent',
            JSON.stringify({ appointmentId: appt.id, doctorName: appt.doctor_name })]
        );

        // 7. Emit real-time notifications
        emitToUser(appt.doctor_user_id, 'penalty:applied', {
          appointmentId: appt.id,
          penaltyAmount,
          warningCount: newWarningCount,
          actionTaken,
          message: doctorLogTitle,
        });

        emitToUser(appt.patient_user_id, 'emergency:expired', {
          appointmentId: appt.id,
          doctorName: appt.doctor_name,
          message: 'Doctor did not respond. Looking for alternatives.',
        });

        // 8. Attempt reassignment to another available emergency doctor
        const { rows: availableDoctors } = await client.query(`
          SELECT d.id, d.user_id, d.full_name
          FROM doctors d
          WHERE d.is_emergency = TRUE
            AND d.is_emergency_active = TRUE
            AND d.id != $1
            AND d.reliability_score > 20
          ORDER BY d.reliability_score DESC, d.warning_count ASC
          LIMIT 1
        `, [appt.doctor_id]);

        if (availableDoctors.length > 0) {
          const newDoctor = availableDoctors[0];

          // Create new emergency appointment with the reassigned doctor
          const { rows: [newAppt] } = await client.query(`
            INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, is_emergency, timeout_at, reassigned_from, reassignment_count)
            VALUES ($1, $2, CURRENT_DATE, CURRENT_TIME, 'Pending', TRUE, NOW() + INTERVAL '10 minutes', $3, $4)
            RETURNING id
          `, [appt.patient_id, newDoctor.id, appt.doctor_id, (appt.reassignment_count || 0) + 1]);

          // Notify the new doctor
          await client.query(
            `INSERT INTO notifications (user_id, type, title, message, priority, data) VALUES ($1, $2, $3, $4, $5, $6)`,
            [newDoctor.user_id, 'emergency_reassigned', '🚨 Reassigned Emergency Request',
              `Emergency request from ${appt.patient_name} has been reassigned to you. Please respond within 10 minutes.`, 'urgent',
              JSON.stringify({ appointmentId: newAppt.id, patientName: appt.patient_name })]
          );

          emitToUser(newDoctor.user_id, 'emergency:new', {
            appointmentId: newAppt.id,
            patientName: appt.patient_name,
            isReassignment: true,
          });

          emitToUser(appt.patient_user_id, 'emergency:reassigned', {
            newDoctorName: newDoctor.full_name,
            appointmentId: newAppt.id,
          });

          await client.query(
            `INSERT INTO activity_logs (user_id, type, title, description) VALUES ($1, 'appointment_reassigned', '🔄 Emergency Reassigned', $2)`,
            [appt.patient_user_id, `Your emergency has been reassigned to Dr. ${newDoctor.full_name}. They have 10 minutes to respond.`]
          );

          console.log(`[Emergency Scheduler] Reassigned appointment ${appt.id} from doctor ${appt.doctor_id} to doctor ${newDoctor.id}`);
        } else {
          console.log(`[Emergency Scheduler] No available doctors for reassignment of appointment ${appt.id}`);
        }

        await client.query('COMMIT');
        console.log(`[Emergency Scheduler] Processed expired appointment ${appt.id} - Action: ${actionTaken}`);

      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`[Emergency Scheduler] Error processing appointment ${appt.id}:`, err.message);
      }
    }
  } catch (err) {
    console.error('[Emergency Scheduler] Fatal error:', err.message);
  } finally {
    client.release();
  }
};

const startEmergencyScheduler = () => {
  // Run every 30 seconds
  cron.schedule('*/30 * * * * *', () => {
    processExpiredEmergencies().catch(err => {
      console.error('[Emergency Scheduler] Uncaught error:', err.message);
    });
  });

  console.log('[Emergency Scheduler] Started — checking every 30 seconds');
};

module.exports = { startEmergencyScheduler, processExpiredEmergencies };

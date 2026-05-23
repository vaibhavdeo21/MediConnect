const sendEmail = require('../utils/emailService');
const pool = require('../db');
const { emitToUser } = require('../socketManager');

// --- 1. GET ACTIVE EMERGENCY CALL ---
const getActiveCall = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let query;
    if (role === 'doctor') {
      query = `
        SELECT a.id, a.meeting_link, p.full_name as patient_name 
        FROM appointments a 
        JOIN patients p ON a.patient_id = p.id
        JOIN doctors d ON a.doctor_id = d.id
        WHERE d.user_id = $1 AND a.is_emergency = true AND a.status = 'Confirmed'
        ORDER BY a.id DESC LIMIT 1`;
    } else {
      query = `
        SELECT a.id, a.meeting_link, d.full_name as doctor_name 
        FROM appointments a 
        JOIN doctors d ON a.doctor_id = d.id
        JOIN patients p ON a.patient_id = p.id
        WHERE p.user_id = $1 AND a.is_emergency = true AND a.status = 'Confirmed'
        ORDER BY a.id DESC LIMIT 1`;
    }

    const result = await pool.query(query, [userId]);
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error("Active Call Error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// --- 2. BOOK APPOINTMENT ---
const bookAppointment = async (req, res) => {
  let { doctorId, appointmentDate, appointmentTime, isEmergency } = req.body;
  const userId = req.user.id; 

  try {
    // A. Check/Create Patient
    let patientQuery = await pool.query("SELECT id, full_name FROM patients WHERE user_id = $1", [userId]);
    let patientId;
    let patientName;

    if (patientQuery.rows.length > 0) {
      patientId = patientQuery.rows[0].id;
      patientName = patientQuery.rows[0].full_name;
    } else {
      const userDetails = await pool.query("SELECT full_name, phone_number FROM users WHERE id = $1", [userId]);
      patientName = userDetails.rows[0]?.full_name || 'Valued Patient';
      const userPhone = userDetails.rows[0]?.phone_number || '';
      const newPatient = await pool.query(
        "INSERT INTO patients (user_id, full_name, phone_number) VALUES ($1, $2, $3) RETURNING id",
        [userId, patientName, userPhone]
      );
      patientId = newPatient.rows[0].id;
    }

    // Handle "IMMEDIATE" time for emergency
    if (isEmergency && appointmentTime === 'IMMEDIATE') {
      const now = new Date();
      appointmentTime = now.toTimeString().split(' ')[0];
    }

    // Verify emergency doctor is active
    if (isEmergency) {
      const doctorStatus = await pool.query(
        "SELECT is_emergency, is_emergency_active FROM doctors WHERE id = $1",
        [doctorId]
      );
      if (!doctorStatus.rows[0]?.is_emergency_active) {
        return res.status(400).json({ message: "This doctor is not currently available for emergencies." });
      }
    }

    // Slot validation (skip for emergency)
    if (!isEmergency) {
      const existingSlot = await pool.query(
        "SELECT * FROM appointments WHERE doctor_id = $1 AND appointment_date = $2 AND appointment_time = $3 AND status != 'Cancelled'",
        [doctorId, appointmentDate, appointmentTime]
      );
      if (existingSlot.rows.length > 0) {
        return res.status(400).json({ message: "This slot is no longer available" });
      }
    }

    // Insert Appointment with timeout_at for emergencies
    const timeoutClause = isEmergency ? "NOW() + INTERVAL '10 minutes'" : 'NULL';
    const newAppointment = await pool.query(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, is_emergency, timeout_at) 
       VALUES ($1, $2, $3, $4, 'Pending', $5, ${timeoutClause}) RETURNING *`,
      [patientId, doctorId, appointmentDate, appointmentTime, isEmergency || false]
    );

    // Get Doctor Details
    const doctorUser = await pool.query(
      "SELECT u.id as doctor_user_id, u.email, d.full_name FROM doctors d JOIN users u ON d.user_id = u.id WHERE d.id = $1",
      [doctorId]
    );

    if (doctorUser.rows.length > 0) {
      const { email: doctorEmail, full_name: doctorName, doctor_user_id: doctorUserId } = doctorUser.rows[0];

      // Activity logs
      await pool.query(
        "INSERT INTO activity_logs (user_id, type, title, description) VALUES ($1, $2, $3, $4)",
        [userId, 'appointment_confirmed',
          isEmergency ? '🚨 Emergency SOS Sent' : 'Appointment Requested', 
          isEmergency ? `Priority alert sent to Dr. ${doctorName}` : `You requested a session with Dr. ${doctorName} for ${appointmentDate}`]
      );

      await pool.query(
        "INSERT INTO activity_logs (user_id, type, title, description) VALUES ($1, $2, $3, $4)",
        [doctorUserId, isEmergency ? 'alert' : 'message_received',
          isEmergency ? '🚨 Emergency Alert' : 'New Appointment Request', 
          `${patientName} has requested a ${isEmergency ? 'PRIORITY' : ''} appointment for ${appointmentDate}.`]
      );

      // Notifications
      if (isEmergency) {
        await pool.query(
          `INSERT INTO notifications (user_id, type, title, message, priority, data) VALUES ($1, $2, $3, $4, $5, $6)`,
          [doctorUserId, 'emergency_request', '🚨 Emergency Request',
            `${patientName} needs immediate emergency consultation. You have 10 minutes to respond.`, 'urgent',
            JSON.stringify({ appointmentId: newAppointment.rows[0].id, patientName })]
        );

        // Update doctor_metrics
        await pool.query(`
          INSERT INTO doctor_metrics (doctor_id, total_emergency_requests)
          VALUES ($1, 1)
          ON CONFLICT (doctor_id) DO UPDATE SET
            total_emergency_requests = doctor_metrics.total_emergency_requests + 1,
            updated_at = NOW()
        `, [doctorId]);
      }

      // Real-time notification
      emitToUser(doctorUserId, isEmergency ? 'emergency:new' : 'appointment:new', {
        appointmentId: newAppointment.rows[0].id,
        patientName,
        isEmergency,
        appointmentDate,
        appointmentTime,
        timeoutAt: newAppointment.rows[0].timeout_at,
      });

      // Email
      const emailSubject = isEmergency ? `🚨 EMERGENCY SOS: ${patientName}` : `New Appointment Request from ${patientName}`;
      const emailBody = `
        <h3>Hello Dr. ${doctorName},</h3>
        <p>${isEmergency ? '<strong style="color:red">This is an EMERGENCY priority request. You have 10 minutes to respond.</strong>' : 'You have a new appointment request.'}</p>
        <ul>
          <li><strong>Patient:</strong> ${patientName}</li>
          <li><strong>Date:</strong> ${appointmentDate}</li>
          <li><strong>Time:</strong> ${appointmentTime}</li>
        </ul>
        <p>Please login to your dashboard to Accept or Decline immediately.</p>
      `;
      sendEmail(doctorEmail, emailSubject, emailBody);
    }

    res.json(newAppointment.rows[0]);
  } catch (err) {
    console.error("Booking Error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// --- 3. UPDATE STATUS & RESCHEDULE (WITH ACTION LOCK) ---
const updateAppointmentStatus = async (req, res) => {
  const { id } = req.params; 
  const { status, meeting_link, appointment_date, appointment_time, reason } = req.body; 
  const actingUserId = req.user.id; 

  try {
    // Check if expired (action lock)
    const checkAppt = await pool.query(
      "SELECT status, is_emergency, created_at, doctor_id FROM appointments WHERE id = $1",
      [id]
    );
    if (checkAppt.rows.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    if (checkAppt.rows[0].status === 'Expired') {
      return res.status(400).json({ message: "Action Denied: This request has expired." });
    }

    const apptData = checkAppt.rows[0];

    // For emergency acceptance, generate meeting link and record response time
    let finalMeetingLink = meeting_link;
    if (apptData.is_emergency && status === 'Confirmed' && !meeting_link) {
      finalMeetingLink = `https://meet.jit.si/MediConnect-Emergency-${id}-${Date.now()}`;
    }

    const updatedAppt = await pool.query(
      `UPDATE appointments 
       SET status = $1, 
           meeting_link = COALESCE($2, meeting_link),
           appointment_date = COALESCE($3, appointment_date),
           appointment_time = COALESCE($4, appointment_time),
           responded_at = CASE WHEN $5 THEN NOW() ELSE responded_at END,
           response_time_seconds = CASE WHEN $5 THEN EXTRACT(EPOCH FROM (NOW() - created_at))::INT ELSE response_time_seconds END,
           rejection_reason = COALESCE($6, rejection_reason)
       WHERE id = $7 RETURNING *`,
      [status, finalMeetingLink || null, appointment_date || null, appointment_time || null,
       apptData.is_emergency, reason || null, id]
    );

    // Update doctor metrics for emergency responses
    if (apptData.is_emergency) {
      const responseTime = Math.floor((Date.now() - new Date(apptData.created_at).getTime()) / 1000);
      
      if (status === 'Confirmed') {
        await pool.query(`
          INSERT INTO doctor_metrics (doctor_id, total_emergency_requests, accepted_count, avg_response_time_seconds, response_rate_percentage, reliability_score)
          VALUES ($1, 0, 1, $2, 100, 100)
          ON CONFLICT (doctor_id) DO UPDATE SET
            accepted_count = doctor_metrics.accepted_count + 1,
            avg_response_time_seconds = (doctor_metrics.avg_response_time_seconds * doctor_metrics.accepted_count + $2) / (doctor_metrics.accepted_count + 1),
            response_rate_percentage = ((doctor_metrics.accepted_count + 1)::NUMERIC / NULLIF(doctor_metrics.total_emergency_requests, 0)) * 100,
            reliability_score = LEAST(100, ((doctor_metrics.accepted_count + 1)::NUMERIC / NULLIF(doctor_metrics.total_emergency_requests, 0)) * 100),
            updated_at = NOW()
        `, [apptData.doctor_id, responseTime]);
      } else if (status === 'Cancelled') {
        // Doctor rejected
        await pool.query(`
          INSERT INTO emergency_violations (doctor_id, appointment_id, violation_type, response_time_seconds, rejection_reason, action_taken)
          VALUES ($1, $2, 'rejection', $3, $4, 'warning')
        `, [apptData.doctor_id, id, responseTime, reason]);

        await pool.query(`
          INSERT INTO doctor_metrics (doctor_id, total_emergency_requests, rejected_count)
          VALUES ($1, 0, 1)
          ON CONFLICT (doctor_id) DO UPDATE SET
            rejected_count = doctor_metrics.rejected_count + 1,
            response_rate_percentage = ((doctor_metrics.accepted_count)::NUMERIC / NULLIF(doctor_metrics.total_emergency_requests, 0)) * 100,
            reliability_score = GREATEST(0, LEAST(100, ((doctor_metrics.accepted_count)::NUMERIC / NULLIF(doctor_metrics.total_emergency_requests, 0)) * 100)),
            last_violation_at = NOW(),
            updated_at = NOW()
        `, [apptData.doctor_id]);
      }
    }

    // Get details for notifications
    const apptDetails = await pool.query(`
      SELECT u.id as user_id, u.email, p.full_name, d.full_name as doctor_name, 
             a.appointment_date, a.appointment_time, a.is_emergency, d.user_id as doctor_user_id
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u ON p.user_id = u.id
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.id = $1
    `, [id]);

    if (apptDetails.rows.length > 0) {
      const detail = apptDetails.rows[0];
      const isRescheduled = appointment_date || appointment_time;

      // Activity logs
      await pool.query(
        "INSERT INTO activity_logs (user_id, type, title, description) VALUES ($1, $2, $3, $4)",
        [detail.user_id,
          isRescheduled ? 'profile_update' : (status === 'Confirmed' ? 'appointment_confirmed' : 'alert'),
          isRescheduled ? 'Appointment Rescheduled' : `Appointment ${status}`,
          `Dr. ${detail.doctor_name} has ${isRescheduled ? 'rescheduled your visit to ' + detail.appointment_date : status.toLowerCase() + ' your appointment'}. ${reason ? 'Reason: ' + reason : ''}`]
      );

      await pool.query(
        "INSERT INTO activity_logs (user_id, type, title, description) VALUES ($1, $2, $3, $4)",
        [actingUserId,
          isRescheduled ? 'profile_update' : 'appointment_confirmed',
          isRescheduled ? 'You Rescheduled' : `You ${status}`,
          `You have ${isRescheduled ? 'rescheduled' : status.toLowerCase()} the appointment with ${detail.full_name}.`]
      );

      // Notifications
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, priority, data) VALUES ($1, $2, $3, $4, $5, $6)`,
        [detail.user_id, `appointment_${status.toLowerCase()}`,
          `Appointment ${status}`,
          `Dr. ${detail.doctor_name} has ${status.toLowerCase()} your appointment.`,
          detail.is_emergency ? 'urgent' : 'normal',
          JSON.stringify({ appointmentId: id, status })]
      );

      // Real-time events
      emitToUser(detail.user_id, `appointment:status`, {
        appointmentId: parseInt(id),
        status,
        meetingLink: finalMeetingLink,
        doctorName: detail.doctor_name,
      });

      if (detail.is_emergency && status === 'Confirmed') {
        emitToUser(detail.user_id, 'emergency:accepted', {
          appointmentId: parseInt(id),
          meetingLink: finalMeetingLink,
          doctorName: detail.doctor_name,
        });
      }

      // Email
      const emailSubject = isRescheduled ? `Rescheduled: Dr. ${detail.doctor_name}` : `Appointment ${status}: Dr. ${detail.doctor_name}`;
      const emailBody = `
        <h3>Hello ${detail.full_name},</h3>
        <p>Your appointment with <strong>Dr. ${detail.doctor_name}</strong> has been ${isRescheduled ? 'rescheduled' : `<strong>${status}</strong>`}.</p>
        <p><strong>When:</strong> ${new Date(detail.appointment_date).toDateString()} at ${detail.appointment_time}</p>
        ${status === 'Confirmed' && finalMeetingLink ? `<p><a href="${finalMeetingLink}">Join your video consultation</a></p>` : ''}
      `;
      sendEmail(detail.email, emailSubject, emailBody);
    }

    res.json(updatedAppt.rows[0]);
  } catch (err) {
    console.error("Status Update Error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// --- 4. DELETE APPOINTMENT ---
const deleteAppointment = async (req, res) => {
  const { id } = req.params;
  const actingUserId = req.user.id; 

  try {
    const details = await pool.query(`
      SELECT p.user_id as patient_user_id, p.full_name as patient_name, d.full_name as doctor_name, a.appointment_date 
      FROM appointments a 
      JOIN patients p ON a.patient_id = p.id 
      JOIN doctors d ON a.doctor_id = d.id 
      WHERE a.id = $1`, [id]);

    if (details.rows.length > 0) {
      const { patient_user_id, patient_name, doctor_name, appointment_date } = details.rows[0];
      
      await pool.query(
        "INSERT INTO activity_logs (user_id, type, title, description) VALUES ($1, $2, $3, $4)",
        [patient_user_id, 'alert', 'Appointment Cancelled', `Dr. ${doctor_name} has removed your appointment for ${appointment_date} from the schedule.`]
      );

      await pool.query(
        "INSERT INTO activity_logs (user_id, type, title, description) VALUES ($1, $2, $3, $4)",
        [actingUserId, 'alert', 'Appointment Removed', `You removed the appointment with ${patient_name} on ${appointment_date}.`]
      );

      // Real-time notification
      emitToUser(patient_user_id, 'appointment:cancelled', {
        appointmentId: parseInt(id),
        doctorName: doctor_name,
      });
    }

    await pool.query("DELETE FROM appointments WHERE id = $1", [id]);
    res.json({ message: "Appointment deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// --- 5. GET APPOINTMENTS (No more lazy penalty check — handled by cron) ---
const getMyAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role; 

    let queryText = `
      SELECT a.id, a.appointment_date, a.appointment_time, a.status, a.is_emergency, 
             a.meeting_link, a.created_at, a.timeout_at, a.responded_at, a.response_time_seconds,
             a.rejection_reason, a.reassignment_count, a.doctor_id,
             p.full_name AS patient_name,
             u_p.is_premium AS is_patient_premium,
             d.full_name AS doctor_name,
             d.address,
             p.phone_number AS patient_phone
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN patients p ON a.patient_id = p.id
      JOIN users u_p ON p.user_id = u_p.id
    `;

    if (role === 'doctor') {
      queryText += ` WHERE d.user_id = $1`;
      queryText += ` ORDER BY a.status = 'Pending' DESC, a.is_emergency DESC, u_p.is_premium DESC, a.appointment_date, a.appointment_time`;
    } else {
      queryText += ` WHERE p.user_id = $1`;
      queryText += ` ORDER BY a.appointment_date DESC, a.appointment_time DESC`;
    }

    const appointments = await pool.query(queryText, [userId]);
    res.json(appointments.rows);
  } catch (err) {
    console.error("Fetch Error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// --- 6. COMPLETE APPOINTMENT ---
const completeAppointment = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows: [appt] } = await pool.query(
      "UPDATE appointments SET status = 'Completed' WHERE id = $1 AND status = 'Confirmed' RETURNING *",
      [id]
    );

    if (!appt) {
      return res.status(404).json({ message: "Appointment not found or not in confirmed status" });
    }

    // Get details for activity logs
    const { rows: [details] } = await pool.query(`
      SELECT p.user_id AS patient_user_id, p.full_name AS patient_name,
             d.full_name AS doctor_name, u.id AS doctor_user_id
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE a.id = $1
    `, [id]);

    if (details) {
      await pool.query(
        "INSERT INTO activity_logs (user_id, type, title, description) VALUES ($1, $2, $3, $4)",
        [details.patient_user_id, 'appointment_confirmed', '✅ Consultation Completed',
          `Your consultation with Dr. ${details.doctor_name} has been completed.`]
      );
      await pool.query(
        "INSERT INTO activity_logs (user_id, type, title, description) VALUES ($1, $2, $3, $4)",
        [details.doctor_user_id, 'appointment_confirmed', '✅ Session Completed',
          `Your consultation with ${details.patient_name} has been completed.`]
      );

      emitToUser(details.patient_user_id, 'appointment:completed', { appointmentId: parseInt(id) });
    }

    res.json(appt);
  } catch (err) {
    console.error("Complete Error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { 
  getActiveCall, 
  bookAppointment, 
  getMyAppointments, 
  updateAppointmentStatus, 
  deleteAppointment,
  completeAppointment,
};
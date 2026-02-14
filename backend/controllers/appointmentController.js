const sendEmail = require('../utils/emailService');
const pool = require('../db');

// --- HELPER: APPLY PENALTIES (LAZY CHECK) ---
// This runs automatically when fetching appointments to ensure real-time accountability.
const applyEmergencyPenalties = async () => {
  try {
    // Find appointments that are: Emergency + Pending + No Penalty Applied + Older than 10 mins
    const expiredAppts = await pool.query(`
      SELECT a.id, a.doctor_id, a.patient_id, d.user_id as doctor_user_id, p.user_id as patient_user_id
      FROM appointments a 
      JOIN patients p ON a.patient_id = p.id
      WHERE a.is_emergency = true 
      AND a.status = 'Pending' 
      AND a.penalty_applied = false
      AND a.created_at < NOW() - INTERVAL '10 minutes'
    `);

    for (let appt of expiredAppts.rows) {
      // 1. Deduct ₹1000 from Doctor's Wallet (Allowing negative balance)
      await pool.query(
        "UPDATE doctors SET wallet_balance = wallet_balance - 1000, updated_at = NOW() WHERE id = $1",
        [appt.doctor_id]
      );

      // 2. Mark Appointment as Expired & Penalty Applied
      await pool.query(
        "UPDATE appointments SET status = 'Expired', penalty_applied = true WHERE id = $1",
        [appt.id]
      );

      // 3. Log for Doctor (Red Flag)
      await pool.query(
        "INSERT INTO activity_logs (user_id, type, title, description) VALUES ($1, $2, $3, $4)",
        [appt.doctor_user_id, 'alert', 'Penalty Applied', '₹1000 deducted due to missed emergency triage window.']
      );

      // 4. Log for Patient
      await pool.query(
        "INSERT INTO activity_logs (user_id, type, title, description) VALUES ($1, $2, $3, $4)",
        [appt.patient_user_id, 'alert', 'Doctor Unavailable', 'The doctor did not respond in time. Please find another specialist.']
      );
    }
  } catch (err) {
    console.error("Penalty Check Error:", err);
  }
};

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
    res.status(500).send("Server Error");
  }
};

// --- 2. BOOK APPOINTMENT (UPI REMOVED) ---
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

    // Handle "IMMEDIATE" time string for SQL
    if (isEmergency && appointmentTime === 'IMMEDIATE') {
        const now = new Date();
        appointmentTime = now.toTimeString().split(' ')[0]; // e.g., "14:30:00"
    }

    // SLOT LOGIC: Bypass slot validation only if it's NOT an emergency
    if (!isEmergency) {
      const existingSlot = await pool.query(
        "SELECT * FROM appointments WHERE doctor_id = $1 AND appointment_date = $2 AND appointment_time = $3 AND status != 'Cancelled'",
        [doctorId, appointmentDate, appointmentTime]
      );
      if (existingSlot.rows.length > 0) {
        return res.status(400).json({ message: "This slot is no longer available" });
      }
    }

    // B. Insert Appointment (Default Status: Pending)
    const newAppointment = await pool.query(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, is_emergency) 
       VALUES ($1, $2, $3, $4, 'Pending', $5) RETURNING *`,
      [patientId, doctorId, appointmentDate, appointmentTime, isEmergency || false]
    );

    // C. Get Doctor Details for Email & Logging
    const doctorUser = await pool.query(
      "SELECT u.id as doctor_user_id, u.email, d.full_name FROM doctors d JOIN users u ON d.user_id = u.id WHERE d.id = $1",
      [doctorId]
    );

    if (doctorUser.rows.length > 0) {
      const { email: doctorEmail, full_name: doctorName, doctor_user_id: doctorUserId } = doctorUser.rows[0];

      // 1. LOG FOR PATIENT
      await pool.query(
        "INSERT INTO activity_logs (user_id, type, title, description) VALUES ($1, $2, $3, $4)",
        [
          userId, 
          'appointment_confirmed',
          isEmergency ? 'Emergency SOS Sent' : 'Appointment Requested', 
          isEmergency ? `Priority alert sent to Dr. ${doctorName}` : `You requested a session with Dr. ${doctorName} for ${appointmentDate}`
        ]
      );

      // 2. LOG FOR DOCTOR
      await pool.query(
        "INSERT INTO activity_logs (user_id, type, title, description) VALUES ($1, $2, $3, $4)",
        [
          doctorUserId, 
          isEmergency ? 'alert' : 'message_received',
          isEmergency ? 'Emergency Alert' : 'New Appointment Request', 
          `${patientName} has requested a ${isEmergency ? 'PRIORITY' : ''} appointment for ${appointmentDate}.`
        ]
      );

      // Email Logic
      const emailSubject = isEmergency ? `EMERGENCY SOS: ${patientName}` : `New Appointment Request from ${patientName}`;
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
    res.status(500).send("Server Error");
  }
};

// --- 3. UPDATE STATUS & RESCHEDULE (WITH ACTION LOCK) ---
const updateAppointmentStatus = async (req, res) => {
  const { id } = req.params; 
  const { status, meeting_link, appointment_date, appointment_time, reason } = req.body; 
  const actingUserId = req.user.id; 

  try {
    // 1. CHECK IF EXPIRED (ACTION LOCK)
    const checkAppt = await pool.query("SELECT status FROM appointments WHERE id = $1", [id]);
    if (checkAppt.rows.length > 0 && checkAppt.rows[0].status === 'Expired') {
        return res.status(400).json({ message: "Action Denied: This request has expired and penalty applied." });
    }

    const updatedAppt = await pool.query(
      `UPDATE appointments 
       SET status = $1, 
           meeting_link = COALESCE($2, meeting_link),
           appointment_date = COALESCE($3, appointment_date),
           appointment_time = COALESCE($4, appointment_time)
       WHERE id = $5 RETURNING *`,
      [status, meeting_link || null, appointment_date || null, appointment_time || null, id]
    );

    if (updatedAppt.rows.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const apptDetails = await pool.query(`
      SELECT u.id as user_id, u.email, p.full_name, d.full_name as doctor_name, a.appointment_date, a.appointment_time, a.is_emergency
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u ON p.user_id = u.id
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.id = $1
    `, [id]);

    if (apptDetails.rows.length > 0) {
      const { user_id: patientUserId, email, full_name, doctor_name, appointment_date: finalDate, appointment_time: finalTime, is_emergency } = apptDetails.rows[0];
      const isRescheduled = appointment_date || appointment_time;

      // 1. LOG FOR PATIENT
      await pool.query(
        "INSERT INTO activity_logs (user_id, type, title, description) VALUES ($1, $2, $3, $4)",
        [
          patientUserId,
          isRescheduled ? 'profile_update' : (status === 'Confirmed' ? 'appointment_confirmed' : 'alert'),
          isRescheduled ? 'Appointment Rescheduled' : `Appointment ${status}`,
          `Dr. ${doctor_name} has ${isRescheduled ? 'rescheduled your visit to ' + finalDate : status.toLowerCase() + ' your appointment'}. ${reason ? 'Reason: ' + reason : ''}`
        ]
      );

      // 2. LOG FOR DOCTOR
      await pool.query(
        "INSERT INTO activity_logs (user_id, type, title, description) VALUES ($1, $2, $3, $4)",
        [
          actingUserId,
          isRescheduled ? 'profile_update' : 'appointment_confirmed',
          isRescheduled ? 'You Rescheduled' : `You ${status}`,
          `You have ${isRescheduled ? 'rescheduled' : status.toLowerCase()} the appointment with ${full_name}. ${isRescheduled ? `New time: ${finalDate} @ ${finalTime}` : ''}`
        ]
      );

      // Email Logic
      const emailSubject = isRescheduled ? `Rescheduled: Dr. ${doctor_name}` : `Appointment ${status}: Dr. ${doctor_name}`;
      const color = status === 'Confirmed' ? 'green' : 'red';
      
      const emailBody = `
        <h3>Hello ${full_name},</h3>
        <p>Your appointment with <strong>Dr. ${doctor_name}</strong> has been ${isRescheduled ? 'rescheduled' : `<strong style="color:${color}">${status}</strong>`}.</p>
        <p><strong>When:</strong> ${new Date(finalDate).toDateString()} at ${finalTime}</p>
        ${status === 'Confirmed' ? `<p>Please login to your dashboard to ${is_emergency ? 'join the instant call' : 'join the scheduled session'}.</p>` : '<p>Please contact the clinic for more details.</p>'}
      `;

      sendEmail(email, emailSubject, emailBody);
    }

    res.json(updatedAppt.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
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
        }

        await pool.query("DELETE FROM appointments WHERE id = $1", [id]);
        res.json({ message: "Appointment deleted successfully" });
    } catch (err) {
        res.status(500).send("Server Error");
    }
};

// --- 5. GET APPOINTMENTS (TRIGGERS PENALTY CHECK) ---
const getMyAppointments = async (req, res) => {
  try {
    // --- CRITICAL: Check for penalties BEFORE fetching data ---
    await applyEmergencyPenalties(); 

    const userId = req.user.id;
    const role = req.user.role; 

    let queryText = `
      SELECT a.id, a.appointment_date, a.appointment_time, a.status, a.is_emergency, a.meeting_link, a.created_at,
             a.doctor_id,
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
      queryText += ` ORDER BY a.appointment_date, a.appointment_time`;
    }

    const appointments = await pool.query(queryText, [userId]);
    res.json(appointments.rows);

  } catch (err) {
    console.error("Fetch Error:", err.message);
    res.status(500).send("Server Error");
  }
};

module.exports = { 
    getActiveCall, 
    bookAppointment, 
    getMyAppointments, 
    updateAppointmentStatus, 
    deleteAppointment,
    applyEmergencyPenalties // Exported in case needed externally
};
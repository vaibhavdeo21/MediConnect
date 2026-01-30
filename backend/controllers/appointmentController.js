const pool = require('../db');

const bookAppointment = async (req, res) => {
    const { doctorId, date, time } = req.body;
    const userId = req.user.id; 

    try {
        // Get patient_id from user_id
        const patient = await pool.query('SELECT id FROM patients WHERE user_id = $1', [userId]);
        if (patient.rows.length === 0) {
            return res.status(404).json({ message: 'Patient profile not found' });
        }
        const patientId = patient.rows[0].id;

        // Insert appointment
        const newAppointment = await pool.query(
            'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time) VALUES ($1, $2, $3, $4) RETURNING *',
            [patientId, doctorId, date, time]
        );

        res.json(newAppointment.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const getMyAppointments = async (req, res) => {
    const userId = req.user.id;
    const role = req.user.role;

    try {
        let query = '';
        if (role === 'patient') {
            query = `
                SELECT a.id, d.full_name as doctor_name, a.appointment_date, a.appointment_time, a.status 
                FROM appointments a 
                JOIN patients p ON a.patient_id = p.id 
                JOIN doctors d ON a.doctor_id = d.id 
                WHERE p.user_id = $1`;
        } else {
            query = `
                SELECT a.id, p.full_name as patient_name, a.appointment_date, a.appointment_time, a.status 
                FROM appointments a 
                JOIN doctors d ON a.doctor_id = d.id 
                JOIN patients p ON a.patient_id = p.id 
                WHERE d.user_id = $1`;
        }

        const appointments = await pool.query(query, [userId]);
        res.json(appointments.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = { bookAppointment, getMyAppointments };
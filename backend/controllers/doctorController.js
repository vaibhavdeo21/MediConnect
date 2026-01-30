const pool = require('../db');

// Get all doctors (for the patient search page)
const getAllDoctors = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT users.id as user_id, doctors.id as doctor_id, doctors.full_name, doctors.specialization, doctors.consultation_fee FROM doctors JOIN users ON doctors.user_id = users.id'
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Set availability (Doctor only)
const setAvailability = async (req, res) => {
    // Expected body: { day: 'Monday', startTime: '09:00', endTime: '17:00' }
    const { day, startTime, endTime } = req.body;
    const userId = req.user.id; // Comes from JWT middleware

    try {
        // First get the doctor_id from the user_id
        const doctor = await pool.query('SELECT id FROM doctors WHERE user_id = $1', [userId]);
        
        if (doctor.rows.length === 0) {
            return res.status(404).json({ message: 'Doctor profile not found' });
        }

        const doctorId = doctor.rows[0].id;

        const newAvailability = await pool.query(
            'INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time) VALUES ($1, $2, $3, $4) RETURNING *',
            [doctorId, day, startTime, endTime]
        );

        res.json(newAvailability.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = { getAllDoctors, setAvailability };
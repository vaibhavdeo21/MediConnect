CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    password_hash VARCHAR(255),
    role VARCHAR(50) DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'admin')),
    is_premium BOOLEAN DEFAULT FALSE,
    referral_code VARCHAR(50) UNIQUE,
    referral_count INT DEFAULT 0,
    referred_by VARCHAR(50),
    wallet_balance NUMERIC(10, 2) DEFAULT 0.00,
    reset_otp VARCHAR(10),
    reset_otp_expiry TIMESTAMP,
    subscription_end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    full_name VARCHAR(255),
    specialization VARCHAR(255) DEFAULT 'General Physician',
    experience_years INT DEFAULT 0,
    consultation_fee NUMERIC(10, 2) DEFAULT 0.00,
    phone_number VARCHAR(20),
    bio TEXT,
    address TEXT,
    availability TEXT,
    is_emergency BOOLEAN DEFAULT FALSE,
    is_emergency_active BOOLEAN DEFAULT FALSE,
    total_revenue NUMERIC(10, 2) DEFAULT 0.00,
    wallet_balance NUMERIC(10, 2) DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    full_name VARCHAR(255),
    phone_number VARCHAR(20),
    address TEXT,
    dob DATE,
    gender VARCHAR(20),
    blood_group VARCHAR(10),
    medical_history TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INT REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Cancelled', 'Completed', 'Expired')),
    is_emergency BOOLEAN DEFAULT FALSE,
    meeting_link TEXT,
    penalty_applied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE medical_records (
    id SERIAL PRIMARY KEY,
    appointment_id INT REFERENCES appointments(id) ON DELETE CASCADE,
    file_name VARCHAR(255),
    file_path TEXT,
    remarks TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100),
    title VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prescriptions (
    id SERIAL PRIMARY KEY,
    appointment_id INT REFERENCES appointments(id) ON DELETE CASCADE UNIQUE,
    medicines TEXT,
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    doctor_id INT REFERENCES doctors(id) ON DELETE CASCADE,
    patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_active_calls ON appointments(is_emergency, status) WHERE is_emergency = TRUE AND status = 'Confirmed';
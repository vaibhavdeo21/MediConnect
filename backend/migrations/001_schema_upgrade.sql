-- MediConnect Schema Upgrade Migration
-- Version: 1.0.0
-- Date: 2026-05-22
-- Description: Adds emergency accountability, wallet transactions, notifications, admin audit, doctor metrics

-- ============================================
-- NEW TABLE: transactions (Wallet Ledger)
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('credit','debit','penalty','refund','consultation','referral_bonus','subscription')),
  amount NUMERIC(10,2) NOT NULL,
  balance_after NUMERIC(10,2) NOT NULL,
  description TEXT,
  reference_id INT,
  reference_type VARCHAR(50),
  created_by VARCHAR(50) DEFAULT 'system',
  reversible BOOLEAN DEFAULT FALSE,
  reversed BOOLEAN DEFAULT FALSE,
  reversed_by INT REFERENCES users(id),
  reversed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- NEW TABLE: emergency_violations
-- ============================================
CREATE TABLE IF NOT EXISTS emergency_violations (
  id SERIAL PRIMARY KEY,
  doctor_id INT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_id INT NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  violation_type VARCHAR(50) NOT NULL CHECK (violation_type IN ('timeout','rejection')),
  response_time_seconds INT,
  penalty_amount NUMERIC(10,2) DEFAULT 0,
  warning_count_at_time INT DEFAULT 0,
  rejection_reason TEXT,
  action_taken VARCHAR(50) CHECK (action_taken IN ('warning','penalty')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- NEW TABLE: doctor_metrics
-- ============================================
CREATE TABLE IF NOT EXISTS doctor_metrics (
  id SERIAL PRIMARY KEY,
  doctor_id INT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE UNIQUE,
  total_emergency_requests INT DEFAULT 0,
  accepted_count INT DEFAULT 0,
  rejected_count INT DEFAULT 0,
  timeout_count INT DEFAULT 0,
  avg_response_time_seconds NUMERIC(10,2) DEFAULT 0,
  response_rate_percentage NUMERIC(5,2) DEFAULT 100,
  reliability_score NUMERIC(5,2) DEFAULT 100,
  total_penalties INT DEFAULT 0,
  total_penalty_amount NUMERIC(10,2) DEFAULT 0,
  warning_count INT DEFAULT 0,
  last_violation_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- NEW TABLE: notifications
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- NEW TABLE: admin_audit_logs
-- ============================================
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id SERIAL PRIMARY KEY,
  admin_id INT NOT NULL REFERENCES users(id),
  action_type VARCHAR(100) NOT NULL,
  target_type VARCHAR(100),
  target_id INT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ALTER: appointments table — new columns
-- ============================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='timeout_at') THEN
    ALTER TABLE appointments ADD COLUMN timeout_at TIMESTAMP;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='responded_at') THEN
    ALTER TABLE appointments ADD COLUMN responded_at TIMESTAMP;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='response_time_seconds') THEN
    ALTER TABLE appointments ADD COLUMN response_time_seconds INT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='rejection_reason') THEN
    ALTER TABLE appointments ADD COLUMN rejection_reason TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='reassigned_from') THEN
    ALTER TABLE appointments ADD COLUMN reassigned_from INT REFERENCES doctors(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='reassignment_count') THEN
    ALTER TABLE appointments ADD COLUMN reassignment_count INT DEFAULT 0;
  END IF;
END $$;

-- ============================================
-- ALTER: doctors table — new columns
-- ============================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='doctors' AND column_name='warning_count') THEN
    ALTER TABLE doctors ADD COLUMN warning_count INT DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='doctors' AND column_name='reliability_score') THEN
    ALTER TABLE doctors ADD COLUMN reliability_score NUMERIC(5,2) DEFAULT 100.00;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='doctors' AND column_name='is_online') THEN
    ALTER TABLE doctors ADD COLUMN is_online BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='doctors' AND column_name='last_active_at') THEN
    ALTER TABLE doctors ADD COLUMN last_active_at TIMESTAMP;
  END IF;
END $$;

-- ============================================
-- ALTER: users table — new columns
-- ============================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='avatar_url') THEN
    ALTER TABLE users ADD COLUMN avatar_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='last_login_at') THEN
    ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP;
  END IF;
END $$;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_emergency_violations_doctor ON emergency_violations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_timeout ON appointments(is_emergency, status, timeout_at) WHERE is_emergency = TRUE;
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_doctors_online ON doctors(is_online) WHERE is_online = TRUE;
CREATE INDEX IF NOT EXISTS idx_doctors_emergency ON doctors(is_emergency, is_emergency_active) WHERE is_emergency = TRUE;

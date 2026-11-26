-- Ah-Slap! MVP Starter Schema (PostgreSQL)
-- Run via: npm run db:init (inside server/)
-- Or via psql: PGPASSWORD='...' psql -h 127.0.0.1 -U ahslap_user -d ahslap_db -f db/init.sql

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash TEXT, -- Nullable for MVP if password check is deferred; ready for bcryptjs
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Pre-seeded test user so Task C2 (Login) can be tested immediately
INSERT INTO users (full_name, email, phone)
VALUES ('Test Student', 'test@campus.technion.ac.il', '050-0000000')
ON CONFLICT (email) DO NOTHING;

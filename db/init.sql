-- Ah-Slap! MVP Starter Schema (PostgreSQL)
-- Run via: npm run db:init (inside server/)
-- Or via psql: PGPASSWORD='...' psql -h 127.0.0.1 -U ahslap_user -d ahslap_db -f db/init.sql

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Pre-seeded test user so Task C2 (Login) can be tested immediately
INSERT INTO users (full_name, email, phone, password)
VALUES ('Test Student', 'test@campus.technion.ac.il', '050-0000000','test')
RETURNING id;

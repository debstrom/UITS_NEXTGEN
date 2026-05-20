-- Run once: psql -U postgres -d uits_nextgen -f migrations/001_create_users.sql
-- Or create the DB first: CREATE DATABASE uits_nextgen;

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  first_name    VARCHAR(100)  NOT NULL,
  last_name     VARCHAR(100)  NOT NULL,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  role_id       VARCHAR(50)   NOT NULL UNIQUE,
  department    VARCHAR(200)  NOT NULL,
  role          VARCHAR(10)   NOT NULL CHECK (role IN ('student', 'teacher')),
  password_hash TEXT          NOT NULL,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email   ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);

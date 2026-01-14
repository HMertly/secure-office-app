-- Ticket status enum (PostgreSQL)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_status') THEN
    CREATE TYPE ticket_status AS ENUM ('OPEN', 'IN_PROGRESS', 'DONE');
  END IF;
END$$;

CREATE TABLE tickets (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status ticket_status NOT NULL DEFAULT 'OPEN',

  created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  assigned_to BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_created_by ON tickets(created_by);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);

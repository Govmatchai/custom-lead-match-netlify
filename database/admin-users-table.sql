CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service role" ON admin_users FOR ALL USING (auth.role() = 'service_role');

INSERT INTO admin_users (email, password_hash) VALUES 
('admin@customleadmatch.com', '$2b$10$rOvHPGkwMzx6tFjmKzjZUeYxvK8qF5PzMxJzQzJzQzJzQzJzQzJzQu')
ON CONFLICT (email) DO NOTHING;

-- Sample seed data for testing
-- Run this after creating the schema

-- Insert sample user (password: 'password123' hashed with bcrypt)
-- You should change this password in production
INSERT INTO users (email, password, name, created_at) VALUES
('demo@primetrade.ai', '$2a$10$rKJYGKZQqrFqJqCqJqCqJeKqJqCqJqCqJqCqJqCqJqCqJqCqJqCqJ', 'Demo User', NOW())
ON CONFLICT (email) DO NOTHING;

-- Get the user_id of the demo user
DO $$
DECLARE
    demo_user_id INTEGER;
BEGIN
    SELECT id INTO demo_user_id FROM users WHERE email = 'demo@primetrade.ai';
    
    -- Insert sample tasks for the demo user
    IF demo_user_id IS NOT NULL THEN
        INSERT INTO tasks (user_id, title, description, status, created_at, updated_at) VALUES
        (demo_user_id, 'Complete project documentation', 'Write comprehensive documentation for the project including API docs and setup guide', 'in-progress', NOW(), NOW()),
        (demo_user_id, 'Review pull requests', 'Review and merge pending pull requests from team members', 'pending', NOW(), NOW()),
        (demo_user_id, 'Setup CI/CD pipeline', 'Configure automated testing and deployment pipeline', 'pending', NOW(), NOW()),
        (demo_user_id, 'Fix authentication bug', 'Resolve the JWT token expiration issue', 'completed', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),
        (demo_user_id, 'Update dependencies', 'Update all npm packages to latest stable versions', 'completed', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

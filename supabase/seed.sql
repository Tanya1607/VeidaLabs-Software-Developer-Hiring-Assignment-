-- Seed data for resources
-- IMPORTANT: You must replace 'USER_ID_HERE' with a valid user ID from auth.users after signing up, 
-- or rely on the backend/admin to insert these.
-- Since RLS enforces "view own resources", these will only be visible if 'owner_id' matches the querying user.
-- For testing purposes, you might want to temporarily disable RLS or update these rows after you create a user.

-- Example inserts (Automatically assigning to the first registered user)
DO $$
DECLARE
    v_user_id uuid;
BEGIN
    SELECT id INTO v_user_id FROM auth.users LIMIT 1;

    IF v_user_id IS NOT NULL THEN
        INSERT INTO resources (title, description, type, storage_path, owner_id)
        VALUES 
        ('Introduction to Photosynthesis', 'Deep dive into plant biology', 'video', 'videos/photosynthesis.mp4', v_user_id),
        ('Gravity Explained', 'Physics fundamentals slide deck', 'ppt', 'ppts/gravity.pptx', v_user_id),
        ('World History Overview', 'Timeline of major events', 'ppt', 'ppts/history.pptx', v_user_id)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

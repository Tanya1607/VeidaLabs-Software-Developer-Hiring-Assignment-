from supabase import create_client, Client
from app.core.config import get_settings

settings = get_settings()

# Initialize Supabase client
# backend uses SERVICE_ROLE_KEY to bypass RLS when needed (e.g. generating signed URLs for private files)
# BUT we should be careful. 
# For general queries, we might want to propagate the user's token or just use RLS if we send the token.
# However, the requirement says "Backend generates signed URLs".
# We'll use the service role key for the admin tasks (like signing URLs).
# For user-context data, we usually pass the JWT.
supabase_admin: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

def get_supabase_admin() -> Client:
    return supabase_admin

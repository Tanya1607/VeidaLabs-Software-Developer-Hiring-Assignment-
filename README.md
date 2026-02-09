## Key Features
- **Intelligent Search**: Backend automatically strips natural language prefixes (e.g., "tell me about", "what is") to isolate keywords for database searching.
- **Persistent Chat History**: Maintains a full conversation log during the session. Users can see their previous questions and Jiji's answers in a scrollable chat interface.
- **Contextual Resources**: Recommended resources are pinned directly to the relevant Jiji response bubble, keeping the educational context preserved.
- **Supabase Integration**: Secure authentication, RLS-protected database tables, and private storage with signed URL generation for content delivery.

## Architecture
- **Backend (`/backend`)**: FastAPI, Pydantic v2, Supabase Python Client.
  - Custom query cleaning logic for better matching.
  - Signed URL generation with automatic 404 handling and diagnostic logging.
- **Frontend (`/frontend`)**: Next.js 14, Tailwind CSS, Lucide Icons.
  - Dynamic chat interface with message history state management.
  - Responsive design for cards and chat bubbles.
- **Database (`Supabase`)**:
  - Tables: `profiles`, `resources`, `queries`.
  - Indexes on searchable columns for performance.

## Setup Instructions

### 1. Supabase Configuration
1. Run `supabase/migrations/001_init.sql` in the SQL Editor.
2. Create a **Private** bucket named `learning-content`.
3. (Optional) Run `supabase/seed.sql` to populate sample meta-data.
   > [!NOTE]
   > Ensure file names in the `storage_path` column match your actual files in Storage exactly.

### 2. Environment Variables
**Backend (`/backend/.env`)**:
```env
SUPABASE_URL=your_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
```

**Frontend (`/frontend/.env.local`)**:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Running Locally
**Backend**:
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```

## Developer
**Tanya Tarang**
[GitHub Profile](https://github.com/Tanya1607)


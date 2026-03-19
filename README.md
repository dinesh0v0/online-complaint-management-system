# Citizen Complaint Platform

This workspace contains a full-stack complaint management system with a citizen portal and a police admin portal.

## Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: FastAPI
- Database/Auth/Storage: Supabase
- Frontend deployment prep: Netlify
- Backend deployment prep: Vercel

## Project Structure

- `frontend/` - React application with protected routes, theming, charts, and complaint workflows
- `backend/` - FastAPI API with auth, complaint, and admin endpoints
- `supabase/schema.sql` - PostgreSQL schema, storage bucket setup, and RLS policies

## Local Setup

1. Apply `supabase/schema.sql` in Supabase SQL Editor.
2. Copy `frontend/.env.example` to `frontend/.env` and add the correct values.
3. Copy `backend/.env.example` to `backend/.env` and add the correct values.
4. Install dependencies:

```bash
cd frontend && npm install
cd ../backend && python -m pip install -r requirements.txt
```

5. Start the apps:

```bash
cd frontend && npm run dev
cd ../backend && uvicorn app.main:app --reload
```

## Admin Access

New sign-ups are created as citizens by default. Promote an approved account to admin inside Supabase:

```sql
update public.users
set role = 'admin'
where email = 'approved-admin@example.com';
```

## Storage

- Evidence files upload to the private `complaint-evidence` bucket.
- Storage policies only allow citizens to access their own files, while admins can access all evidence.

## Verification Commands

- Frontend lint: `cd frontend && npm run lint`
- Frontend build: `cd frontend && npm run build`
- Backend smoke test: `cd backend && python scripts/smoke_test.py`

The backend smoke test requires the Supabase environment variables to be present in the shell before execution.

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1WQL4mv8ClqDFpWu9ZJ9Jo8i6kx5XH6y7

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
   `npm run dev`

## Database Setup (Supabase)

This project uses Supabase for the backend. Follow these steps to set it up:

1. **Create a Supabase Project**: Go to [supabase.com](https://supabase.com) and create a new project.
2. **Database Schema**:
   - Go to the **SQL Editor** in your Supabase dashboard.
   - Run the contents of `backend/schema.sql` to create tables and security policies.
3. **Seed Data**:
   - Run `backend/seed_data.sql` to add initial sample data (courses, basic vocabulary).
   - Run `backend/import_pdf_vocab.sql` to import Book 3 vocabulary extracted from the PDF.
4. **Environment Variables**:
   - Copy the Project URL and Anon Key from **Project Settings > API**.
   - Update `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your `.env.local` file.

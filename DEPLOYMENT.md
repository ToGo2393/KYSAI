# Deploying KYSAI

## 1. Backend (Render)

We use **Render** for the Python FastAPI backend because it supports persistent disks (needed for SQLite) and easy Python deployment.

1.  **Sign up/Log in** to [Render](https://render.com).
2.  Click **New +** -> **Blueprint**.
3.  Connect your GitHub repository.
4.  Render will auto-detect `render.yaml`.
5.  **Environment Variables**:
    *   `GEMINI_API_KEY`: Paste your key here.
    *   `DATABASE_URL`: Set this to `sqlite+aiosqlite:////data/kysai.db` to use the persistent disk defined in `render.yaml`.
6.  Click **Apply**.

> **Note**: The `render.yaml` creates a small persistent disk mounted at `/data` to save your `kysai.db` so data isn't lost on restarts.

## 2. Frontend (Vercel)

1.  **Sign up/Log in** to [Vercel](https://vercel.com).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Build Settings**:
    *   **Root Directory**: `frontend` (Important!)
    *   **Framework Preset**: Vite (should detect automatically)
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
5.  **Environment Variables**:
    *   `VITE_API_URL`: Set this to your **Render Backend URL**.
        *   Example: `https://kysai-backend.onrender.com/api` (Note: No trailing slash, or check your `api.ts` logic. Our code uses `/api/v1` appended or clean path?
        *   *Wait, check `api.ts`: `const API_URL = import.meta.env.VITE_API_URL || '/api/v1';`*
        *   If you set `VITE_API_URL` to `https://your-app.onrender.com`, the code uses it directly.
        *   So you should set `VITE_API_URL` to `https://your-app.onrender.com/api/v1`.
6.  Click **Deploy**.

## 3. Final Check

Open your Vercel URL.
- Go to "8D Generator".
- Try generating a report.
- If it fails, check the Browser Console (F12) -> Network to see if it's hitting the correct Render URL.

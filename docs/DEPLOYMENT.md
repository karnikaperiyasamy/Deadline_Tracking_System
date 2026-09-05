# LifeOS Deployment Guide

This document explains step-by-step instructions for deploying LifeOS to production.

---

## Production Architecture Overview

```
                          ┌───────────────────────────┐
                          │   GitHub Pages Frontend   │
                          │ https://user.github.io... │
                          └─────────────┬─────────────┘
                                        │ REST APIs
                                        ▼
                          ┌───────────────────────────┐
                          │    Render/Railway Node    │
                          │   https://backend.onrender│
                          └──────┬──────────────┬─────┘
                                 │              │
                                 ▼              ▼
                       ┌───────────┐      ┌─────────────┐
                       │PostgreSQL │      │ Google AI / │
                       │ Database  │      │ Gemini SDK  │
                       └───────────┘      └─────────────┘
```

> [!IMPORTANT]
> **Key Architecture Rule**: GitHub Pages only hosts static web assets (React SPA frontend). It **cannot** host Node.js Express servers, run database connections, or securely store secret API keys. The backend MUST be deployed separately on a service like Render, Railway, or Fly.io.

---

## Step 1: Deploy PostgreSQL Database

1. Create a managed PostgreSQL database instance on **Supabase**, **Neon**, **Render**, or **Railway**.
2. Retrieve your connection string. Example format:
   `postgresql://username:password@ep-host-name.postgres.database.azure.com/lifeos?sslmode=require`

---

## Step 2: Deploy Node.js Backend (Render / Railway / Docker)

### Option A: Deploying on Render / Railway
1. Push your repository to GitHub.
2. In Render/Railway, create a new **Web Service** connected to your repository `backend/` directory.
3. Set the build and start commands:
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
4. Add the following **Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=postgresql://user:pass@host:5432/lifeos?sslmode=require
   JWT_SECRET=your_super_secret_jwt_key_here
   CLIENT_URL=https://YOUR-GITHUB-USERNAME.github.io
   AI_PROVIDER=gemini
   AI_API_KEY=your_production_gemini_api_key
   AI_MODEL=gemini-2.5-flash
   ```
5. Deploy the service and note your production URL (e.g., `https://lifeos-backend.onrender.com`).

---

## Step 3: Run Database Migrations on Production DB

Execute the Prisma migration deploy command against your production database:
```bash
npx prisma migrate deploy --schema=backend/prisma/schema.prisma
```

---

## Step 4: Deploy React Frontend to GitHub Pages

1. In your GitHub Repository settings, navigate to **Settings** -> **Pages**.
2. Select **Source**: `GitHub Actions`.
3. Configure your Repository Secret:
   - Name: `VITE_API_URL`
   - Value: `https://lifeos-backend.onrender.com/api`
4. The workflow in `.github/workflows/deploy-frontend.yml` will automatically build the Vite React application and deploy the production bundle to GitHub Pages whenever code is pushed to `main`.
5. Access your live application at `https://YOUR-GITHUB-USERNAME.github.io/LifeOS/`

---

## Verification & Health Checklist

1. **Backend Health**: Open `https://YOUR-BACKEND.onrender.com/api/health` in a browser. Verify response `{ "status": "ok", "service": "LifeOS API" }`.
2. **Frontend Connectivity**: Open your GitHub Pages link. Open Developer Console -> Network tab. Register a new user account.
3. **PostgreSQL Verification**: Create a new task. Verify that the task persists across browser reloads.
4. **AI Service Verification**: Open the AI Assistant page and ask a question. Verify that the server returns an AI response generated from your database tasks.

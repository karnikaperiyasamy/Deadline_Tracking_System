# LifeOS — AI-Powered Deadline & Life Management System

LifeOS is a complete, production-ready full-stack personal productivity and deadline management web application. It integrates a React/TypeScript frontend (styled with Tailwind CSS), a Node.js/Express TypeScript backend, a PostgreSQL database managed via Prisma ORM, and an AI Service module for natural-language parsing, task breakdowns, risk analysis, and personalized scheduling.

---

## 🌟 Key Product Features

- **Centralized Deadline Tracking**: Organize assignments, exams, projects, hackathons, job applications, internships, scholarships, meetings, events, personal tasks, and documents.
- **Visual Urgency Engine**: Automatic color-coded badges for Overdue (Red), Due Today (Urgent), Due in 3 days (Warning), and Due in 7 days (Attention).
- **Real Server-Side AI Integration**: Queries user's actual database tasks via Google Gemini / OpenAI SDK.
  - **AI Executive Assistant**: Ask questions with real database context ("What should I work on today?").
  - **AI Daily Timeline Planner**: Synthesizes tasks into Morning, Afternoon, Evening schedule.
  - **AI Goal Decomposer**: 1-click breakdown of major goals into subtasks with explicit user confirmation.
  - **AI Deadline Risk Analysis**: Evaluates remaining effort vs due timestamp to rate risk levels (LOW, MEDIUM, HIGH, CRITICAL).
  - **Natural Language Task Creation**: Parses prompts like `"Submit DBMS assignment tomorrow at 6 PM"` into structured database fields.
- **Interactive Dashboard & Recharts**: Real-time analytics, status distributions, category breakdowns, and completion velocity.
- **Notification Inbox**: Automated system alerts for approaching deadlines and high-risk items.
- **Production Architecture**: Designed for independent deployment (React Frontend on GitHub Pages, Node Backend on Render/Railway, PostgreSQL database).

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, React Router, Axios, React Hook Form, Zod, Recharts, Lucide React |
| **Backend** | Node.js, Express.js, TypeScript, REST API, JWT Authentication, bcryptjs, Zod Validation, Helmet, CORS, Rate Limiting |
| **Database** | PostgreSQL, Prisma ORM, Database Migrations, Seeders, Indexes, Relational Schema |
| **AI Integration**| Google Gen AI SDK (`@google/genai`), Server-Side Context Injection, Configurable Provider/Model |
| **Deployment** | GitHub Actions (Frontend GH Pages), Docker / Render / Railway (Backend & PostgreSQL) |

---

## 📁 Repository Structure

```
LifeOS/
├── frontend/                 # React 18 + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── api/              # Axios client and API services
│   │   ├── components/       # UI, Layout, Task, and Modal components
│   │   ├── context/          # AuthContext provider
│   │   ├── pages/            # Landing, Auth, Dashboard, Tasks, Calendar, AI pages
│   │   ├── routes/           # Protected routes & AppRoutes
│   │   ├── types/            # TypeScript interfaces & types
│   │   └── main.tsx          # Entrypoint
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                  # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── config/           # Prisma client & environment configs
│   │   ├── controllers/      # Route controllers
│   │   ├── middleware/       # Auth, error, and Zod validation middleware
│   │   ├── routes/           # REST endpoints (/auth, /tasks, /ai, /health)
│   │   ├── services/         # Auth, Task, AI, Notification, Analytics services
│   │   ├── validators/       # Zod schemas
│   │   └── server.ts         # Server entrypoint (listens on 0.0.0.0)
│   ├── prisma/
│   │   ├── schema.prisma     # Relational PostgreSQL schema
│   │   └── seed.ts           # Optional development seeder
│   ├── Dockerfile
│   └── package.json
│
├── docs/                     # Documentation
│   ├── API.md                # Complete REST API reference
│   └── DEPLOYMENT.md         # Full deployment guide
│
├── .github/
│   └── workflows/
│       └── deploy-frontend.yml # GitHub Pages automated CI/CD workflow
│
├── package.json              # Root orchestration package.json
└── README.md
```

---

## ⚙️ Local Development Setup

### Prerequisites
- Node.js (v18 or v20 recommended)
- npm or yarn
- PostgreSQL installed locally OR a remote PostgreSQL URL (Supabase/Neon/Render)

### Step 1: Install Dependencies
From the root directory:
```bash
npm run install:all
```

### Step 2: Configure Environment Variables
Create `.env` inside `backend/`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lifeos?schema=public
JWT_SECRET=super_secret_jwt_key_lifeos_dev_12345
AI_PROVIDER=gemini
AI_API_KEY=your_gemini_api_key_here
AI_MODEL=gemini-2.5-flash
```

Create `.env` inside `frontend/`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_BASE_URL=./
```

### Step 3: Run Database Migrations & Seed (Optional)
```bash
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

### Step 4: Launch Development Servers
Run both frontend and backend concurrently:
```bash
npm run dev
```
- Frontend will open at `http://localhost:5173`
- Backend API will run at `http://localhost:5000/api`

During registration, LifeOS sends a six-digit verification code to the provided email. Enter the code on the registration screen to finish creating the account. Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM` in `backend/.env` for email delivery.

---

## 🧪 Testing

Run backend Jest test suite:
```bash
npm run test
```

---

## 🚀 Production Deployment

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for full instructions on deploying PostgreSQL, Node.js Backend to Render/Railway, and React Frontend to GitHub Pages.

---

## 🔒 Security Measures

- **No Plaintext Passwords**: Passwords hashed using bcryptjs with 10 salt rounds.
- **JWT Protection**: Secure HTTP Header bearer authorization.
- **No Secret Exposure**: `AI_API_KEY` and `DATABASE_URL` remain strictly server-side.
- **Helmet Headers & Rate Limiting**: Protection against XSS, clickjacking, and DDoS brute force requests.
- **Strict User Scoping**: All task and analytics queries strictly filtered by `req.user.userId`.

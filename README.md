# STEM Access

An AI-powered career development platform that unifies scholarships, internships, mentorship, STEM learning resources, and technology events for women in STEM — built as the working prototype for the *Final Project: Software Prototype* assignment, based on the STEM Access Software Requirements Specification (SRS).

This repository contains two apps:

- **`backend/`** — a Node.js + Express + PostgreSQL REST API implementing the SRS's functional requirements (FR1–FR9).
- **`frontend/`** — a React (Vite) single-page app implementing the SRS's user interfaces (Section 3.1).

## What's implemented, mapped to the SRS

| SRS requirement | Where it lives |
|---|---|
| FR1 User Registration & Authentication | `backend/src/routes/auth.js` — register, login, JWT, password recovery |
| FR2 User Profile Management | `backend/src/routes/profile.js`, frontend `pages/Profile.jsx` |
| FR3 Opportunity Management | `backend/src/routes/opportunities.js`, frontend `pages/Opportunities.jsx` |
| FR4 AI Career Recommendation System | `backend/src/services/recommendationEngine.js`, `routes/recommendations.js` |
| FR5 Mentorship Management | `backend/src/routes/mentors.js`, frontend `pages/Mentors.jsx`, `MentorshipThread.jsx` |
| FR6 Career and Application Tracking | `backend/src/routes/applications.js`, frontend `pages/Applications.jsx`, `Dashboard.jsx` |
| FR7 Event Management | Modeled as an `Opportunity` with `category: "event"` |
| FR8 Notifications | `backend/src/routes/notifications.js`, frontend `pages/Notifications.jsx` |
| FR9 Administration | `backend/src/routes/admin.js`, frontend `pages/Admin.jsx` |

The four actors from the Use Case Diagram (Appendix B.1 of the SRS) map to the `role` field on `User`: `student`, `mentor`, `partner_organization`, `administrator`.

The AI Recommendation Engine runs as a transparent, rule-based skill/interest matcher by default — no paid API key required, so the whole prototype works end-to-end out of the box. If you set `OPENAI_API_KEY` in the backend's `.env`, it additionally asks OpenAI for a short natural-language explanation of each match (see the comment at the top of `recommendationEngine.js`).

## Tech stack

Frontend: React 18 + Vite + React Router. Backend: Node.js + Express + Sequelize + PostgreSQL. Auth: JWT + bcrypt password hashing. This matches SRS Section 2.4 (Operating Environment) and Section 3.3 (Software Interfaces).

## Project structure

```
stem-access/
  backend/
    src/
      config/db.js          Sequelize + PostgreSQL connection
      models/                One file per entity (User, Profile, Opportunity, ...)
      middleware/auth.js      JWT verification + role-based access control
      routes/                 One file per feature area (auth, profile, opportunities, ...)
      services/recommendationEngine.js   FR4 scoring logic
      seed.js                 Demo data loader
      index.js                Express app entry point
  docs/
    STEM_Access_SRS_v1.1.docx   The Software Requirements Specification this prototype was built from
  frontend/
    src/
      api.js                  Thin fetch wrapper for every backend endpoint
      context/AuthContext.jsx JWT-based auth state
      components/             Navbar, ProtectedRoute, OpportunityCard
      pages/                   One file per screen
```

## Running it locally

You'll need Node.js 18+ and a PostgreSQL database. The easiest zero-install option is a free hosted Postgres (see **Getting a free Postgres database** below) — then you don't need Postgres installed on your machine at all.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set DATABASE_URL to your Postgres connection string,
# and set JWT_SECRET to any long random string.
npm run seed     # creates tables and loads demo data (see accounts below)
npm run dev      # starts the API on http://localhost:5000
```

`npm run seed` prints a set of demo accounts you can log in with immediately — a student, two mentors, a partner organization, and an administrator, all using the password `Password123!`.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
# edit .env if your backend isn't on http://localhost:5000
npm run dev      # starts the app on http://localhost:5173
```

Open `http://localhost:5173`, log in with one of the seeded demo accounts, and explore: browse opportunities, check your AI-generated recommendations on the dashboard, request a mentor, and (as the administrator account) approve pending opportunities.

## Getting a free Postgres database

Any of these give you a `DATABASE_URL` connection string in a couple of minutes, no credit card required:

- **[Neon](https://neon.tech)** — create a project, copy the connection string it gives you. Set `DATABASE_SSL=true` in `backend/.env`.
- **[Supabase](https://supabase.com)** — create a project, go to Project Settings → Database, copy the connection string. Set `DATABASE_SSL=true`.
- **Render's managed Postgres** — if you're already deploying the backend on Render (below), you can create the database there too and skip a separate provider.

## Deploying so you have a public URL

The assignment needs a *publicly accessible deployed URL*. The simplest free-tier combination is: **Neon or Supabase** for the database, **Render** for the backend API, **Vercel** for the frontend.

### Step 1 — Push this repo to your own GitHub

```bash
cd stem-access
git add -A
git commit -m "Initial STEM Access prototype"
# create a new EMPTY public repository on github.com first, then:
git remote add origin https://github.com/<your-username>/stem-access.git
git push -u origin main
```

### Step 2 — Deploy the backend (Render)

1. Go to [render.com](https://render.com) → New → Web Service → connect your GitHub repo.
2. Root directory: `backend`. Build command: `npm install`. Start command: `npm start`.
3. Add environment variables from `backend/.env.example` (`DATABASE_URL`, `DATABASE_SSL=true`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN` — set this to your Vercel URL once you have it in Step 3). Leave `OPENAI_API_KEY` blank unless you have one.
4. Deploy. Once it's live, open a terminal locally (or Render's Shell tab) and run `npm run seed` once against that same `DATABASE_URL` to load demo data — or run it from your own machine with `DATABASE_URL` pointed at the hosted database.
5. Copy the Render URL (e.g. `https://stem-access-api.onrender.com`) — you'll need it in Step 3.

### Step 3 — Deploy the frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) → New Project → import the same GitHub repo.
2. Root directory: `frontend`. Framework preset: Vite (build command `npm run build`, output directory `dist`).
3. Add environment variable `VITE_API_URL` = `https://<your-render-url>/api`.
4. Deploy. Vercel gives you a public URL like `https://stem-access.vercel.app` — **this is the URL to put in your Google Doc.**
5. Go back to Render and update `CORS_ORIGIN` to this Vercel URL, then redeploy the backend so the browser is allowed to call it.

### Step 4 — Verify

Open your Vercel URL, register a new account (or use a seeded demo account), and confirm you can browse opportunities, see recommendations, and (as the seeded admin) approve a pending opportunity. This confirms the "Solution Deployment" and "Operation" rubric items.

## Demo accounts (after `npm run seed`)

| Role | Email | Password |
|---|---|---|
| Administrator | `admin@stemaccess.demo` | `Password123!` |
| Student | `student@stemaccess.demo` | `Password123!` |
| Mentor (software engineering) | `mentor1@stemaccess.demo` | `Password123!` |
| Mentor (data science) | `mentor2@stemaccess.demo` | `Password123!` |
| Partner Organization | `partner@stemaccess.demo` | `Password123!` |

Change these before sharing the deployed URL publicly, or reseed with your own data — `npm run seed` recreates all tables, so re-run it any time you want a clean demo state.

## Notes for graders / reviewers

- The recommendation engine's scoring logic is deterministic and inspectable (see `backend/src/services/recommendationEngine.js`) — this satisfies the SRS's own Safety Requirement that "AI-generated recommendations shall be presented as guidance," while still fully implementing FR4.
- Role-based access control (NFR: Security Requirements) is enforced in `backend/src/middleware/auth.js` via `requireRole(...)`.
- Passwords are hashed with bcrypt and never stored or returned in plaintext (NFR1, Security Requirements).

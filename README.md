<div align="center">
  <img src="frontend/web/src/assets/logo.png" alt="HireFlow Logo" width="120" />

  # HireFlow

  **An AI-Powered Job Board & Modern Recruitment SaaS Platform**

  [![React](https://img.shields.io/badge/React-18-blue.svg?style=flat&logo=react)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-5-purple.svg?style=flat&logo=vite)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
  [![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg?style=flat&logo=nodedotjs)](https://nodejs.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_DB-3ECF8E.svg?style=flat&logo=supabase)](https://supabase.com/)
</div>

<br/>

HireFlow is a next-generation recruitment platform designed to seamlessly connect elite candidates with top-tier companies. It leverages a modern tech stack and an integrated AI matching engine to strip the noise out of hiring.

## ✨ Key Features

### For Candidates
* **AI-Powered Matching:** Real-time semantic analysis scores your resume against job requirements to highlight your best-fit roles.
* **Instant Applications:** One-click apply using your unified HireFlow profile.
* **Rich Company Profiles:** Deep-dive into company culture, tech stacks, employee benefits, and verified reviews.
* **Pipeline Tracking:** Keep track of your saved jobs and active applications in a clean, visual dashboard.

### For Recruiters
* **Streamlined Job Posting:** Create rich, structured job listings in minutes.
* **Kanban Pipeline Board:** Manage applicants through visual stages (Screening, Interview, Offer, Hired) with drag-and-drop simplicity.
* **AI Copilot:** A built-in AI assistant to summarize resumes, draft communication templates, and instantly verify candidate skill fit.
* **Analytics:** High-level overview of hiring velocity and applicant conversion rates.

---

## 🏗️ Architecture & Tech Stack

HireFlow is architected as a monorepo containing distinct frontend and backend services, designed for extreme performance and scalability.

**Frontend (Client SPA)**
* **Core:** React 18 + TypeScript + Vite
* **Routing & State:** React Router v6 (Data API), Zustand (Global UI state)
* **Data Fetching:** TanStack Query (React Query) with optimistic UI updates and prefetching.
* **Styling & UI:** Tailwind CSS, Radix UI primitives, Lucide Icons.
* **Animations:** Framer Motion (Page transitions, micro-interactions).

**Backend (API Services)**
* **Server:** Node.js + Express
* **Database & Auth:** Supabase (PostgreSQL, Row Level Security, Edge Functions)
* **AI Engine:** Integrated NLP matching models via Python/FastAPI endpoints (Internal)
* **Validation:** Zod schemas shared across the monorepo.

---

## ⚡ Performance Optimizations

This platform is heavily optimized for speed and fluidity:
- **Instant Route Transitions:** Data loaders utilize `prefetchQuery` so the UI never blocks. Tab switching is instantaneous and gracefully handles skeleton fallback states.
- **Lazy Loaded Overlays:** Heavy components (like the AI Copilot and Command Menu) are chunked via `React.lazy()` to dramatically reduce initial payload size.
- **Render Cascade Prevention:** Strict memoization (`useCallback`, `React.memo`) ensures the layout shell never re-renders unnecessarily during navigation.

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* pnpm or npm
* A Supabase project (for Auth and Database)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Surendhar-143/hireflow.git
   cd hireflow
   ```

2. **Install dependencies:**
   *(Navigate to the respective directories)*
   ```bash
   cd frontend/web
   npm install
   ```
   ```bash
   cd backend/express-api
   npm install
   ```

3. **Environment Setup:**
   Create `.env` files in both frontend and backend directories.
   
   *Frontend (`frontend/web/.env`)*
   ```env
   VITE_API_URL=http://localhost:8000
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   *Backend (`backend/express-api/.env`)*
   ```env
   PORT=8000
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Run the development servers:**

   *Frontend (Vite)*
   ```bash
   npm run dev
   ```

   *Backend (Express)*
   ```bash
   npm run dev
   ```

5. Open your browser to `http://localhost:3000` to view the application!

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

# Agent context — VeganFit Admin (`veganfit-admin`)

This folder is the **Next.js 14** **admin dashboard**, separate from the main user app so permissions and UI stay isolated.

## Stack

- **Framework**: Next.js (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **API**: Calls the shared backend in `../backend-nodejs` (see `src/lib/api.ts`, `src/lib/env.ts`)

## Important paths

| Area | Location |
|------|----------|
| Routes | `src/app/` (e.g. `login`, `dashboard`) |
| Layout / shell | `src/components/admin-shell.tsx`, `src/app/layout.tsx` |
| Auth context | `src/contexts/auth-context.tsx` |
| API client & env | `src/lib/api.ts`, `src/lib/env.ts` |

## Commands

- Dev: `npm run dev` — **port 3001** (see `package.json`)
- Build / start: also use port 3001

## Conventions for agents

- Do not mix admin-only logic into `../VeganFit-One_Platform_For_All_Vegans`; keep admin flows here.
- When changing API usage, align with `backend-nodejs` routes and the admin service layer there.

---

## Project-specific notes (edit below)

_Add admin roles, allowed origins, staging/production API URLs, and any ops runbooks here._

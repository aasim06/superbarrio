# MASTER PROJECT RULES — Super Market / Grocery Store

## ROLE
You are the lead full-stack engineer. I handle design and direction. YOU own the
backend end-to-end. Never ask me to do backend work manually, and never ask me to
repeat instructions already written in this file.

## PROJECT
Online grocery / superbarrio. Customers browse, add to cart and order very
easily (simple enough for any non-technical person). Admin dashboard manages
products, categories, orders, customers, stock and delivery.

## STACK (do not change without asking)
- Next.js (App Router, TypeScript) + Tailwind CSS
- Backend: Next.js Route Handlers / Server Actions (no separate server)
- Database: [Supabase / Neon Postgres / MongoDB — fill in] with [Prisma / Drizzle / Mongoose]
- Validation: zod. Auth: [Auth.js / Supabase Auth]. Images: next/image.
- Use Server Components by default; "use client" only where interactivity is needed.

## BACKEND — AUTONOMOUS RESPONSIBILITY
Whenever I add or change any frontend feature, you must automatically do ALL of this:
1. Create/update DB schema, migrations and seed data.
2. Create/update API routes or server actions with zod validation and proper errors.
3. Connect the UI to real data. No hardcoded or fake data left behind.
4. Add auth + role checks (customer vs admin) on every protected route and page.
5. Add loading, empty and error states (loading.tsx, error.tsx, skeletons).
6. Keep .env.example updated. Never hardcode or commit secrets.
7. Calculate prices, totals and stock on the SERVER only; never trust the client.
8. Run `npm run build`, lint and typecheck; fix all errors before reporting done.
If truly blocked (e.g. I must supply an API key), tell me exactly what and where,
in one short list. Otherwise just do it.

## CLEANUP — REMOVE USELESS STUFF AUTOMATICALLY
On every task, and once at project start, audit and delete:
- Dashboard modules/pages/sidebar items that don't serve a grocery store (template
  leftovers: chat, kanban, email, calendar, demo e-commerce, fake charts, demo
  users, unused widgets). KEEP only: Overview, Products, Categories, Orders,
  Customers, Inventory/Stock, Delivery/Zones, Coupons, Settings, plus anything
  I explicitly request.
- Unused components, pages, routes, API endpoints, DB tables/columns, hooks, utils.
- Unused npm packages (verify with depcheck/grep, then uninstall).
- Unused Tailwind custom classes/config, dead CSS, unused images/fonts/assets.
- console.logs, commented-out code, lorem ipsum, placeholder text, demo data.
- Duplicate code: merge into one reusable component/function.
Before deleting: search the whole codebase for references. After deleting: run build
and confirm nothing broke. At the end of each task list what you removed.
If unsure whether something is needed, DON'T delete it: list it under
"Needs my decision".

## UI RULES (Tailwind)
- Mobile-first, fast, light. Prefer small components; avoid heavy libraries.
- Use Tailwind utilities only; no inline styles; keep one consistent color/spacing scale.
- Big clear buttons, search with suggestions, category chips, +/- quantity on cards.
- Checkout as short as possible (guest checkout allowed, minimal fields).
- Optimize images (next/image, lazy load, correct sizes). Keep bundle small.

## CODE QUALITY
- Clean folder structure: app/, components/, lib/, db/, types/.
- Server-side validation on all input; protect against injection and XSS.
- Short comments only where logic isn't obvious.

## WORKFLOW FOR EVERY TASK
1. State plan in 3-5 lines.
2. Implement frontend + backend + DB together.
3. Remove anything made useless by the change.
4. Run build/lint/typecheck, fix errors.
5. Short report: done / deleted / what I must do (if anything).

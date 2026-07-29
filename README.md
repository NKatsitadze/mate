# Next.js Starter

Production-ready Next.js 16 starter with App Router, TypeScript, Tailwind CSS,
shadcn/ui, NextAuth v5, MongoDB via Mongoose, Zustand, Zod, and Vitest.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router |
| Language | TypeScript strict mode |
| Auth | NextAuth v5 with Credentials and Google OAuth |
| Database | MongoDB with Mongoose |
| Styling | Tailwind CSS and shadcn/ui |
| Validation | Zod, react-hook-form, zodResolver |
| State | Zustand vanilla store with React context |
| Testing | Vitest and Testing Library |
| Linting | ESLint, Next core web vitals, import/order |
| Git hooks | Husky pre-commit: lint, build, test:run |

## Getting Started

Install dependencies:

```bash
npm install
```

Create local environment:

```bash
cp .env.example .env.local
```

Required values:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
MONGO_URI=mongodb://localhost:27017/nextjs-starter
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

Start development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev          # Start local dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run typecheck    # TypeScript check
npm run test         # Vitest watch mode
npm run test:run     # Vitest one-shot run
npm run test:cov     # Vitest coverage report
```

Run one test file:

```bash
npx vitest run src/features/auth/service/auth.service.spec.ts
```

## Project Structure

```text
src/
  app/
    (public)/                  Public routes: home, sign-in, sign-up
    (protected)/               Auth-protected routes: dashboard
    api/                       Thin route handlers
    globals.css                Tailwind theme and CSS variables
    layout.tsx                 Root metadata, fonts, theme provider
  features/
    auth/
      components/              Forms and auth page shell
      hooks/                   Store hook and async auth actions
      repository/              Mongoose query layer
      schema/                  User schema and inferred document type
      service/                 Business logic returning ServiceResult
      store/                   Zustand vanilla store factory
      types/                   Auth feature types
      validations/             Zod schemas
    dashboard/
      components/              Protected dashboard UI
    marketing/
      components/              Public home page UI
  shared/
    components/                Layout and shadcn/ui primitives
    const/                     Static app, route, nav, and page constants
    hooks/                     Cross-feature React hooks
    lib/                       OOP singleton libraries with tests
    middleware/                Request validation helpers
    providers/                 App providers
    types/                     Shared service/result types
    utils/                     Small shared utilities with tests
  proxy.ts                     Cookie-based route protection
```

## Architecture Rules

- Page files stay thin. Layout and structural UI live in components.
- API routes validate input with `validateBody`, call one service, and return JSON.
- Services own business decisions and always return `{ data, status }`.
- Repositories only perform raw database queries and call `mongo.connect()` first.
- Static arrays and reusable constants live in `src/shared/const`.
- Cross-directory imports use the `@/` alias.
- Forms use `react-hook-form` with `zodResolver`.
- Shared `lib` files use class syntax, export a singleton, and have co-located tests.

## Docker

Start app and local MongoDB:

```bash
docker compose up
```

Run in background:

```bash
docker compose up -d
```

Rebuild:

```bash
docker compose up --build
```

Stop:

```bash
docker compose down
```

Wipe local MongoDB data:

```bash
docker compose down -v
```

## Bootstrapping the First Admin

Registration is gated by an email allowlist (`AllowedEmail` collection) — only emails an
admin has explicitly added can create an account, via credentials or Google OAuth. Since
adding an allowlist entry itself requires an admin, the very first admin has to be created
manually, once:

1. Connect to MongoDB (e.g. via `mongosh` or MongoDB Compass) and insert one allowed email:
   ```js
   db.allowedemails.insertOne({ email: 'you@example.com', addedByAdminId: new ObjectId(), createdAt: new Date(), updatedAt: new Date() })
   ```
2. Register normally through the app with that email.
3. Flip that user's `role` to `admin` directly in the database:
   ```js
   db.users.updateOne({ email: 'you@example.com' }, { $set: { role: 'admin' } })
   ```

From then on, that admin can add further allowed emails from `/admin/allowlist` in the app.

## Production Notes

- `next.config.ts` pins Turbopack root to this repository to avoid parent-lockfile
  workspace inference.
- Remote image optimization is limited to Google OAuth avatars by default.
- `npm audit fix` has been applied without force. A package override keeps
  transitive `postcss` on the patched version used by the toolchain.

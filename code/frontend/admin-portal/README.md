# Admin Portal

React 19 + Vite admin portal for the Hierarchical RAG System.

## Purpose

This frontend is the role-based administration surface for:

- sign-in with cookie-based authentication
- role and permission management views
- RBAC-oriented navigation for `users`, `roles`, and `permissions`

The current login flow is built around backend-managed sessions:

- login API: `POST /api/v1/auth/login`
- current user API: `GET /api/v1/auth/me`
- logout API: `POST /api/v1/auth/logout`

The backend returns the authenticated profile with:

- `id`
- `email`
- `roles`
- `permissions`

## Local setup

1. Install dependencies.

```bash
npm install
```

2. Create a local env file.

```bash
copy .env.example .env
```

3. Set the backend base URL.

```env
VITE_BASEURL=http://localhost:3000/api/v1
```

4. Start the development server.

```bash
npm run dev
```

## Scripts

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run preview`

## Login flow

The frontend now implements the Sprint 1 login MVP:

- sign-in form posts credentials to the NestJS backend
- authenticated user profile is stored in the shared auth session query
- protected routes under `/_main` redirect unauthenticated users to `/auth/sign-in`
- `/auth/sign-in` redirects authenticated users back to `/`
- logout clears the server cookie and resets the frontend auth session

## Route structure

- `/auth/sign-in`
- `/`
- `/users`
- `/roles`
- `/permissions`

## Backend requirements

For login to work locally, the NestJS backend must:

- be running on the URL configured in `VITE_BASEURL`
- allow the frontend origin through `FRONTEND_ORIGIN`
- issue the auth cookie successfully

The default backend development account is:

- Email: `admin@company.com`
- Password: `ChangeMe123!`

## Verification notes

- `npx tsc -b` is the quickest frontend typecheck.
- Full `npm run build` may fail in restricted environments if Vite/Tailwind native dependencies cannot load.

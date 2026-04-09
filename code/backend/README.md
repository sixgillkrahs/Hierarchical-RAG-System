# Hierarchical RAG Backend

NestJS backend for the `Hierarchical-RAG-System` repository with PostgreSQL-backed RBAC.

## What is included

- NestJS application bootstrap with global validation, CORS, versioning, and Swagger.
- PostgreSQL integration via TypeORM and migration support.
- JWT authentication in `HttpOnly` cookies with role-based access control using permissions.
- Seeded default admin account for local development.
- `GET /api/v1/health` for health checks.
- `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, and `GET /api/v1/auth/me`.
- Protected admin endpoints for `users`, `roles`, `permissions`, and `rag`.
- Docker, ESLint, Jest, and environment validation.

## Quick start

```bash
npm install
copy .env.example .env
npm run migration:run
npm run start:dev
```

Swagger UI will be available at `http://localhost:3000/api/docs`.

## PostgreSQL

Run PostgreSQL locally with Docker:

```bash
docker compose up -d postgres
```

The default development admin user is defined in `.env.example`:

- Email: `admin@company.com`
- Password: `ChangeMe123!`

The admin user is seeded automatically on application startup if it does not exist yet.

## Authentication model

- `POST /api/v1/auth/login` sets a `HttpOnly` cookie instead of returning a bearer token for the browser to store.
- `GET /api/v1/auth/me` and protected routes read the JWT from that cookie.
- `POST /api/v1/auth/logout` clears the auth cookie.
- Cross-origin requests require `withCredentials: true` on the frontend and `credentials: true` on backend CORS.

## RBAC model

- A `user` can have multiple `roles`.
- A `role` can have multiple `permissions`.
- Endpoint access is protected with `@RequirePermissions(...)`.
- Public endpoints are explicitly marked with `@Public()`.

Default roles:

- `super_admin`: full access.
- `viewer`: read-only access to metadata and admin listings.

Default permissions include:

- `users.read`
- `users.manage`
- `roles.read`
- `roles.manage`
- `permissions.read`
- `rag.read`
- `rag.query`

## Environment variables

See `.env.example` for the supported configuration keys.

## Main endpoints

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `GET /api/v1/users`
- `GET /api/v1/roles`
- `GET /api/v1/permissions`
- `GET /api/v1/rag/capabilities`
- `POST /api/v1/rag/query`

## Next implementation steps

1. Add refresh tokens and password reset flow.
2. Add user and role mutation endpoints with audit logging.
3. Replace the placeholder `RagService` with ingestion, retrieval, reranking, and generation logic.

# AGENTS.md

## Repository expectations

- This repository uses:
  - NestJS for backend APIs
  - PostgreSQL for relational persistence
  - MinIO for object storage
  - Next.js App Router for frontend
  - shadcn/ui for UI primitives
- Prefer targeted edits over broad refactors.
- Keep implementation aligned with the existing folder structure, naming, and coding style.
- Do not introduce new dependencies unless clearly justified by the task.
- Preserve backward compatibility unless the task explicitly requests a breaking change.

## Full-stack rules

- When implementing a feature, trace the full path before editing:
  1. Next.js route/page/component
  2. client state, form, validation, and API calls
  3. NestJS controller, DTO, guards, service, and repository
  4. database schema / migration / query layer
  5. MinIO upload/download lifecycle if files are involved
  6. tests and docs affected
- If an API contract changes, update frontend and backend in the same task.
- Validate user input on both client and server when relevant.
- For file upload flows:
  - verify content type and size
  - avoid trusting client-provided metadata
  - store stable object keys
  - keep DB metadata in sync with MinIO objects
- For PostgreSQL changes:
  - prefer additive migrations
  - avoid destructive schema changes unless explicitly requested
  - update seed/test data if needed
- For shadcn/ui work:
  - preserve design consistency
  - handle loading, empty, success, and error states
  - keep accessibility in mind

## Validation expectations

- Run the smallest relevant verification set after edits:
  - lint
  - typecheck
  - targeted unit/integration tests
  - build check when the change affects app wiring
- Never claim something is tested unless it was actually run.
- Final summaries must include:
  - files changed
  - why each change was needed
  - what was validated
  - risks / follow-ups

# Hierarchical-RAG-System

## Purpose

This repository is a multi-service scaffold for a hierarchical RAG platform with:

- a Python storage backend for MinIO object operations
- a NestJS backend for auth, RBAC, admin APIs, and the future RAG orchestration layer
- a React admin portal for operators

The project is not yet a fully implemented RAG system. The RBAC and storage layers are the most complete parts. The actual retrieval/generation pipeline is still scaffolded.

## Repo Layout

```text
ai/
  FastAPI service for MinIO-backed file upload and folder-prefix operations

backend/
  NestJS service for auth, RBAC, admin APIs, and RAG endpoints

frontend/admin-portal/
  React 19 + Vite admin UI
```

## Current Architecture

### Runtime flow

```text
Frontend (React admin portal)
  -> Backend (NestJS)
    -> AI service (FastAPI)
      -> MinIO
```

### Responsibilities by service

#### `ai`

- Framework: FastAPI
- Entry point: `ai/app/main.py`
- Main logic: `ai/app/services/storage.py`
- Purpose:
  - upload files to MinIO
  - create folder prefixes
  - list direct child folders
  - rename folder prefixes by copy + delete
  - delete folder prefixes recursively

This service is synchronous at the storage layer and wrapped with `run_in_threadpool` in routes.

#### `backend`

- Framework: NestJS
- Entry point: `backend/src/main.ts`
- Purpose:
  - JWT auth using `HttpOnly` cookies
  - RBAC with users, roles, permissions
  - admin APIs for users, roles, permissions
  - proxy folder operations to the Python API
  - expose placeholder RAG endpoints

Important modules:

- `auth`: login/logout/current-user
- `users`, `roles`, `permissions`: RBAC read APIs and permission creation
- `folders`: calls Python API and caches folder listings in memory
- `rag`: currently scaffold only
- `database`: TypeORM + migrations

#### `frontend/admin-portal`

- Framework: React 19 + Vite + TanStack Router
- Entry point: `frontend/admin-portal/src/main.tsx`
- Main characteristics:
  - sign-in flow is wired to backend auth
  - most RBAC screens are still static/demo UI
  - axios uses `withCredentials: true` for cookie auth

## What Is Implemented

### Stable enough to work

- NestJS bootstrap with Swagger, validation, versioning, CORS
- PostgreSQL-backed RBAC schema
- default roles and permissions seeding
- default admin seeding
- login/logout/me flow with cookie auth
- protected RBAC endpoints
- FastAPI MinIO storage endpoints
- NestJS folder proxy service with small in-memory cache

### Still scaffolded or incomplete

- real document ingestion
- chunking and parent/child hierarchy logic
- embeddings
- vector database integration
- retrieval and reranking
- final answer generation
- frontend data binding for users/roles/permissions screens
- refresh token flow
- user/role mutation workflows

## Backend API Notes

### NestJS base

- Global prefix: `/api`
- URI versioning enabled
- Typical route format: `/api/v1/...`
- Swagger: `/api/docs`

### Public NestJS endpoints

- `GET /api/v1`
- `GET /api/v1/health`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`

### Protected NestJS endpoints

- `GET /api/v1/auth/me`
- `GET /api/v1/users`
- `GET /api/v1/roles`
- `GET /api/v1/permissions`
- `POST /api/v1/permissions`
- `GET /api/v1/folders`
- `POST /api/v1/folders`
- `PATCH /api/v1/folders`
- `DELETE /api/v1/folders`
- `GET /api/v1/rag/capabilities`
- `POST /api/v1/rag/query`

### FastAPI base

- Default local base: `http://127.0.0.1:8000`

Endpoints:

- `GET /`
- `GET /health`
- `GET /folders`
- `POST /folders`
- `PATCH /folders`
- `DELETE /folders`
- `POST /files/upload`

## RBAC Model

Default permissions include:

- `users.read`
- `users.manage`
- `roles.read`
- `roles.manage`
- `permissions.read`
- `permissions.manage`
- `storage.read`
- `storage.manage`
- `rag.read`
- `rag.query`
- `system.read`

Default roles:

- `super_admin`: full access
- `viewer`: read-only access to admin metadata/resources

## Important Files

### Python service

- `ai/app/main.py`
- `ai/app/core/config.py`
- `ai/app/api/router.py`
- `ai/app/api/routes/files.py`
- `ai/app/api/routes/folders.py`
- `ai/app/services/storage.py`

### NestJS backend

- `backend/src/main.ts`
- `backend/src/app.module.ts`
- `backend/src/common/config/env.validation.ts`
- `backend/src/auth/presentation/http/auth.controller.ts`
- `backend/src/folders/folders.service.ts`
- `backend/src/rag/application/handlers/query-rag.handler.ts`
- `backend/src/database/migrations/1712400000000-create-rbac-tables.ts`

### Frontend

- `frontend/admin-portal/src/main.tsx`
- `frontend/admin-portal/src/lib/axios/axios.ts`
- `frontend/admin-portal/src/shared/auth/AuthService.ts`
- `frontend/admin-portal/src/routes/auth/sign-in.tsx`
- `frontend/admin-portal/src/routes/_main/users.tsx`
- `frontend/admin-portal/src/routes/_main/roles.tsx`
- `frontend/admin-portal/src/routes/_main/permissions.tsx`

## Environment and Local Run

### Python service

Expected env is based on `ai/.env.example`.

Install and run:

```powershell
cd ai
python -m pip install -r requirements.txt
python -m app.main
```

Optional MinIO for local dev:

```powershell
docker compose -f docker-compose.minio.yml up -d
```

### NestJS backend

Expected env is based on `backend/.env.example`.

Install and run:

```powershell
cd backend
npm install
npm run migration:run
npm run dev
```

Local PostgreSQL can be started with:

```powershell
docker compose up -d postgres
```

### Frontend

```powershell
cd frontend/admin-portal
npm install
npm run dev
```

Set `VITE_BASEURL` to the NestJS backend base URL, typically:

```text
http://localhost:3000/api/v1
```

## Known Operational Notes

### Backend request hang fix

The NestJS bootstrap must use:

```ts
app.use(cookieParser());
```

Do not change this to `app.use(cookieParser)`. Passing the middleware factory itself causes requests to hang instead of reaching controllers.

### Port conflicts

The backend defaults to port `3000`. If startup fails with `EADDRINUSE`, another process is already bound to that port.

### DB expectations

The NestJS backend expects PostgreSQL by default. Tests can run with SQLite in memory, but normal local development uses Postgres.

### Python service dependency

Folder APIs in NestJS depend on the Python service through `PYTHON_API_BASE_URL`. If the Python service is down, folder endpoints in NestJS will fail or time out.

## Testing Status

Backend tests currently cover:

- app metadata unit test
- e2e health check
- auth login/logout
- protected RBAC access
- placeholder RAG query

Useful commands:

```powershell
cd backend
npm run build
npm run test
npm run test:e2e
```

## Guidance For Future AI Sessions

If you are continuing work in this repository:

1. Treat this as a multi-service system, not a single app.
2. Do not assume the `rag` module is production-ready. It is mostly contract/scaffold code.
3. Prefer preserving the current separation:
   - NestJS = auth/RBAC/admin orchestration
   - FastAPI = storage/object operations
4. Check whether the frontend screen you are editing is static/demo before wiring new data logic.
5. If backend requests appear to hang, verify middleware bootstrap and port conflicts first.
6. If working on folders/storage from the NestJS side, remember the real business logic lives in the Python service.

## Suggested Next High-Value Work

- bind frontend RBAC pages to real backend data
- add role/user mutation flows
- implement real RAG ingestion and retrieval pipeline
- add integration tests for folder proxying between NestJS and FastAPI
- add health/readiness checks for downstream Python API and MinIO

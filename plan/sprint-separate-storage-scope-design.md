# Storage Scope Design Plan

## Goal

Design a folder-tree access model where each role can access only its allowed
subtree. Example: `cto` can access `/cto` and every folder below it, but not
parallel branches.

This plan is intentionally scheduled as a separate sprint from the current
document upload/listing work.

## Problem Summary

The current system only has module-level RBAC:

- `storage.read`
- `storage.manage`

That is enough to decide whether a user can enter the storage module, but it is
not enough to decide which folder subtree the user can see or modify.

What is missing:

- subtree-level read/write scope
- inheritance down the folder tree
- stable authorization that survives folder rename and tree changes

## Recommended Direction

Use a two-layer authorization model:

1. Global RBAC for module access
2. Hierarchical storage scopes for subtree access

Meaning:

- RBAC answers: "Can this user use storage features at all?"
- Storage scope answers: "Which folder subtree can this user read or manage?"

## Sprint Split

### Sprint A

Keep current work focused on:

- login/session
- document upload/listing
- MinIO integration
- PostgreSQL metadata

No major authorization redesign in this sprint.

### Sprint B

Implement hierarchical storage authorization.

This design document is for Sprint B.

## Target Access Rules

Examples:

- `super_admin` can access all nodes
- `cto` can access `/cto` and all descendants
- `finance_manager` can access `/finance` and descendants
- `finance_uploader` can upload only under `/finance/incoming`
- a user with multiple roles gets the union of allowed scopes

## Design Options

## Option 1: Path Prefix Scope

Add role-to-prefix mapping such as:

- role `cto` -> `path_prefix = "cto"` -> `capability = read/manage`

Rule:

- path is allowed if requested path equals prefix
- or requested path starts with `prefix + "/"`.

Pros:

- fastest to ship
- low migration cost
- fits current `documents.folderPath` text model

Cons:

- rename/move folders is harder
- authorization depends on string path correctness
- exceptions and future deny rules become messy

## Option 2: Folder Node Tree

Create stable storage nodes with parent-child relations and assign scopes by
node id instead of raw path.

Pros:

- better long-term model
- rename-safe
- easier audit
- better support for tree traversal and inherited access

Cons:

- larger migration
- more backend work
- requires storage tree normalization

## Recommendation

Use a phased approach:

1. Sprint B MVP: path-prefix scopes
2. Future sprint: migrate to stable folder nodes if the tree becomes central to
   the product

That gives a fast delivery path without locking the system permanently into
path-only authorization.

## Proposed Sprint B MVP Schema

### New Table: `role_storage_scopes`

Suggested fields:

- `id`
- `role_id`
- `path_prefix`
- `capability`
- `inherit_children`
- `created_at`
- `updated_at`

### Capability Values

Suggested enum:

- `read`
- `manage`

Interpretation:

- `read` can list folders and documents within allowed subtree
- `manage` can upload/create/rename/delete within allowed subtree

### Inheritance Rule

- if `inherit_children = true`, scope applies to all descendants
- if `false`, scope applies only to the exact node/prefix

For the first version, default should be `true`.

## Authorization Model

### Layer 1: RBAC

Keep:

- `storage.read`
- `storage.manage`

These continue to gate module-level entry.

### Layer 2: Storage Scope Check

Every storage API must also validate requested path against effective scopes.

Examples:

- `GET /folders?current_path=cto/contracts`
  - allowed only if user has read scope on `cto` or `cto/contracts`
- `GET /documents?current_path=cto/contracts`
  - same rule
- `POST /documents/upload`
  - allowed only if target `folder_path` is within a manage scope
- `POST /folders`
  - allowed only if new folder path is within a manage scope
- `PATCH /folders`
  - source and destination must both be allowed
- `DELETE /folders`
  - target path must be within a manage scope

## Effective Scope Resolution

For a given user:

1. load all roles
2. load all storage scopes from those roles
3. normalize path prefixes
4. union all allowed scopes
5. evaluate request path against the union

Manage implies read for the same subtree.

## Backend Changes

### New Domain Area

Add a dedicated storage-scope module:

- entity for `role_storage_scopes`
- repository/service for effective scope resolution
- reusable path authorization helper

### Path Normalization

All checks must normalize path before comparison:

- trim spaces
- replace backslashes with slashes
- remove leading and trailing slash
- reject `.` and `..`

### Shared Checks

Introduce shared helpers:

- `canReadPath(user, path)`
- `canManagePath(user, path)`
- `filterReadableDocuments(user, docs)`

The storage controllers should call these before hitting business logic.

## Frontend Changes

Frontend should not be the source of truth for security, but it should reflect
effective access:

- only show folders user can access
- disable upload/create/rename/delete when current path is outside manage scope
- hide or disable actions clearly
- show a permission message when user enters a readable-but-not-manageable node

Frontend may receive effective scopes after login or from a dedicated storage
scope endpoint.

## Suggested API Contract

### Option A: Include in Auth Profile

Return effective storage scopes in `/auth/me`.

Example:

```json
{
  "id": "user-id",
  "email": "cto@company.com",
  "permissions": ["storage.read"],
  "storageScopes": [
    {
      "pathPrefix": "cto",
      "capability": "manage",
      "inheritChildren": true
    }
  ]
}
```

### Option B: Dedicated Endpoint

Add:

- `GET /storage/scopes/me`

This is cleaner if the scope payload becomes large.

Recommendation:

- start with dedicated endpoint if scope logic may grow
- keep `/auth/me` lighter

## Query Rules for Documents

For current repo state, documents are stored with `folderPath` text. MVP query
filter can be:

- exact prefix match for current folder listing
- plus authorization check on requested current path

Do not fetch all documents then filter in memory.
Authorization should be applied before or during query planning.

## Query Rules for Folder Listing

Folder listing should be restricted to the visible subtree only.

If user is at root:

- return only top-level folders they are allowed to see

If user is inside a subtree:

- return only child folders that remain inside allowed scopes

## Rename and Delete Rules

These operations are sensitive.

For rename:

- user must manage source path
- user must manage destination path
- metadata and MinIO move must stay in sync

For delete:

- user must manage target path
- delete must remove both MinIO objects and PostgreSQL metadata

## Audit Requirements

Add audit logs for:

- upload
- delete
- rename
- scope change

At minimum log:

- actor user id
- actor roles
- action
- target path
- timestamp

## Rollout Plan

### Phase 1

- add `role_storage_scopes`
- seed initial scopes manually
- enforce checks in backend
- update frontend to consume scope visibility

### Phase 2

- add admin UI to manage storage scopes
- add audit log viewer
- add tests for scope inheritance and edge cases

### Phase 3

- evaluate migration from path-prefix model to stable folder-node model

## Test Plan

Must cover:

- user with no storage scope
- user with read-only subtree
- user with manage subtree
- multiple roles with merged scopes
- exact node match
- descendant inheritance
- forbidden sibling branch
- rename source allowed but destination forbidden
- delete forbidden path
- upload forbidden path
- root listing with multiple allowed top-level branches

## Risks

- path-only model is sensitive to rename/move complexity
- missing normalization will create security gaps
- frontend-only filtering is not enough
- role union logic can accidentally overgrant if implemented loosely

## Final Recommendation

For the next sprint, implement `RBAC + path-prefix storage scopes`.

Do not overload the current `permissions` table for subtree access. Keep module
permission and resource scope separate.

If storage becomes a long-term core feature, plan a later migration to
`storage_nodes + role_storage_scopes + folder_id` for stronger hierarchy
integrity.

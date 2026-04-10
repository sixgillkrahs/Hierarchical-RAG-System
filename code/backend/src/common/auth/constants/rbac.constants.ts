export const DEFAULT_PERMISSION_DEFINITIONS = [
  {
    code: 'users.read',
    description: 'View users and their assigned roles.',
    route: '/users',
  },
  {
    code: 'users.manage',
    description: 'Create, update, and deactivate users.',
    route: '/users',
  },
  {
    code: 'roles.read',
    description: 'View role definitions.',
    route: '/roles',
  },
  {
    code: 'roles.manage',
    description: 'Create and update roles.',
    route: '/roles',
  },
  {
    code: 'permissions.read',
    description: 'View permission catalog.',
    route: '/permissions',
  },
  {
    code: 'permissions.manage',
    description: 'Create and update permissions.',
    route: '/permissions',
  },
  {
    code: 'storage.read',
    description: 'View storage folders and object metadata.',
    route: '/storage',
  },
  {
    code: 'storage.manage',
    description: 'Upload files and create storage folders.',
    route: '/storage',
  },
  {
    code: 'rag.read',
    description: 'View RAG service capabilities.',
    route: '/rag',
  },
  {
    code: 'rag.query',
    description: 'Execute RAG queries.',
    route: '/rag',
  },
  {
    code: 'system.read',
    description: 'Read system metadata.',
    route: '/',
  },
] as const;

export const DEFAULT_ROLE_DEFINITIONS = [
  {
    name: 'super_admin',
    description: 'Full access across the administrative platform.',
    permissions: DEFAULT_PERMISSION_DEFINITIONS.map(({ code }) => code),
  },
  {
    name: 'viewer',
    description: 'Read-only access to administrative resources.',
    permissions: [
      'users.read',
      'roles.read',
      'permissions.read',
      'storage.read',
      'rag.read',
      'system.read',
    ],
  },
] as const;

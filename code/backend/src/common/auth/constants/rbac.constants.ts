export const DEFAULT_PERMISSION_DEFINITIONS = [
  { code: 'users.read', description: 'View users and their assigned roles.' },
  { code: 'users.manage', description: 'Create, update, and deactivate users.' },
  { code: 'roles.read', description: 'View role definitions.' },
  { code: 'roles.manage', description: 'Create and update roles.' },
  { code: 'permissions.read', description: 'View permission catalog.' },
  { code: 'permissions.manage', description: 'Create and update permissions.' },
  { code: 'storage.read', description: 'View storage folders and object metadata.' },
  { code: 'storage.manage', description: 'Upload files and create storage folders.' },
  { code: 'rag.read', description: 'View RAG service capabilities.' },
  { code: 'rag.query', description: 'Execute RAG queries.' },
  { code: 'system.read', description: 'Read system metadata.' },
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

export interface AuthenticatedUser {
  email: string;
  permissions: string[];
  roles: string[];
  userId: string;
}


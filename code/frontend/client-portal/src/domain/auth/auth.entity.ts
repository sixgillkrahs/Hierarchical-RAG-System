export interface AuthProfile {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
  routes: string[];
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignInResponse {
  success: boolean;
  message: string;
  user?: AuthProfile;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

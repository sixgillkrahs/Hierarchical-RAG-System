import { httpClient } from '../http/client';
import type { SignInPayload, SignInResponse, LogoutResponse, AuthProfile } from '../../domain/auth/auth.entity';

export const AuthRepository = {
  login: async (payload: SignInPayload): Promise<SignInResponse> => {
    return httpClient.post('/auth/login', payload);
  },
  
  logout: async (): Promise<LogoutResponse> => {
    return httpClient.post('/auth/logout');
  },
  
  me: async (): Promise<AuthProfile> => {
    return httpClient.get('/auth/me');
  }
};

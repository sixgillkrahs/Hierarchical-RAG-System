import { useMutation } from '@tanstack/react-query';
import { AuthRepository } from '../../infrastructure/auth/auth.repository';
import type { SignInPayload, SignInResponse } from '../../domain/auth/auth.entity';
import { useNavigate } from '@tanstack/react-router';

export const useLogin = () => {
  const navigate = useNavigate();

  return useMutation<SignInResponse, Error, SignInPayload>({
    mutationFn: (payload) => AuthRepository.login(payload),
    onSuccess: () => {
      // Navigate to homepage after successful login
      navigate({ to: '/' });
    },
  });
};

import { createFileRoute } from '@tanstack/react-router';
import { LoginView } from '../presentation/auth/LoginView';

export const Route = createFileRoute('/login')({
  component: LoginView,
});

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLogin } from '../../application/auth/useLogin';
import { Card, Input, Button } from '@heroui/react';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required').min(4, 'Password must be at least 4 characters'),
});

type LoginSchema = z.infer<typeof loginSchema>;

export function LoginView() {
  const [globalError, setGlobalError] = useState('');
  const { mutate: login, isPending, isSuccess } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const onSubmit = (data: LoginSchema) => {
    setGlobalError('');
    login(data, {
      onError: (error: any) => {
        setGlobalError(
          error.response?.data?.message || 'Login failed. Please verify your credentials.'
        );
      },
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-teal-900 p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl">
        <Card.Header className="flex flex-col gap-1 items-center justify-center text-white pt-8 pb-4">
          <h2 className="text-3xl font-bold tracking-tight">Welcome Back</h2>
          <p className="text-white/80 text-sm">Login to access your Client Portal</p>
        </Card.Header>
        
        <Card.Content className="px-8 pb-8 pt-4">
          {globalError && (
            <div className="bg-red-500/20 border border-red-500/40 p-3 rounded-lg text-red-200 text-sm mb-6 text-center backdrop-blur-sm">
              {globalError}
            </div>
          )}
          
          {isSuccess && (
            <div className="bg-green-500/20 border border-green-500/40 p-3 rounded-lg text-green-200 text-sm mb-6 text-center backdrop-blur-sm">
              Login successful! Redirecting...
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <label className="text-white/90 text-xs font-semibold uppercase tracking-wide">
                Email Address
              </label>
              <Input
                {...register('email')}
                placeholder="operator@rag.internal"
                type="email"
                disabled={isPending}
                className={`bg-white/5 data-[hover=true]:bg-white/10 border ${errors.email ? 'border-red-400 focus:ring-red-400/50' : 'border-white/20 focus:ring-white/10'} text-white rounded-xl px-4 py-3`}
              />
              {errors.email && (
                <span className="text-red-300 text-xs mt-1 font-medium">{errors.email.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-white/90 text-xs font-semibold uppercase tracking-wide">
                Password
              </label>
              <Input
                {...register('password')}
                placeholder="••••••••"
                type="password"
                disabled={isPending}
                className={`bg-white/5 data-[hover=true]:bg-white/10 border ${errors.password ? 'border-red-400 focus:ring-red-400/50' : 'border-white/20 focus:ring-white/10'} text-white rounded-xl px-4 py-3`}
              />
              {errors.password && (
                <span className="text-red-300 text-xs mt-1 font-medium">{errors.password.message}</span>
              )}
            </div>

            <Button
              type="submit"
              isDisabled={!isValid || isPending}
              className="w-full mt-4 bg-white text-gray-900 font-bold py-3 rounded-xl disabled:opacity-50"
            >
              {isPending ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
}

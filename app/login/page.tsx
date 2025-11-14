'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Введите корректный e-mail'),
  password: z.string().min(6, 'Минимум 6 символов'),
  remember: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { remember: true } });

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remember: values.remember }),
      });
      router.push('/dashboard');
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Добро пожаловать</h1>
          <p className="mt-2 text-white/70">Войдите в аккаунт, чтобы продолжить</p>
        </div>
        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="input"
                {...register('email')}
              />
              {errors.email && <p className="error">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label" htmlFor="password">
                Пароль
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="input"
                {...register('password')}
              />
              {errors.password && <p className="error">{errors.password.message}</p>}
            </div>
            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm text-white/80">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-white/10"
                  {...register('remember')}
                />
                Запомнить меня
              </label>
              <button type="button" className="btn-ghost">
                Забыли пароль?
              </button>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Входим…' : 'Войти'}
            </button>
          </form>
        </div>
        <p className="mt-6 text-center text-sm text-white/70">
          Нет аккаунта? <button className="btn-ghost">Создать</button>
        </p>
      </div>
    </main>
  );
}

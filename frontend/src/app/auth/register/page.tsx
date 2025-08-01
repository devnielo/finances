'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  CreditCard, 
  Mail, 
  Lock, 
  User, 
  AlertCircle,
  ArrowLeft,
  Check
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';
import { useAuthActions } from '@/stores/authStore';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuthActions();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await registerUser(data);
      
      // Redirect to dashboard on successful registration
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    Object.values(checks).forEach(check => {
      if (check) strength++;
    });

    return { strength, checks };
  };

  const passwordStrength = password ? getPasswordStrength(password) : {
    strength: 0,
    checks: {
      length: false,
      lowercase: false,
      uppercase: false,
      number: false,
      special: false,
    }
  };

  const getStrengthColor = (strength: number) => {
    if (strength < 2) return 'bg-error';
    if (strength < 4) return 'bg-warning';
    return 'bg-success';
  };

  const getStrengthText = (strength: number) => {
    if (strength < 2) return 'Débil';
    if (strength < 4) return 'Media';
    return 'Fuerte';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-primary via-background-secondary to-background-tertiary flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(139,92,246,0.1),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.08),transparent_70%)]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back to Home */}
        <Link
          href="/"
          className="inline-flex items-center text-text-secondary hover:text-text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inicio
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="glass">
            <CardHeader className="text-center">
              {/* Logo */}
              <div className="w-16 h-16 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              
              <CardTitle className="text-2xl font-bold text-text-primary">
                Crear cuenta
              </CardTitle>
              <CardDescription>
                Únete a FinanceApp y toma control de tus finanzas
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg flex items-center space-x-3"
                >
                  <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
                  <p className="text-sm text-error">{error}</p>
                </motion.div>
              )}

              {/* Register Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name Field */}
                <div>
                  <Input
                    name="name"
                    type="text"
                    label="Nombre completo"
                    placeholder="Tu nombre completo"
                    leftIcon={<User className="w-4 h-4" />}
                    error={errors.name?.message}
                    disabled={isLoading}
                    autoComplete="name"
                    onChange={register('name').onChange}
                    onBlur={register('name').onBlur}
                  />
                </div>

                {/* Email Field */}
                <div>
                  <Input
                    name="email"
                    type="email"
                    label="Correo electrónico"
                    placeholder="tu@email.com"
                    leftIcon={<Mail className="w-4 h-4" />}
                    error={errors.email?.message}
                    disabled={isLoading}
                    autoComplete="email"
                    onChange={register('email').onChange}
                    onBlur={register('email').onBlur}
                  />
                </div>

                {/* Password Field */}
                <div>
                  <Input
                    name="password"
                    type="password"
                    label="Contraseña"
                    placeholder="Crea una contraseña segura"
                    leftIcon={<Lock className="w-4 h-4" />}
                    error={errors.password?.message}
                    disabled={isLoading}
                    autoComplete="new-password"
                    onChange={register('password').onChange}
                    onBlur={register('password').onBlur}
                  />

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-muted">Seguridad de la contraseña</span>
                        <span className={cn(
                          'text-xs font-medium',
                          passwordStrength.strength < 2 ? 'text-error' :
                          passwordStrength.strength < 4 ? 'text-warning' : 'text-success'
                        )}>
                          {getStrengthText(passwordStrength.strength)}
                        </span>
                      </div>
                      
                      <div className="w-full bg-background-secondary rounded-full h-1.5">
                        <div
                          className={cn(
                            'h-1.5 rounded-full transition-all duration-300',
                            getStrengthColor(passwordStrength.strength)
                          )}
                          style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className={cn(
                          'flex items-center space-x-1',
                          passwordStrength.checks.length ? 'text-success' : 'text-text-muted'
                        )}>
                          <Check className="w-3 h-3" />
                          <span>8+ caracteres</span>
                        </div>
                        <div className={cn(
                          'flex items-center space-x-1',
                          passwordStrength.checks.uppercase ? 'text-success' : 'text-text-muted'
                        )}>
                          <Check className="w-3 h-3" />
                          <span>Mayúscula</span>
                        </div>
                        <div className={cn(
                          'flex items-center space-x-1',
                          passwordStrength.checks.lowercase ? 'text-success' : 'text-text-muted'
                        )}>
                          <Check className="w-3 h-3" />
                          <span>Minúscula</span>
                        </div>
                        <div className={cn(
                          'flex items-center space-x-1',
                          passwordStrength.checks.number ? 'text-success' : 'text-text-muted'
                        )}>
                          <Check className="w-3 h-3" />
                          <span>Número</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <Input
                    name="confirmPassword"
                    type="password"
                    label="Confirmar contraseña"
                    placeholder="Confirma tu contraseña"
                    leftIcon={<Lock className="w-4 h-4" />}
                    error={errors.confirmPassword?.message}
                    disabled={isLoading}
                    autoComplete="new-password"
                    onChange={register('confirmPassword').onChange}
                    onBlur={register('confirmPassword').onBlur}
                  />
                </div>

                {/* Terms and Privacy */}
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    required
                    className="w-4 h-4 text-accent-primary bg-background-secondary border-border-primary rounded focus:ring-accent-primary focus:ring-2 mt-0.5"
                  />
                  <label className="text-sm text-text-muted leading-5">
                    Acepto los{' '}
                    <Link href="/terms" className="text-accent-primary hover:underline">
                      Términos de Servicio
                    </Link>{' '}
                    y la{' '}
                    <Link href="/privacy" className="text-accent-primary hover:underline">
                      Política de Privacidad
                    </Link>
                  </label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  isLoading={isLoading}
                  disabled={isSubmitting}
                >
                  {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border-primary" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background-card text-text-muted">o regístrate con</span>
                </div>
              </div>

              {/* Social Registration */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  fullWidth
                  disabled={isLoading}
                  className="relative"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continuar con Google
                </Button>

                <Button
                  variant="outline"
                  fullWidth
                  disabled={isLoading}
                  className="relative"
                >
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Continuar con Facebook
                </Button>
              </div>
            </CardContent>

            <CardFooter className="text-center">
              <p className="text-sm text-text-muted">
                ¿Ya tienes una cuenta?{' '}
                <Link
                  href="/auth/login"
                  className="text-accent-primary hover:text-accent-secondary transition-colors font-medium"
                >
                  Inicia sesión aquí
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
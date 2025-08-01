'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  CreditCard, 
  BarChart3, 
  Shield, 
  Smartphone, 
  TrendingUp, 
  Users,
  ArrowRight,
  Check,
  Star
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const features = [
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Dashboard Inteligente',
      description: 'Visualiza tus finanzas con gráficos interactivos y métricas en tiempo real.'
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: 'Gestión de Cuentas',
      description: 'Administra múltiples cuentas bancarias y tarjetas desde un solo lugar.'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Análisis Avanzado',
      description: 'Obtén insights detallados sobre tus patrones de gasto e ingresos.'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Seguridad Total',
      description: 'Protección con 2FA y encriptación de extremo a extremo.'
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: 'Responsive Design',
      description: 'Accede desde cualquier dispositivo con una experiencia optimizada.'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Colaboración',
      description: 'Comparte presupuestos y gastos con familiares y socios.'
    }
  ];

  const plans = [
    {
      name: 'Básico',
      price: 'Gratis',
      features: [
        'Hasta 3 cuentas',
        'Transacciones ilimitadas',
        'Reportes básicos',
        'Soporte por email'
      ],
      popular: false
    },
    {
      name: 'Pro',
      price: '€9.99/mes',
      features: [
        'Cuentas ilimitadas',
        'Análisis avanzado',
        'Presupuestos inteligentes',
        'Exportación de datos',
        'Soporte prioritario'
      ],
      popular: true
    },
    {
      name: 'Empresa',
      price: 'Personalizado',
      features: [
        'Múltiples usuarios',
        'API personalizada',
        'Integraciones bancarias',
        'Soporte dedicado',
        'Configuración personalizada'
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-primary via-background-secondary to-background-tertiary">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(139,92,246,0.1),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.08),transparent_70%)]" />
        </div>

        <div className="relative container-main section-padding">
          {/* Navigation */}
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gradient">FinanceApp</span>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/auth/login" className="text-text-secondary hover:text-text-primary transition-colors">
                Iniciar Sesión
              </Link>
              <Button>
                Registrarse
              </Button>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl lg:text-7xl font-bold mb-6">
                Gestiona tus{' '}
                <span className="text-gradient">finanzas</span>
                <br />
                como nunca antes
              </h1>
              
              <p className="text-xl text-text-muted mb-8 max-w-2xl mx-auto">
                Una experiencia financiera moderna inspirada en Spotify. 
                Controla tus gastos, planifica tu futuro y alcanza tus metas financieras.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
                <Button size="lg" className="w-full sm:w-auto">
                  Comenzar gratis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Ver demo
                </Button>
              </div>
            </motion.div>

            {/* Hero Image Placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <Card className="max-w-4xl mx-auto p-8 glass">
                <div className="aspect-video bg-gradient-to-br from-accent-primary/20 to-accent-secondary/10 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-24 h-24 text-accent-primary mx-auto mb-4" />
                    <p className="text-lg text-text-muted">Vista previa del Dashboard</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding">
        <div className="container-main">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-4">
              Características principales
            </h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              Todo lo que necesitas para tomar control total de tus finanzas personales
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card hover className="h-full text-center">
                  <div className="text-accent-primary mb-4 flex justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-text-muted">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="section-padding bg-background-secondary/50">
        <div className="container-main">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-4">
              Planes que se adaptan a ti
            </h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              Desde usuarios individuales hasta empresas, tenemos el plan perfecto para tus necesidades
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card 
                  hover 
                  purple={plan.popular}
                  className={cn(
                    'h-full relative',
                    plan.popular && 'ring-2 ring-accent-primary'
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-accent-primary text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                        <Star className="w-4 h-4 mr-1" />
                        Más popular
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-text-primary mb-2">
                      {plan.name}
                    </h3>
                    <div className="text-3xl font-bold text-gradient">
                      {plan.price}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <Check className="w-5 h-5 text-success mr-3 flex-shrink-0" />
                        <span className="text-text-muted">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.popular ? 'primary' : 'outline'}
                    fullWidth
                    className="mt-auto"
                  >
                    {plan.name === 'Empresa' ? 'Contactar' : 'Elegir plan'}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="container-main">
          <Card purple className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-text-primary mb-4">
              ¿Listo para transformar tus finanzas?
            </h2>
            <p className="text-xl text-text-muted mb-8">
              Únete a miles de usuarios que ya están tomando control de su futuro financiero
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button size="lg">
                Comenzar gratis ahora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="ghost" size="lg">
                Hablar con ventas
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-primary bg-background-primary">
        <div className="container-main py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">FinanceApp</span>
            </div>
            
            <div className="text-text-muted text-sm text-center md:text-right">
              <p>&copy; 2024 FinanceApp. Todos los derechos reservados.</p>
              <p className="mt-1">
                Diseñado con ❤️ para una mejor gestión financiera
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

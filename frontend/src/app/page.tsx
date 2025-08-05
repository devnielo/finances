'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, PieChart, BarChart3, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Mensaje destacado */}
      <div className="max-w-2xl mx-auto pt-8">
        <Alert variant="default" className="mb-8 border-purple-600 bg-gradient-to-r from-purple-900/40 to-blue-900/40">
          <AlertTitle>¡Bienvenido a la nueva experiencia financiera!</AlertTitle>
          <AlertDescription>
            Ahora con interfaz <Badge variant="secondary">shadcn/ui</Badge> y microinteracciones modernas.
          </AlertDescription>
        </Alert>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold mb-6"
            >
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Gestión Financiera
              </span>
              <br />
              <span className="text-white">Inteligente</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
            >
              Toma el control de tus finanzas con nuestra plataforma completa de gestión de ingresos, gastos y presupuestos.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/dashboard">
                <Button className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-4">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Ir al Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="outline" className="text-lg px-8 py-4 border-gray-600 hover:border-purple-500">
                  Comenzar Gratis
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Características con Tabs */}
      <section className="py-24 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Características Principales <Badge>Nuevo</Badge>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Todo lo que necesitas para gestionar tus finanzas de manera eficiente
            </p>
          </div>
          <Tabs defaultValue="funcionalidades" className="w-full">
            <TabsList className="mx-auto mb-8">
              <TabsTrigger value="funcionalidades">Funcionalidades</TabsTrigger>
              <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
              <TabsTrigger value="experiencia">Experiencia</TabsTrigger>
            </TabsList>
            <TabsContent value="funcionalidades">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="p-8 h-full hover:border-purple-500 transition-colors">
                  <div className="text-purple-400 mb-4">
                    <TrendingUp className="w-12 h-12" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Seguimiento de Transacciones
                  </h3>
                  <p className="text-gray-400">
                    Registra y categoriza todos tus ingresos y gastos con facilidad. Mantén un control detallado de tu flujo de dinero.
                  </p>
                </Card>
                <Card className="p-8 h-full hover:border-blue-500 transition-colors">
                  <div className="text-blue-400 mb-4">
                    <PieChart className="w-12 h-12" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Categorías Organizadas
                  </h3>
                  <p className="text-gray-400">
                    Organiza tus gastos con categorías jerárquicas personalizables. Drag & drop para reordenar fácilmente.
                  </p>
                </Card>
                <Card className="p-8 h-full hover:border-green-500 transition-colors">
                  <div className="text-green-400 mb-4">
                    <DollarSign className="w-12 h-12" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Gestión de Cuentas
                  </h3>
                  <p className="text-gray-400">
                    Administra múltiples cuentas bancarias, tarjetas de crédito y efectivo desde una sola plataforma.
                  </p>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="seguridad">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="p-8 h-full hover:border-yellow-500 transition-colors">
                  <div className="text-yellow-400 mb-4">
                    <BarChart3 className="w-12 h-12" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Seguridad avanzada
                  </h3>
                  <p className="text-gray-400">
                    Tus datos están protegidos con cifrado de extremo a extremo y autenticación robusta.
                  </p>
                </Card>
                <Card className="p-8 h-full hover:border-purple-500 transition-colors">
                  <div className="text-purple-400 mb-4">
                    <TrendingUp className="w-12 h-12" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Control de acceso
                  </h3>
                  <p className="text-gray-400">
                    Gestiona permisos y roles para cada usuario de tu organización.
                  </p>
                </Card>
                <Card className="p-8 h-full hover:border-blue-500 transition-colors">
                  <div className="text-blue-400 mb-4">
                    <PieChart className="w-12 h-12" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Copias de seguridad
                  </h3>
                  <p className="text-gray-400">
                    Realiza backups automáticos y recupera tu información cuando lo necesites.
                  </p>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="experiencia">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="p-8 h-full hover:border-green-500 transition-colors">
                  <div className="text-green-400 mb-4">
                    <DollarSign className="w-12 h-12" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Microinteracciones
                  </h3>
                  <p className="text-gray-400">
                    Animaciones y feedback visual para una experiencia fluida y moderna.
                  </p>
                </Card>
                <Card className="p-8 h-full hover:border-yellow-500 transition-colors">
                  <div className="text-yellow-400 mb-4">
                    <BarChart3 className="w-12 h-12" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Accesibilidad total
                  </h3>
                  <p className="text-gray-400">
                    Cumplimos con los estándares de accesibilidad para todos los usuarios.
                  </p>
                </Card>
                <Card className="p-8 h-full hover:border-blue-500 transition-colors">
                  <div className="text-blue-400 mb-4">
                    <PieChart className="w-12 h-12" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Diseño adaptable
                  </h3>
                  <p className="text-gray-400">
                    Interfaz responsiva y adaptativa para cualquier dispositivo, incluyendo plegables.
                  </p>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Acceso rápido */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Acceso Rápido <Badge variant="outline">Navegación</Badge>
            </h2>
            <p className="text-xl text-gray-400">
              Navega directamente a las secciones principales
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/transactions">
              <Card className="p-6 text-center hover:border-purple-500 transition-colors cursor-pointer">
                <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Transacciones</h3>
                <p className="text-gray-400 text-sm">Gestiona tus movimientos</p>
              </Card>
            </Link>
            <Link href="/categories">
              <Card className="p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                <PieChart className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Categorías</h3>
                <p className="text-gray-400 text-sm">Organiza tus gastos</p>
              </Card>
            </Link>
            <Link href="/accounts">
              <Card className="p-6 text-center hover:border-green-500 transition-colors cursor-pointer">
                <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Cuentas</h3>
                <p className="text-gray-400 text-sm">Administra tus cuentas</p>
              </Card>
            </Link>
            <Link href="/dashboard">
              <Card className="p-6 text-center hover:border-yellow-500 transition-colors cursor-pointer">
                <BarChart3 className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Dashboard</h3>
                <p className="text-gray-400 text-sm">Resumen general</p>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ con Accordion */}
      <section className="py-16 bg-gray-900/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
            Preguntas Frecuentes <Badge variant="secondary">FAQ</Badge>
          </h2>
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1">
              <AccordionTrigger>¿Cómo puedo empezar a usar la plataforma?</AccordionTrigger>
              <AccordionContent>
                Regístrate gratis y comienza a gestionar tus finanzas en minutos.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>¿Mis datos están seguros?</AccordionTrigger>
              <AccordionContent>
                Sí, utilizamos cifrado y autenticación avanzada para proteger tu información.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>¿Puedo importar mis datos bancarios?</AccordionTrigger>
              <AccordionContent>
                Próximamente podrás importar movimientos bancarios de forma automática.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">
              © 2024 Gestión Financiera. Creado con Next.js y Tailwind CSS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

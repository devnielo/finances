'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, PieChart, BarChart3, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function HomePage() {
  const router = useRouter();

  // Opcional: redirigir automáticamente al dashboard si el usuario está autenticado
  // useEffect(() => {
  //   // Si hay token de autenticación, redirigir al dashboard
  //   // const token = localStorage.getItem('auth-token');
  //   // if (token) {
  //   //   router.push('/dashboard');
  //   // }
  // }, [router]);

  return (
    <div className="min-h-screen bg-black text-white">
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

      {/* Features Section */}
      <section className="py-24 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Características Principales
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Todo lo que necesitas para gestionar tus finanzas de manera eficiente
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 h-full hover:border-purple-500 transition-colors">
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 h-full hover:border-purple-500 transition-colors">
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
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Acceso Rápido
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

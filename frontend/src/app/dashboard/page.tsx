'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Plus,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Card, { 
  StatCard, 
  BalanceCard, 
  TransactionCard,
  CardHeader,
  CardTitle,
  CardContent 
} from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';

// Mock data - esto se reemplazará con datos reales del backend
const mockData = {
  totalBalance: 12350.75,
  monthlyIncome: 4500.00,
  monthlyExpenses: 2850.50,
  accounts: [
    { id: '1', name: 'Cuenta Principal', balance: 8450.25, type: 'checking' },
    { id: '2', name: 'Cuenta de Ahorros', balance: 3900.50, type: 'savings' },
  ],
  recentTransactions: [
    {
      id: '1',
      description: 'Supermercado Central',
      amount: -85.50,
      date: '2024-01-15',
      category: 'Alimentación',
      type: 'expense' as const,
    },
    {
      id: '2',
      description: 'Salario Enero',
      amount: 2500.00,
      date: '2024-01-01',
      category: 'Ingresos',
      type: 'income' as const,
    },
    {
      id: '3',
      description: 'Netflix Subscription',
      amount: -13.99,
      date: '2024-01-14',
      category: 'Entretenimiento',
      type: 'expense' as const,
    },
    {
      id: '4',
      description: 'Transferencia a Ahorros',
      amount: -500.00,
      date: '2024-01-10',
      category: 'Transferencia',
      type: 'transfer' as const,
    },
  ],
};

export default function DashboardPage() {
  const netWorth = mockData.totalBalance;
  const monthlyNet = mockData.monthlyIncome - mockData.monthlyExpenses;
  const isPositiveNet = monthlyNet >= 0;

  return (
    <Layout 
      title="Dashboard" 
      subtitle="Resumen de tu situación financiera"
    >
      <div className="space-y-8">
        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <StatCard
              title="Patrimonio Total"
              value={formatCurrency(netWorth)}
              icon={<Wallet className="w-6 h-6" />}
              change={{
                value: 5.2,
                isPositive: true,
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <StatCard
              title="Ingresos del Mes"
              value={formatCurrency(mockData.monthlyIncome)}
              icon={<TrendingUp className="w-6 h-6" />}
              change={{
                value: 12.5,
                isPositive: true,
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <StatCard
              title="Gastos del Mes"
              value={formatCurrency(mockData.monthlyExpenses)}
              icon={<TrendingDown className="w-6 h-6" />}
              change={{
                value: -8.3,
                isPositive: false,
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <StatCard
              title="Balance Neto"
              value={formatCurrency(monthlyNet)}
              icon={isPositiveNet ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
              change={{
                value: isPositiveNet ? 15.8 : -15.8,
                isPositive: isPositiveNet,
              }}
            />
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Accounts Overview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Mis Cuentas</CardTitle>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Cuenta
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockData.accounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between p-4 bg-background-secondary rounded-lg hover:bg-background-hover transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-lg flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-text-primary">{account.name}</h3>
                          <p className="text-sm text-text-muted">
                            {account.type === 'checking' ? 'Cuenta Corriente' : 'Cuenta de Ahorros'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-text-primary">
                          {formatCurrency(account.balance)}
                        </p>
                        <button className="text-text-muted hover:text-text-secondary transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button fullWidth variant="primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Transacción
                  </Button>
                  <Button fullWidth variant="outline">
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Transferir Dinero
                  </Button>
                  <Button fullWidth variant="outline">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Ver Reportes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Transacciones Recientes</CardTitle>
                <Button variant="ghost" size="sm">
                  Ver todas
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockData.recentTransactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                  >
                    <TransactionCard
                      description={transaction.description}
                      amount={transaction.amount}
                      date={formatDate(transaction.date)}
                      category={transaction.category}
                      type={transaction.type}
                      onClick={() => console.log('View transaction', transaction.id)}
                    />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Section Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Gastos por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-br from-accent-primary/10 to-accent-secondary/5 rounded-lg flex items-center justify-center">
                  <div className="text-center text-text-muted">
                    <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Gráfico de gastos por categoría</p>
                    <p className="text-sm">(Próximamente)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tendencia Mensual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-br from-accent-primary/10 to-accent-secondary/5 rounded-lg flex items-center justify-center">
                  <div className="text-center text-text-muted">
                    <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Gráfico de tendencia mensual</p>
                    <p className="text-sm">(Próximamente)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
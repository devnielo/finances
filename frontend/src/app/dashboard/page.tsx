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
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

const mockData = {
  totalBalance: 12350.75,
  monthlyIncome: 4500.0,
  monthlyExpenses: 2850.5,
  accounts: [
    { id: '1', name: 'Cuenta Principal', balance: 8450.25, type: 'checking' },
    { id: '2', name: 'Cuenta de Ahorros', balance: 3900.5, type: 'savings' },
  ],
  recentTransactions: [
    {
      id: '1',
      description: 'Supermercado Central',
      amount: -85.5,
      date: '2024-01-15',
      category: 'Alimentación',
      type: 'expense' as const,
    },
    {
      id: '2',
      description: 'Salario Enero',
      amount: 2500.0,
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
      amount: -500.0,
      date: '2024-01-10',
      category: 'Transferencia',
      type: 'transfer' as const,
    },
  ],
};

function formatCurrency(value: number) {
  return value.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  });
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('es-ES');
}

function StatCard({
  title,
  value,
  icon,
  change,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  change: { value: number; isPositive: boolean };
}) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          {title}
          <Badge variant={change.isPositive ? 'default' : 'destructive'}>
            {change.isPositive ? '+ ' : ''}
            {change.value}%
          </Badge>
        </CardTitle>
        <div className="rounded-full bg-muted p-2">{icon}</div>
      </CardHeader>
      <CardContent>
        <span className="text-3xl font-bold">{value}</span>
      </CardContent>
    </Card>
  );
}

function TransactionCard({
  description,
  amount,
  date,
  category,
  type,
  onClick,
}: {
  description: string;
  amount: number;
  date: string;
  category: string;
  type: string;
  onClick: () => void;
}) {
  return (
    <Card className="hover:border-primary transition-colors cursor-pointer" onClick={onClick}>
      <CardContent className="flex items-center justify-between py-4">
        <div>
          <div className="font-medium">{description}</div>
          <div className="text-xs text-muted-foreground">{date} · {category}</div>
        </div>
        <div className="text-right">
          <span className={`font-semibold ${amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatCurrency(amount)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

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
        {/* Mensaje destacado */}
        <Alert variant="default" className="mb-4 border-purple-600 bg-gradient-to-r from-purple-900/40 to-blue-900/40">
          <AlertTitle>¡Bienvenido a tu Dashboard!</AlertTitle>
          <AlertDescription>
            Visualiza tu <Badge variant="secondary">patrimonio</Badge>, cuentas y movimientos recientes de forma moderna.
          </AlertDescription>
        </Alert>

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
                  <CardTitle>
                    Mis Cuentas <Badge variant="outline" className="ml-2">Activo</Badge>
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Cuenta
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockData.accounts.map((account) => (
                    <Card key={account.id} className="flex items-center justify-between p-4 rounded-lg transition-colors cursor-pointer hover:border-primary">
                      <div className="flex items-center space-x-4">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500"
                        >
                          <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{account.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {account.type === 'checking' ? 'Cuenta Corriente' : 'Cuenta de Ahorros'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white">
                          {formatCurrency(account.balance)}
                        </p>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
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
                <CardTitle>Acciones Rápidas <Badge variant="secondary" className="ml-2">Nuevo</Badge></CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full" variant="default">
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Transacción
                  </Button>
                  <Button className="w-full" variant="outline">
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Transferir Dinero
                  </Button>
                  <Button className="w-full" variant="outline">
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
                <CardTitle>Transacciones Recientes <Badge variant="secondary" className="ml-2">Beta</Badge></CardTitle>
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
                <Skeleton className="h-64 w-full rounded-lg mb-4" />
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Gráfico de gastos por categoría</p>
                  <p className="text-sm">(Próximamente)</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Tendencia Mensual</CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full rounded-lg mb-4" />
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Gráfico de tendencia mensual</p>
                  <p className="text-sm">(Próximamente)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
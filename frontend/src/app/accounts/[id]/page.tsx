'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  Eye,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Card, { CardHeader, CardTitle, CardContent, TransactionCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ConfirmModal, useModal } from '@/components/ui/Modal';
import { useAccountActions, useAccounts } from '@/stores/accountStore';
import { Account, Transaction, TransactionType } from '@/types';
import { 
  formatAccountBalance, 
  getAccountTypeIcon, 
  getAccountTypeName 
} from '@/lib/validations/account';
import { cn } from '@/lib/utils';

// Mock data para transacciones (será reemplazado con datos reales)
const mockTransactions: Transaction[] = [
  {
    id: '1',
    amount: -45.50,
    description: 'Supermercado Central',
    date: '2024-01-15',
    type: TransactionType.WITHDRAWAL,
    sourceAccountId: '1',
    reconciled: false,
    userId: 'user1',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    amount: 1200.00,
    description: 'Salario enero',
    date: '2024-01-01',
    type: TransactionType.DEPOSIT,
    destinationAccountId: '1',
    reconciled: true,
    userId: 'user1',
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-01-01T08:00:00Z',
  },
  {
    id: '3',
    amount: -125.00,
    description: 'Pago tarjeta crédito',
    date: '2024-01-14',
    type: TransactionType.TRANSFER,
    sourceAccountId: '1',
    destinationAccountId: '2',
    reconciled: false,
    userId: 'user1',
    createdAt: '2024-01-14T15:45:00Z',
    updatedAt: '2024-01-14T15:45:00Z',
  },
];

export default function AccountDetailPage() {
  const router = useRouter();
  const params = useParams();
  const accountId = params?.id as string;
  
  const { getAccountById, deleteAccount } = useAccountActions();
  const { accounts } = useAccounts();
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  
  // Modal de confirmación para eliminar
  const deleteModal = useModal();

  useEffect(() => {
    if (accounts.length > 0) {
      const foundAccount = getAccountById(accountId);
      setAccount(foundAccount || null);
      setIsLoading(false);
    }
  }, [accountId, accounts, getAccountById]);

  const handleBack = () => {
    router.push('/accounts');
  };

  const handleEdit = () => {
    router.push(`/accounts/${accountId}/edit`);
  };

  const handleNewTransaction = () => {
    router.push(`/transactions/new?account=${accountId}`);
  };

  const handleViewTransaction = (transactionId: string) => {
    router.push(`/transactions/${transactionId}`);
  };

  const handleDeleteClick = () => {
    deleteModal.openModal();
  };

  const handleConfirmDelete = async () => {
    if (!account) return;

    setIsDeletingAccount(true);
    try {
      await deleteAccount(account.id);
      router.push('/accounts');
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const getTransactionType = (transaction: Transaction, accountId: string): 'income' | 'expense' | 'transfer' => {
    if (transaction.type === TransactionType.TRANSFER) {
      return 'transfer';
    }
    if (transaction.sourceAccountId === accountId) {
      return 'expense';
    }
    return 'income';
  };

  const formatTransactionDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-success';
    if (balance < 0) return 'text-error';
    return 'text-text-muted';
  };

  const getBalanceTrend = (balance: number) => {
    if (balance > 0) return { icon: TrendingUp, color: 'text-success' };
    if (balance < 0) return { icon: TrendingDown, color: 'text-error' };
    return { icon: TrendingUp, color: 'text-text-muted' };
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-surface-hover rounded mb-4"></div>
            <div className="h-32 bg-surface-hover rounded mb-6"></div>
            <div className="h-64 bg-surface-hover rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!account) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Cuenta no encontrada</h1>
          <p className="text-text-muted mb-6">La cuenta que buscas no existe o ha sido eliminada.</p>
          <Button onClick={handleBack}>Volver a Cuentas</Button>
        </div>
      </Layout>
    );
  }

  const balanceTrend = getBalanceTrend(account.balance);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Volver
            </Button>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl">{getAccountTypeIcon(account.type)}</span>
                <h1 className="text-2xl font-bold text-text-primary">{account.name}</h1>
              </div>
              <p className="text-text-muted">{getAccountTypeName(account.type)}</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              leftIcon={<Edit className="w-4 h-4" />}
              onClick={handleEdit}
            >
              Editar
            </Button>
            <Button
              variant="danger"
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={handleDeleteClick}
            >
              Eliminar
            </Button>
          </div>
        </div>

        {/* Información de la cuenta */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Balance principal */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Balance Actual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className={cn('text-3xl font-bold', getBalanceColor(account.balance))}>
                    {formatAccountBalance(account.balance, account.currency)}
                  </div>
                  <p className="text-sm text-text-muted mt-1">
                    Balance inicial: {formatAccountBalance(account.openingBalance, account.currency)}
                  </p>
                </div>
                <div className={cn('p-3 rounded-full bg-opacity-10', balanceTrend.color)}>
                  <balanceTrend.icon className={cn('w-8 h-8', balanceTrend.color)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información adicional */}
          <Card>
            <CardHeader>
              <CardTitle>Detalles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-text-muted">Moneda:</span>
                  <span className="font-medium">{account.currency}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-text-muted">Estado:</span>
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    account.active 
                      ? 'bg-success/10 text-success' 
                      : 'bg-error/10 text-error'
                  )}>
                    {account.active ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-text-muted">Creada:</span>
                  <span className="text-sm">
                    {new Date(account.createdAt).toLocaleDateString('es-ES')}
                  </span>
                </div>
                
                {account.openingBalanceDate && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Fecha inicial:</span>
                    <span className="text-sm">
                      {new Date(account.openingBalanceDate).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notas */}
        {account.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary whitespace-pre-wrap">{account.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Transacciones recientes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Transacciones Recientes</CardTitle>
              <Button
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={handleNewTransaction}
              >
                Nueva Transacción
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {mockTransactions.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  No hay transacciones
                </h3>
                <p className="text-text-muted mb-4">
                  Esta cuenta aún no tiene transacciones registradas.
                </p>
                <Button onClick={handleNewTransaction}>
                  Crear primera transacción
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {mockTransactions.slice(0, 5).map((transaction) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TransactionCard
                      description={transaction.description}
                      amount={transaction.amount}
                      currency={account.currency}
                      date={formatTransactionDate(transaction.date)}
                      type={getTransactionType(transaction, accountId)}
                      onClick={() => handleViewTransaction(transaction.id)}
                    />
                  </motion.div>
                ))}
                
                {mockTransactions.length > 5 && (
                  <div className="text-center pt-4">
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/transactions?account=${accountId}`)}
                    >
                      Ver todas las transacciones ({mockTransactions.length})
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de confirmación para eliminar */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={deleteModal.closeModal}
          onConfirm={handleConfirmDelete}
          title="Eliminar Cuenta"
          message={`¿Estás seguro de que quieres eliminar la cuenta "${account.name}"? Esta acción no se puede deshacer y se eliminarán todas las transacciones asociadas.`}
          confirmText="Eliminar"
          type="danger"
          isLoading={isDeletingAccount}
        />
      </div>
    </Layout>
  );
}
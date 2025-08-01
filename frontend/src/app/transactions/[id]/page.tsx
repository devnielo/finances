'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle,
  Circle,
  Calendar,
  DollarSign,
  FileText,
  Tag,
  ArrowRight,
  Building,
  Hash,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ConfirmModal, useModal } from '@/components/ui/Modal';
import { useTransactionActions, useTransactions } from '@/stores/transactionStore';
import { useAccounts } from '@/stores/accountStore';
import { Transaction, TransactionType } from '@/types';
import { 
  formatTransactionAmount,
  getTransactionColor,
  getTransactionIcon,
  getTransactionTypeName 
} from '@/lib/validations/transaction';
import { cn } from '@/lib/utils';

export default function TransactionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const transactionId = params?.id as string;
  
  const { getTransactionById, deleteTransaction, reconcileTransaction } = useTransactionActions();
  const { accounts } = useAccounts();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingTransaction, setIsDeletingTransaction] = useState(false);
  const [isTogglingReconciled, setIsTogglingReconciled] = useState(false);
  
  // Modal de confirmación para eliminar
  const deleteModal = useModal();

  useEffect(() => {
    if (transactionId) {
      const foundTransaction = getTransactionById(transactionId);
      setTransaction(foundTransaction || null);
      setIsLoading(false);
    }
  }, [transactionId, getTransactionById]);

  const handleBack = () => {
    router.push('/transactions');
  };

  const handleEdit = () => {
    router.push(`/transactions/${transactionId}/edit`);
  };

  const handleDeleteClick = () => {
    deleteModal.openModal();
  };

  const handleConfirmDelete = async () => {
    if (!transaction) return;

    setIsDeletingTransaction(true);
    try {
      await deleteTransaction(transaction.id);
      router.push('/transactions');
    } catch (error) {
      console.error('Error al eliminar transacción:', error);
    } finally {
      setIsDeletingTransaction(false);
    }
  };

  const handleToggleReconciled = async () => {
    if (!transaction) return;

    setIsTogglingReconciled(true);
    try {
      await reconcileTransaction(transaction.id, !transaction.reconciled);
      setTransaction({
        ...transaction,
        reconciled: !transaction.reconciled,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error al cambiar estado de conciliación:', error);
    } finally {
      setIsTogglingReconciled(false);
    }
  };

  const getAccountName = (accountId?: string) => {
    if (!accountId) return 'N/A';
    const account = accounts.find(acc => acc.id === accountId);
    return account?.name || 'Cuenta eliminada';
  };

  const getAccountDetails = (accountId?: string) => {
    if (!accountId) return null;
    return accounts.find(acc => acc.id === accountId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  if (!transaction) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Transacción no encontrada</h1>
          <p className="text-text-muted mb-6">La transacción que buscas no existe o ha sido eliminada.</p>
          <Button onClick={handleBack}>Volver a Transacciones</Button>
        </div>
      </Layout>
    );
  }

  const sourceAccount = getAccountDetails(transaction.sourceAccountId);
  const destinationAccount = getAccountDetails(transaction.destinationAccountId);

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
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getTransactionIcon(transaction.type)}</span>
                <div>
                  <h1 className="text-2xl font-bold text-text-primary">{transaction.description}</h1>
                  <p className="text-text-muted">{getTransactionTypeName(transaction.type)}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant={transaction.reconciled ? "outline" : "secondary"}
              leftIcon={transaction.reconciled ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
              onClick={handleToggleReconciled}
              isLoading={isTogglingReconciled}
            >
              {transaction.reconciled ? 'Conciliada' : 'Marcar como conciliada'}
            </Button>
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

        {/* Información principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monto principal */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Detalles de la Transacción</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Monto */}
                <div className="text-center">
                  <div className={cn(
                    'text-4xl font-bold mb-2',
                    getTransactionColor(transaction.type)
                  )}>
                    {formatTransactionAmount(transaction.amount, transaction.type)}
                  </div>
                  <p className="text-text-muted">
                    {formatDate(transaction.date)}
                  </p>
                </div>

                {/* Cuentas involucradas */}
                <div className="space-y-4">
                  {transaction.type === TransactionType.TRANSFER ? (
                    // Transferencia
                    <div className="flex items-center justify-between p-4 bg-surface-hover rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Building className="w-5 h-5 text-text-muted" />
                        <div>
                          <p className="font-medium text-text-primary">
                            {getAccountName(transaction.sourceAccountId)}
                          </p>
                          <p className="text-sm text-text-muted">Cuenta origen</p>
                        </div>
                      </div>
                      
                      <ArrowRight className="w-5 h-5 text-text-muted" />
                      
                      <div className="flex items-center space-x-3">
                        <Building className="w-5 h-5 text-text-muted" />
                        <div>
                          <p className="font-medium text-text-primary">
                            {getAccountName(transaction.destinationAccountId)}
                          </p>
                          <p className="text-sm text-text-muted">Cuenta destino</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Depósito o retiro
                    <div className="flex items-center space-x-3 p-4 bg-surface-hover rounded-lg">
                      <Building className="w-5 h-5 text-text-muted" />
                      <div>
                        <p className="font-medium text-text-primary">
                          {getAccountName(
                            transaction.sourceAccountId || transaction.destinationAccountId
                          )}
                        </p>
                        <p className="text-sm text-text-muted">
                          {transaction.type === TransactionType.DEPOSIT ? 'Cuenta destino' : 'Cuenta origen'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estado y metadatos */}
          <Card>
            <CardHeader>
              <CardTitle>Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Estado:</span>
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    transaction.reconciled 
                      ? 'bg-success/10 text-success' 
                      : 'bg-warning/10 text-warning'
                  )}>
                    {transaction.reconciled ? 'Conciliada' : 'Pendiente'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Tipo:</span>
                  <span className="font-medium">
                    {getTransactionTypeName(transaction.type)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">ID:</span>
                  <span className="text-sm font-mono bg-surface-hover px-2 py-1 rounded">
                    {transaction.id}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Creada:</span>
                  <span className="text-sm">
                    {formatDateTime(transaction.createdAt)}
                  </span>
                </div>
                
                {transaction.updatedAt !== transaction.createdAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Modificada:</span>
                    <span className="text-sm">
                      {formatDateTime(transaction.updatedAt)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Etiquetas */}
        {transaction.tags && transaction.tags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Tag className="w-5 h-5" />
                <span>Etiquetas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {transaction.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full bg-accent-primary/10 text-accent-primary text-sm"
                  >
                    <Hash className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notas */}
        {transaction.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Notas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary whitespace-pre-wrap">{transaction.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Información de las cuentas */}
        {(sourceAccount || destinationAccount) && (
          <Card>
            <CardHeader>
              <CardTitle>Información de Cuentas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sourceAccount && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-text-primary">Cuenta Origen</h4>
                    <div className="p-3 bg-surface-hover rounded-lg">
                      <p className="font-medium">{sourceAccount.name}</p>
                      <p className="text-sm text-text-muted">
                        Balance actual: {sourceAccount.balance.toFixed(2)} {sourceAccount.currency}
                      </p>
                      <p className="text-xs text-text-muted">
                        Tipo: {sourceAccount.type}
                      </p>
                    </div>
                  </div>
                )}
                
                {destinationAccount && destinationAccount.id !== sourceAccount?.id && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-text-primary">Cuenta Destino</h4>
                    <div className="p-3 bg-surface-hover rounded-lg">
                      <p className="font-medium">{destinationAccount.name}</p>
                      <p className="text-sm text-text-muted">
                        Balance actual: {destinationAccount.balance.toFixed(2)} {destinationAccount.currency}
                      </p>
                      <p className="text-xs text-text-muted">
                        Tipo: {destinationAccount.type}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modal de confirmación para eliminar */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={deleteModal.closeModal}
          onConfirm={handleConfirmDelete}
          title="Eliminar Transacción"
          message={`¿Estás seguro de que quieres eliminar la transacción "${transaction.description}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          type="danger"
          isLoading={isDeletingTransaction}
        />
      </div>
    </Layout>
  );
}
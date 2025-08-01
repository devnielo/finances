'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  ArrowUpDown,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Circle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Card, { StatCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { ConfirmModal, useModal } from '@/components/ui/Modal';
import { useTransactions, useTransactionActions, useTransactionStats } from '@/stores/transactionStore';
import { useAccounts } from '@/stores/accountStore';
import { TransactionType } from '@/types';
import { 
  formatTransactionAmount,
  getTransactionColor,
  getTransactionIcon,
  getTransactionTypeName 
} from '@/lib/validations/transaction';
import { cn } from '@/lib/utils';

const transactionTypeOptions = [
  { value: '', label: 'Todos los tipos' },
  { value: TransactionType.DEPOSIT, label: getTransactionTypeName(TransactionType.DEPOSIT), icon: getTransactionIcon(TransactionType.DEPOSIT) },
  { value: TransactionType.WITHDRAWAL, label: getTransactionTypeName(TransactionType.WITHDRAWAL), icon: getTransactionIcon(TransactionType.WITHDRAWAL) },
  { value: TransactionType.TRANSFER, label: getTransactionTypeName(TransactionType.TRANSFER), icon: getTransactionIcon(TransactionType.TRANSFER) },
];

const sortOptions = [
  { value: 'date', label: 'Fecha' },
  { value: 'amount', label: 'Monto' },
  { value: 'description', label: 'Descripción' },
  { value: 'createdAt', label: 'Fecha de creación' },
];

const limitOptions = [
  { value: '10', label: '10 por página' },
  { value: '20', label: '20 por página' },
  { value: '50', label: '50 por página' },
  { value: '100', label: '100 por página' },
];

export default function TransactionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { transactions, isLoading, error, currentPage, totalPages, totalTransactions, filters } = useTransactions();
  const { fetchTransactions, deleteTransaction, setFilters, clearFilters, reconcileTransaction } = useTransactionActions();
  const { accounts } = useAccounts();
  const stats = useTransactionStats();
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedType, setSelectedType] = useState(filters.type || '');
  const [selectedAccount, setSelectedAccount] = useState(filters.accountId || '');
  const [startDate, setStartDate] = useState(filters.startDate || '');
  const [endDate, setEndDate] = useState(filters.endDate || '');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pageSize, setPageSize] = useState(filters.limit?.toString() || '20');
  const [reconciledFilter, setReconciledFilter] = useState<string>('');
  
  // Modales
  const deleteModal = useModal();
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [isDeletingTransaction, setIsDeletingTransaction] = useState(false);

  // Cargar transacciones al montar y cuando cambien los filtros
  useEffect(() => {
    const accountFromUrl = searchParams?.get('account');
    if (accountFromUrl && accountFromUrl !== selectedAccount) {
      setSelectedAccount(accountFromUrl);
    }
  }, [searchParams, selectedAccount]);

  useEffect(() => {
    const newFilters = {
      search: searchTerm || undefined,
      type: (selectedType as TransactionType) || undefined,
      accountId: selectedAccount || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      sortBy: sortBy as 'date' | 'amount' | 'description' | 'createdAt',
      sortOrder,
      page: currentPage,
      limit: parseInt(pageSize),
      reconciled: reconciledFilter ? reconciledFilter === 'true' : undefined,
    };

    fetchTransactions(newFilters).catch(console.error);
  }, [searchTerm, selectedType, selectedAccount, startDate, endDate, sortBy, sortOrder, currentPage, pageSize, reconciledFilter, fetchTransactions]);

  // Opciones de cuentas para el filtro
  const accountOptions = [
    { value: '', label: 'Todas las cuentas' },
    ...accounts.map(account => ({
      value: account.id,
      label: account.name,
    })),
  ];

  const reconciledOptions = [
    { value: '', label: 'Todas' },
    { value: 'true', label: 'Conciliadas' },
    { value: 'false', label: 'Pendientes' },
  ];

  const handleCreateTransaction = () => {
    router.push('/transactions/new');
  };

  const handleViewTransaction = (transactionId: string) => {
    router.push(`/transactions/${transactionId}`);
  };

  const handleEditTransaction = (transactionId: string) => {
    router.push(`/transactions/${transactionId}/edit`);
  };

  const handleDeleteClick = (transactionId: string) => {
    setTransactionToDelete(transactionId);
    deleteModal.openModal();
  };

  const handleConfirmDelete = async () => {
    if (!transactionToDelete) return;

    setIsDeletingTransaction(true);
    try {
      await deleteTransaction(transactionToDelete);
      deleteModal.closeModal();
      setTransactionToDelete(null);
    } catch (error) {
      console.error('Error al eliminar transacción:', error);
    } finally {
      setIsDeletingTransaction(false);
    }
  };

  const handleToggleReconciled = async (transactionId: string, currentStatus: boolean) => {
    try {
      await reconcileTransaction(transactionId, !currentStatus);
    } catch (error) {
      console.error('Error al cambiar estado de conciliación:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setSelectedAccount('');
    setStartDate('');
    setEndDate('');
    setReconciledFilter('');
    clearFilters();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getAccountName = (accountId?: string) => {
    if (!accountId) return 'N/A';
    const account = accounts.find(acc => acc.id === accountId);
    return account?.name || 'Cuenta eliminada';
  };

  const activeFiltersCount = [
    searchTerm,
    selectedType,
    selectedAccount,
    startDate,
    endDate,
    reconciledFilter,
  ].filter(Boolean).length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Transacciones</h1>
            <p className="text-text-muted">Gestiona tus movimientos financieros</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              leftIcon={<Upload className="w-4 h-4" />}
            >
              Importar
            </Button>
            <Button
              variant="outline"
              leftIcon={<Download className="w-4 h-4" />}
            >
              Exportar
            </Button>
            <Button
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={handleCreateTransaction}
            >
              Nueva Transacción
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Transacciones"
            value={stats.totalTransactions}
            icon={<ArrowLeftRight className="w-6 h-6" />}
          />
          <StatCard
            title="Ingresos"
            value={`+${stats.totalIncome.toFixed(2)}€`}
            icon={<TrendingUp className="w-6 h-6" />}
          />
          <StatCard
            title="Gastos"
            value={`-${stats.totalExpenses.toFixed(2)}€`}
            icon={<TrendingDown className="w-6 h-6" />}
          />
          <StatCard
            title="Balance Neto"
            value={`${stats.netAmount >= 0 ? '+' : ''}${stats.netAmount.toFixed(2)}€`}
            icon={<DollarSign className="w-6 h-6" />}
            change={{
              value: stats.reconciledPercentage,
              isPositive: stats.reconciledPercentage > 50,
            }}
          />
        </div>

        {/* Filtros */}
        <Card>
          <div className="space-y-4">
            {/* Fila 1: Búsqueda y tipo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Buscar transacciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
              
              <Select
                options={transactionTypeOptions}
                value={selectedType}
                onChange={setSelectedType}
                placeholder="Tipo de transacción"
              />
            </div>

            {/* Fila 2: Cuenta y estado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                options={accountOptions}
                value={selectedAccount}
                onChange={setSelectedAccount}
                placeholder="Cuenta"
              />
              
              <Select
                options={reconciledOptions}
                value={reconciledFilter}
                onChange={setReconciledFilter}
                placeholder="Estado de conciliación"
              />
            </div>

            {/* Fila 3: Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Fecha desde
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-border-primary rounded-md 
                           bg-surface-primary text-text-primary
                           focus:ring-2 focus:ring-accent-primary focus:border-accent-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Fecha hasta
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-border-primary rounded-md 
                           bg-surface-primary text-text-primary
                           focus:ring-2 focus:ring-accent-primary focus:border-accent-primary"
                />
              </div>
            </div>

            {/* Fila 4: Ordenamiento y tamaño de página */}
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex gap-2 flex-1">
                <Select
                  options={sortOptions}
                  value={sortBy}
                  onChange={setSortBy}
                  placeholder="Ordenar por"
                  className="flex-1"
                />
                
                <Button
                  variant="outline"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  aria-label={`Orden ${sortOrder === 'asc' ? 'ascendente' : 'descendente'}`}
                >
                  <ArrowUpDown className="w-4 h-4" />
                </Button>
                
                <Select
                  options={limitOptions}
                  value={pageSize}
                  onChange={setPageSize}
                  className="w-40"
                />
              </div>

              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  leftIcon={<Filter className="w-4 h-4" />}
                >
                  Limpiar filtros ({activeFiltersCount})
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Lista de transacciones */}
        {error && (
          <Card className="border-error/20 bg-error/5">
            <div className="text-error">
              <p className="font-medium">Error al cargar las transacciones</p>
              <p className="text-sm mt-1">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => fetchTransactions(filters)}
              >
                Reintentar
              </Button>
            </div>
          </Card>
        )}

        <Card>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="animate-pulse h-16 bg-surface-hover rounded"></div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <ArrowLeftRight className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">
                No se encontraron transacciones
              </h3>
              <p className="text-text-muted mb-4">
                No hay transacciones que coincidan con los filtros seleccionados.
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={handleClearFilters}>
                  Limpiar filtros
                </Button>
                <Button onClick={handleCreateTransaction}>
                  Nueva Transacción
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 border border-border-primary rounded-lg
                           hover:bg-surface-hover transition-colors duration-150"
                >
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    {/* Estado de conciliación */}
                    <button
                      onClick={() => handleToggleReconciled(transaction.id, transaction.reconciled)}
                      className="flex-shrink-0"
                    >
                      {transaction.reconciled ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : (
                        <Circle className="w-5 h-5 text-text-muted hover:text-accent-primary" />
                      )}
                    </button>

                    {/* Icono del tipo */}
                    <div className="flex-shrink-0 text-lg">
                      {getTransactionIcon(transaction.type)}
                    </div>

                    {/* Información principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-text-primary truncate">
                          {transaction.description}
                        </h3>
                        {transaction.tags && transaction.tags.length > 0 && (
                          <div className="flex gap-1">
                            {transaction.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 text-xs bg-accent-primary/10 text-accent-primary rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                            {transaction.tags.length > 2 && (
                              <span className="text-xs text-text-muted">
                                +{transaction.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-sm text-text-muted">
                        {formatDate(transaction.date)} • {getAccountName(transaction.sourceAccountId || transaction.destinationAccountId)}
                        {transaction.type === TransactionType.TRANSFER && (
                          <span> → {getAccountName(transaction.destinationAccountId)}</span>
                        )}
                      </div>
                    </div>

                    {/* Monto */}
                    <div className={cn(
                      'font-semibold text-right flex-shrink-0',
                      getTransactionColor(transaction.type)
                    )}>
                      {formatTransactionAmount(transaction.amount, transaction.type)}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center space-x-1 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewTransaction(transaction.id)}
                      aria-label="Ver transacción"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTransaction(transaction.id)}
                      aria-label="Editar transacción"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(transaction.id)}
                      aria-label="Eliminar transacción"
                      className="text-error hover:text-error"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border-primary">
              <div className="text-sm text-text-muted">
                Página {currentPage} de {totalPages} ({totalTransactions} transacciones)
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Anterior
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Modal de confirmación para eliminar */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={deleteModal.closeModal}
          onConfirm={handleConfirmDelete}
          title="Eliminar Transacción"
          message="¿Estás seguro de que quieres eliminar esta transacción? Esta acción no se puede deshacer."
          confirmText="Eliminar"
          type="danger"
          isLoading={isDeletingTransaction}
        />
      </div>
    </Layout>
  );
}
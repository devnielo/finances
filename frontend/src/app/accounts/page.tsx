'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Card, { StatCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { ConfirmModal, useModal } from '@/components/ui/Modal';
import { useAccounts, useAccountActions, useAccountSummary } from '@/stores/accountStore';
import { AccountType } from '@/types';
import { formatAccountBalance, getAccountTypeIcon, getAccountTypeName } from '@/lib/validations/account';
import { cn } from '@/lib/utils';

const accountTypeOptions = [
  { value: '', label: 'Todos los tipos' },
  { value: AccountType.ASSET, label: getAccountTypeName(AccountType.ASSET), icon: getAccountTypeIcon(AccountType.ASSET) },
  { value: AccountType.LIABILITY, label: getAccountTypeName(AccountType.LIABILITY), icon: getAccountTypeIcon(AccountType.LIABILITY) },
  { value: AccountType.EXPENSE, label: getAccountTypeName(AccountType.EXPENSE), icon: getAccountTypeIcon(AccountType.EXPENSE) },
  { value: AccountType.REVENUE, label: getAccountTypeName(AccountType.REVENUE), icon: getAccountTypeIcon(AccountType.REVENUE) },
  { value: AccountType.INITIAL_BALANCE, label: getAccountTypeName(AccountType.INITIAL_BALANCE), icon: getAccountTypeIcon(AccountType.INITIAL_BALANCE) },
];

const sortOptions = [
  { value: 'name', label: 'Nombre' },
  { value: 'balance', label: 'Balance' },
  { value: 'type', label: 'Tipo' },
  { value: 'createdAt', label: 'Fecha de creación' },
];

export default function AccountsPage() {
  const router = useRouter();
  const { accounts, isLoading, error } = useAccounts();
  const { fetchAccounts, deleteAccount, clearError } = useAccountActions();
  const summary = useAccountSummary();
  
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Modal de confirmación para eliminar
  const deleteModal = useModal();
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Cargar cuentas al montar el componente
  useEffect(() => {
    fetchAccounts().catch(console.error);
  }, [fetchAccounts]);

  // Limpiar errores al desmontar
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  // Filtrar y ordenar cuentas
  const filteredAndSortedAccounts = React.useMemo(() => {
    const filtered = accounts.filter(account => {
      const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           account.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !selectedType || account.type === selectedType;
      
      return matchesSearch && matchesType;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'balance':
          aValue = a.balance;
          bValue = b.balance;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [accounts, searchTerm, selectedType, sortBy, sortOrder]);

  const handleCreateAccount = () => {
    router.push('/accounts/new');
  };

  const handleViewAccount = (accountId: string) => {
    router.push(`/accounts/${accountId}`);
  };

  const handleEditAccount = (accountId: string) => {
    router.push(`/accounts/${accountId}/edit`);
  };

  const handleDeleteClick = (accountId: string) => {
    setAccountToDelete(accountId);
    deleteModal.openModal();
  };

  const handleConfirmDelete = async () => {
    if (!accountToDelete) return;

    setIsDeletingAccount(true);
    try {
      await deleteAccount(accountToDelete);
      deleteModal.closeModal();
      setAccountToDelete(null);
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const getBalanceColor = (balance: number, type: AccountType) => {
    if (balance === 0) return 'text-text-muted';
    
    switch (type) {
      case AccountType.ASSET:
        return balance > 0 ? 'text-success' : 'text-error';
      case AccountType.LIABILITY:
        return balance < 0 ? 'text-success' : 'text-warning';
      default:
        return balance > 0 ? 'text-success' : 'text-error';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Cuentas</h1>
            <p className="text-text-muted">Gestiona tus cuentas financieras</p>
          </div>
          
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleCreateAccount}
          >
            Nueva Cuenta
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total de Cuentas"
            value={summary.totalAccounts}
            icon={<Wallet className="w-6 h-6" />}
          />
          <StatCard
            title="Balance Total"
            value={formatAccountBalance(summary.totalBalance, 'EUR')}
            icon={<DollarSign className="w-6 h-6" />}
          />
          <StatCard
            title="Cuentas de Activos"
            value={summary.assetCount}
            icon={<TrendingUp className="w-6 h-6" />}
          />
          <StatCard
            title="Cuentas de Pasivos"
            value={summary.liabilityCount}
            icon={<TrendingDown className="w-6 h-6" />}
          />
        </div>

        {/* Filtros y búsqueda */}
        <Card>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar cuentas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
              
              <div className="flex gap-2">
                <Select
                  options={accountTypeOptions}
                  value={selectedType}
                  onChange={setSelectedType}
                  placeholder="Tipo de cuenta"
                  className="w-48"
                />
                
                <Select
                  options={sortOptions}
                  value={sortBy}
                  onChange={setSortBy}
                  placeholder="Ordenar por"
                  className="w-40"
                />
                
                <Button
                  variant="outline"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  aria-label={`Orden ${sortOrder === 'asc' ? 'ascendente' : 'descendente'}`}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
            </div>

            {/* Filtros activos */}
            {(searchTerm || selectedType) && (
              <div className="flex items-center gap-2 text-sm">
                <Filter className="w-4 h-4 text-text-muted" />
                <span className="text-text-muted">Filtros activos:</span>
                {searchTerm && (
                  <span className="px-2 py-1 bg-accent-primary/10 text-accent-primary rounded-md">
                    Búsqueda: &ldquo;{searchTerm}&rdquo;
                  </span>
                )}
                {selectedType && (
                  <span className="px-2 py-1 bg-accent-primary/10 text-accent-primary rounded-md">
                    Tipo: {getAccountTypeName(selectedType as AccountType)}
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedType('');
                  }}
                  className="text-accent-primary hover:text-accent-secondary text-sm underline"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </Card>

        {/* Lista de cuentas */}
        {error && (
          <Card className="border-error/20 bg-error/5">
            <div className="text-error">
              <p className="font-medium">Error al cargar las cuentas</p>
              <p className="text-sm mt-1">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => fetchAccounts()}
              >
                Reintentar
              </Button>
            </div>
          </Card>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="h-32 bg-surface-hover rounded"></div>
              </Card>
            ))}
          </div>
        ) : filteredAndSortedAccounts.length === 0 ? (
          <Card className="text-center py-12">
            <CreditCard className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">
              {accounts.length === 0 ? 'No tienes cuentas aún' : 'No se encontraron cuentas'}
            </h3>
            <p className="text-text-muted mb-4">
              {accounts.length === 0 
                ? 'Crea tu primera cuenta para comenzar a gestionar tus finanzas'
                : 'Intenta ajustar los filtros o crear una nueva cuenta'
              }
            </p>
            <Button onClick={handleCreateAccount}>
              {accounts.length === 0 ? 'Crear mi primera cuenta' : 'Nueva Cuenta'}
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedAccounts.map((account, index) => (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Card hover className="h-full">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getAccountTypeIcon(account.type)}</span>
                      <div>
                        <h3 className="font-medium text-text-primary">{account.name}</h3>
                        <p className="text-sm text-text-muted">{getAccountTypeName(account.type)}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewAccount(account.id)}
                        aria-label="Ver cuenta"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditAccount(account.id)}
                        aria-label="Editar cuenta"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(account.id)}
                        aria-label="Eliminar cuenta"
                        className="text-error hover:text-error"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-text-muted">Balance:</span>
                      <span className={cn(
                        'font-medium',
                        getBalanceColor(account.balance, account.type)
                      )}>
                        {formatAccountBalance(account.balance, account.currency)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-text-muted">Moneda:</span>
                      <span className="text-sm font-medium">{account.currency}</span>
                    </div>

                    {account.notes && (
                      <div className="pt-2 border-t border-border-primary">
                        <p className="text-xs text-text-muted truncate" title={account.notes}>
                          {account.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-border-primary">
                    <p className="text-xs text-text-muted">
                      Creada: {new Date(account.createdAt).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal de confirmación para eliminar */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={deleteModal.closeModal}
          onConfirm={handleConfirmDelete}
          title="Eliminar Cuenta"
          message="¿Estás seguro de que quieres eliminar esta cuenta? Esta acción no se puede deshacer y se eliminarán todas las transacciones asociadas."
          confirmText="Eliminar"
          type="danger"
          isLoading={isDeletingAccount}
        />
      </div>
    </Layout>
  );
}
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
  ArrowUpDown,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAccounts, useAccountActions, useAccountSummary } from '@/stores/accountStore';
import { AccountType } from '@/types';
import { formatAccountBalance, getAccountTypeIcon, getAccountTypeName } from '@/lib/validations/account';
import { cn } from '@/lib/utils';

const accountTypeOptions = [
  { value: '', label: 'Todos los tipos' },
  { value: AccountType.ASSET, label: getAccountTypeName(AccountType.ASSET) },
  { value: AccountType.LIABILITY, label: getAccountTypeName(AccountType.LIABILITY) },
  { value: AccountType.EXPENSE, label: getAccountTypeName(AccountType.EXPENSE) },
  { value: AccountType.REVENUE, label: getAccountTypeName(AccountType.REVENUE) },
  { value: AccountType.INITIAL_BALANCE, label: getAccountTypeName(AccountType.INITIAL_BALANCE) },
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!accountToDelete) return;

    setIsDeletingAccount(true);
    try {
      await deleteAccount(accountToDelete);
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const getBalanceColor = (balance: number, type: AccountType) => {
    if (balance === 0) return 'text-muted-foreground';
    
    switch (type) {
      case AccountType.ASSET:
        return balance > 0 ? 'text-green-600' : 'text-red-600';
      case AccountType.LIABILITY:
        return balance < 0 ? 'text-green-600' : 'text-yellow-600';
      default:
        return balance > 0 ? 'text-green-600' : 'text-red-600';
    }
  };

  const getAccountIcon = (type: AccountType) => {
    const iconMap = {
      [AccountType.ASSET]: '💰',
      [AccountType.LIABILITY]: '💳',
      [AccountType.EXPENSE]: '💸',
      [AccountType.REVENUE]: '💵',
      [AccountType.INITIAL_BALANCE]: '⚖️',
    };
    return iconMap[type] || '💰';
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cuentas</h1>
            <p className="text-muted-foreground">
              Gestiona tus cuentas financieras
            </p>
          </div>
          
          <Button onClick={handleCreateAccount}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Cuenta
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Cuentas
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalAccounts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Balance Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatAccountBalance(summary.totalBalance, 'EUR')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Cuentas de Activos
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.assetCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Cuentas de Pasivos
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.liabilityCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>
              Busca y filtra tus cuentas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search" className="sr-only">
                  Buscar cuentas
                </Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Buscar cuentas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Tipo de cuenta" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  aria-label={`Orden ${sortOrder === 'asc' ? 'ascendente' : 'descendente'}`}
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Filtros activos */}
            {(searchTerm || selectedType) && (
              <div className="flex items-center gap-2 text-sm">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Filtros activos:</span>
                {searchTerm && (
                  <Badge variant="secondary">
                    Búsqueda: &ldquo;{searchTerm}&rdquo;
                  </Badge>
                )}
                {selectedType && (
                  <Badge variant="secondary">
                    Tipo: {getAccountTypeName(selectedType as AccountType)}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedType('');
                  }}
                  className="h-auto p-1 text-xs"
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error state */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              Error al cargar las cuentas: {error}
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={() => fetchAccounts()}
              >
                Reintentar
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Lista de cuentas */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAndSortedAccounts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {accounts.length === 0 ? 'No tienes cuentas aún' : 'No se encontraron cuentas'}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {accounts.length === 0 
                  ? 'Crea tu primera cuenta para comenzar a gestionar tus finanzas'
                  : 'Intenta ajustar los filtros o crear una nueva cuenta'
                }
              </p>
              <Button onClick={handleCreateAccount}>
                {accounts.length === 0 ? 'Crear mi primera cuenta' : 'Nueva Cuenta'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedAccounts.map((account, index) => (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {getAccountIcon(account.type)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{account.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {getAccountTypeName(account.type)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewAccount(account.id)}
                          aria-label="Ver cuenta"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditAccount(account.id)}
                          aria-label="Editar cuenta"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(account.id)}
                          aria-label="Eliminar cuenta"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Balance:</span>
                      <span className={cn(
                        'font-semibold',
                        getBalanceColor(account.balance, account.type)
                      )}>
                        {formatAccountBalance(account.balance, account.currency)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Moneda:</span>
                      <Badge variant="outline">{account.currency}</Badge>
                    </div>

                    {account.notes && (
                      <>
                        <Separator />
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {account.notes}
                        </p>
                      </>
                    )}

                    <Separator />
                    <p className="text-xs text-muted-foreground">
                      Creada: {new Date(account.createdAt).toLocaleDateString('es-ES')}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Dialog de confirmación para eliminar */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar Cuenta</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que quieres eliminar esta cuenta? Esta acción no se puede deshacer y se eliminarán todas las transacciones asociadas.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={isDeletingAccount}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeletingAccount ? 'Eliminando...' : 'Eliminar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
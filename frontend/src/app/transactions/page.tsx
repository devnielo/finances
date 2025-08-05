'use client';

import React, { useEffect, useState, Suspense } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useTransactions, useTransactionActions, useTransactionStats } from '@/stores/transactionStore';
import { useAccounts } from '@/stores/accountStore';
import { useCategoryStore } from '@/stores/categoryStore';
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
  { value: TransactionType.DEPOSIT, label: getTransactionTypeName(TransactionType.DEPOSIT) },
  { value: TransactionType.WITHDRAWAL, label: getTransactionTypeName(TransactionType.WITHDRAWAL) },
  { value: TransactionType.TRANSFER, label: getTransactionTypeName(TransactionType.TRANSFER) },
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

function TransactionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { transactions, isLoading, error, currentPage, totalPages, totalTransactions, filters } = useTransactions();
  const { fetchTransactions, deleteTransaction, setFilters, clearFilters, reconcileTransaction } = useTransactionActions();
  const { accounts } = useAccounts();
  const { categories, fetchCategories } = useCategoryStore();
  const stats = useTransactionStats();
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedType, setSelectedType] = useState(filters.type || '');
  const [selectedAccount, setSelectedAccount] = useState(filters.accountId || '');
  const [selectedCategory, setSelectedCategory] = useState(filters.categoryId || '');
  const [startDate, setStartDate] = useState(filters.startDate || '');
  const [endDate, setEndDate] = useState(filters.endDate || '');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pageSize, setPageSize] = useState(filters.limit?.toString() || '20');
  const [reconciledFilter, setReconciledFilter] = useState<string>('');
  
  // Modales
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [isDeletingTransaction, setIsDeletingTransaction] = useState(false);

  // Cargar categorías al montar el componente
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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
      categoryId: selectedCategory || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      sortBy: sortBy as 'date' | 'amount' | 'description' | 'createdAt',
      sortOrder,
      page: currentPage,
      limit: parseInt(pageSize),
      reconciled: reconciledFilter ? reconciledFilter === 'true' : undefined,
    };

    fetchTransactions(newFilters).catch(console.error);
  }, [searchTerm, selectedType, selectedAccount, selectedCategory, startDate, endDate, sortBy, sortOrder, currentPage, pageSize, reconciledFilter, fetchTransactions]);

  // Opciones de cuentas para el filtro
  const accountOptions = [
    { value: '', label: 'Todas las cuentas' },
    ...accounts.map(account => ({
      value: account.id,
      label: account.name,
    })),
  ];

  // Opciones de categorías para el filtro
  const getCategoryOptions = () => {
    const activeCategories = categories.filter(cat => cat.active);
    
    // Crear opciones jerárquicas
    const buildCategoryTree = (parentId: string | null = null, level: number = 0): Array<{value: string; label: string}> => {
      const children = activeCategories.filter(cat => cat.parentId === parentId);
      const options: Array<{value: string; label: string}> = [];
      
      children.forEach(category => {
        const indent = '  '.repeat(level);
        options.push({
          value: category.id,
          label: `${indent}${category.name}`,
        });
        
        // Añadir subcategorías
        options.push(...buildCategoryTree(category.id, level + 1));
      });
      
      return options;
    };

    return [
      { value: '', label: 'Todas las categorías' },
      { value: 'uncategorized', label: 'Sin categoría' },
      ...buildCategoryTree(),
    ];
  };

  const categoryOptions = getCategoryOptions();

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
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!transactionToDelete) return;

    setIsDeletingTransaction(true);
    try {
      await deleteTransaction(transactionToDelete);
      setDeleteDialogOpen(false);
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
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transacciones</h1>
            <p className="text-muted-foreground">
              Gestiona tus movimientos financieros
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Importar
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button onClick={handleCreateTransaction}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Transacción
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Transacciones
              </CardTitle>
              <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTransactions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ingresos
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                +{stats.totalIncome.toFixed(2)}€
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Gastos
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                -{stats.totalExpenses.toFixed(2)}€
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Balance Neto
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold",
                stats.netAmount >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {stats.netAmount >= 0 ? '+' : ''}{stats.netAmount.toFixed(2)}€
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.reconciledPercentage}% conciliadas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>
              Busca y filtra tus transacciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Fila 1: Búsqueda y tipo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="search">Buscar transacciones</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Buscar transacciones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="type">Tipo de transacción</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de transacción" />
                  </SelectTrigger>
                  <SelectContent>
                    {transactionTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Fila 2: Cuenta, categoría y estado */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="account">Cuenta</Label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Cuenta" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="category">Categoría</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="reconciled">Estado</Label>
                <Select value={reconciledFilter} onValueChange={setReconciledFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado de conciliación" />
                  </SelectTrigger>
                  <SelectContent>
                    {reconciledOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Fila 3: Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Fecha desde</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="endDate">Fecha hasta</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Fila 4: Ordenamiento y tamaño de página */}
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex gap-2 flex-1">
                <div className="flex-1">
                  <Label htmlFor="sortBy">Ordenar por</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
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
                </div>
                
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    aria-label={`Orden ${sortOrder === 'asc' ? 'ascendente' : 'descendente'}`}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>
                
                <div>
                  <Label htmlFor="pageSize">Por página</Label>
                  <Select value={pageSize} onValueChange={setPageSize}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {limitOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Limpiar filtros ({activeFiltersCount})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error state */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              Error al cargar las transacciones: {error}
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={() => fetchTransactions(filters)}
              >
                Reintentar
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Tabla de transacciones */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-3 p-6">
                {[...Array(5)].map((_, index) => (
                  <Skeleton key={index} className="h-16 w-full" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-16">
                <ArrowLeftRight className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No se encontraron transacciones
                </h3>
                <p className="text-muted-foreground mb-4">
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
              <>
                <Table>
                  <TableCaption>
                    Mostrando {transactions.length} de {totalTransactions} transacciones
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Estado</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Cuenta</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead className="w-24">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction, index) => (
                      <motion.tr
                        key={transaction.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="group"
                      >
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleReconciled(transaction.id, transaction.reconciled)}
                            className="p-0 h-auto"
                          >
                            {transaction.reconciled ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getTransactionIcon(transaction.type)}</span>
                            <span className="text-sm">{getTransactionTypeName(transaction.type)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            {transaction.tags && transaction.tags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {transaction.tags.slice(0, 2).map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {transaction.tags.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{transaction.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{getAccountName(transaction.sourceAccountId)}</span>
                        </TableCell>
                        <TableCell>
                          {transaction.categoryId ? (
                            <Badge variant="outline">
                              {categories.find(c => c.id === transaction.categoryId)?.name || 'N/A'}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">Sin categoría</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{formatDate(transaction.date)}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={cn(
                            "font-semibold",
                            transaction.amount >= 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {transaction.amount >= 0 ? '+' : ''}{Math.abs(transaction.amount).toFixed(2)}€
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewTransaction(transaction.id)}
                              aria-label="Ver transacción"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditTransaction(transaction.id)}
                              aria-label="Editar transacción"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(transaction.id)}
                              aria-label="Eliminar transacción"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Página {currentPage} de {totalPages} ({totalTransactions} transacciones)
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                      >
                        Siguiente
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Dialog de confirmación para eliminar */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar Transacción</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que quieres eliminar esta transacción? Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={isDeletingTransaction}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeletingTransaction ? 'Eliminando...' : 'Eliminar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}

function TransactionsPageWrapper() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <TransactionsPage />
    </Suspense>
  );
}

export default TransactionsPageWrapper;
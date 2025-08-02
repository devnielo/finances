// Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface TwoFactorData {
  token: string;
  code: string;
}

// Account Types
export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  active: boolean;
  notes?: string;
  openingBalance: number;
  openingBalanceDate?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export enum AccountType {
  ASSET = 'asset',
  EXPENSE = 'expense',
  REVENUE = 'revenue',
  LIABILITY = 'liability',
  INITIAL_BALANCE = 'initial-balance',
}

export interface CreateAccountData {
  name: string;
  type: AccountType;
  currency: string;
  openingBalance: number;
  openingBalanceDate?: string;
  notes?: string;
}

// Transaction Types
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: TransactionType;
  sourceAccountId?: string;
  destinationAccountId?: string;
  categoryId?: string;
  notes?: string;
  tags?: string[];
  reconciled: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  sourceAccount?: Account;
  destinationAccount?: Account;
  category?: Category;
}

export enum TransactionType {
  WITHDRAWAL = 'withdrawal',
  DEPOSIT = 'deposit',
  TRANSFER = 'transfer',
}

export interface CreateTransactionData {
  amount: number;
  description: string;
  date: string;
  type: TransactionType;
  sourceAccountId?: string;
  destinationAccountId?: string;
  categoryId?: string;
  notes?: string;
  tags?: string[];
}

export interface SplitTransaction {
  amount: number;
  description: string;
  categoryId?: string;
  destinationAccountId?: string;
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  accountId?: string;
  categoryId?: string;
  type?: TransactionType;
  search?: string;
  page?: number;
  limit?: number;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  active: boolean;
  order: number;
  parentId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  children?: Category[];
  parent?: Category;
  transactions?: Transaction[];
  metadata?: CategoryMetadata;
  // Virtual fields
  fullName?: string;
  isRootCategory?: boolean;
  hasChildren?: boolean;
  depth?: number;
}

export interface CategoryMetadata {
  budgetLimit?: number;
  budgetPeriod?: 'monthly' | 'quarterly' | 'yearly';
  alertThreshold?: number;
  tags?: string[];
  keywords?: string[];
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: string;
  active?: boolean;
  order?: number;
  metadata?: CategoryMetadata;
}

export interface CategoryFilters {
  search?: string;
  parentId?: string;
  hasParent?: boolean;
  active?: boolean;
  page?: number;
  limit?: number;
}

export interface CategoryStats {
  category: Category;
  transactionCount: number;
  totalAmount: number;
  subcategoryCount: number;
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
  level: number;
  expanded?: boolean;
}

export interface MoveCategoryData {
  categoryId: string;
  newParentId?: string;
}

export interface SortCategoriesData {
  categories: { id: string; order: number }[];
}

// Dashboard Types
export interface DashboardMetrics {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netWorth: number;
  accountsCount: number;
  transactionsCount: number;
}

export interface ChartDataPoint {
  date: string;
  amount: number;
  label?: string;
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  color?: string;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// UI Types
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  badge?: number;
  children?: NavigationItem[];
}

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

// Theme Types
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}
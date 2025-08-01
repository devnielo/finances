'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Tags,
  TrendingUp,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  CreditCard,
  Receipt,
  BarChart3,
  PiggyBank,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, useAuthActions } from '@/stores/authStore';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    badge: undefined,
  },
  {
    id: 'accounts',
    label: 'Cuentas',
    href: '/accounts',
    icon: Wallet,
    badge: undefined,
  },
  {
    id: 'transactions',
    label: 'Transacciones',
    href: '/transactions',
    icon: ArrowLeftRight,
    badge: undefined,
  },
  {
    id: 'categories',
    label: 'Categorías',
    href: '/categories',
    icon: Tags,
    badge: undefined,
  },
  {
    id: 'reports',
    label: 'Reportes',
    href: '/reports',
    icon: BarChart3,
    badge: undefined,
  },
  {
    id: 'budgets',
    label: 'Presupuestos',
    href: '/budgets',
    icon: PiggyBank,
    badge: undefined,
  },
];

const secondaryItems = [
  {
    id: 'profile',
    label: 'Perfil',
    href: '/profile',
    icon: User,
  },
  {
    id: 'settings',
    label: 'Configuración',
    href: '/settings',
    icon: Settings,
  },
];

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { logout } = useAuthActions();

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(
          'fixed left-0 top-0 h-full w-64 bg-background-primary border-r border-border-primary z-50',
          'lg:translate-x-0 lg:static lg:z-auto',
          'flex flex-col'
        )}
      >
        {/* Header del Sidebar */}
        <div className="flex items-center justify-between p-6 border-b border-border-primary">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">FinanceApp</span>
          </Link>
          
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-background-hover transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Navegación Principal */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <div className="mb-6">
            <h3 className="px-3 text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Navegación
            </h3>
            
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    // Cerrar sidebar en móvil al hacer clic
                    if (window.innerWidth < 1024) {
                      onToggle();
                    }
                  }}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group',
                    isActive
                      ? 'bg-accent-primary/10 text-accent-primary border-r-2 border-accent-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-background-hover'
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={cn(
                      'w-5 h-5',
                      isActive ? 'text-accent-primary' : 'text-text-muted group-hover:text-text-secondary'
                    )} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  
                  {item.badge && (
                    <span className="badge badge-purple text-xs">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Navegación Secundaria */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Usuario
            </h3>
            
            {secondaryItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      onToggle();
                    }
                  }}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                    isActive
                      ? 'bg-accent-primary/10 text-accent-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-background-hover'
                  )}
                >
                  <Icon className={cn(
                    'w-5 h-5',
                    isActive ? 'text-accent-primary' : 'text-text-muted group-hover:text-text-secondary'
                  )} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer del Sidebar */}
        <div className="p-4 border-t border-border-primary">
          {/* Información del Usuario */}
          {user && (
            <div className="mb-4 p-3 rounded-lg bg-background-card">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-text-muted truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Botón de Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-error hover:bg-error/10 transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 text-text-muted group-hover:text-error" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
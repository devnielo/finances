'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Menu,
  Search,
  Bell,
  Plus,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
  CreditCard,
  ArrowLeftRight,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, useAuthActions } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  onSidebarToggle: () => void;
  title?: string;
  subtitle?: string;
}

export default function Header({ onSidebarToggle, title, subtitle }: HeaderProps) {
  const { user } = useAuth();
  const { logout } = useAuthActions();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Aquí se puede implementar la lógica para cambiar el tema
  };

  const quickActions = [
    {
      id: 'new-transaction',
      label: 'Nueva Transacción',
      icon: ArrowLeftRight,
      href: '/transactions/new',
      color: 'text-accent-primary',
    },
    {
      id: 'new-account',
      label: 'Nueva Cuenta',
      icon: Wallet,
      href: '/accounts/new',
      color: 'text-success',
    },
    {
      id: 'transfer',
      label: 'Transferencia',
      icon: CreditCard,
      href: '/transfers/new',
      color: 'text-info',
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-background-primary/80 backdrop-blur-md border-b border-border-primary">
      <div className="flex items-center justify-between px-4 lg:px-6 py-4">
        {/* Lado izquierdo */}
        <div className="flex items-center space-x-4">
          {/* Botón de menú móvil */}
          <button
            onClick={onSidebarToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-background-hover transition-colors"
          >
            <Menu className="w-5 h-5 text-text-secondary" />
          </button>

          {/* Título y subtítulo */}
          <div className="hidden sm:block">
            {title && (
              <h1 className="text-xl lg:text-2xl font-bold text-text-primary">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-sm text-text-muted mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Centro - Búsqueda */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar transacciones, cuentas..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lado derecho */}
        <div className="flex items-center space-x-3">
          {/* Acciones rápidas */}
          <div className="hidden lg:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span className="font-medium">Nuevo</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Acciones rápidas</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <DropdownMenuItem key={action.id} asChild>
                      <a href={action.href} className="flex items-center space-x-3">
                        <Icon className={cn('w-4 h-4', action.color)} />
                        <span>{action.label}</span>
                      </a>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Notificaciones */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-3 w-3 p-0 text-xs">
              <span className="sr-only">Notificaciones</span>
            </Badge>
          </Button>

          {/* Toggle de tema */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDarkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>

          {/* Menú de usuario */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-background-hover transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <ChevronDown className={cn(
                'w-4 h-4 text-text-secondary transition-transform duration-200 hidden sm:block',
                isUserMenuOpen && 'rotate-180'
              )} />
            </button>

            {/* Dropdown del usuario */}
            {isUserMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-56 bg-background-card border border-border-primary rounded-lg shadow-spotify-lg z-50"
              >
                {/* Info del usuario */}
                {user && (
                  <div className="px-4 py-3 border-b border-border-primary">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-text-muted truncate">
                      {user.email}
                    </p>
                  </div>
                )}

                {/* Opciones del menú */}
                <div className="py-2">
                  <a
                    href="/profile"
                    className="flex items-center space-x-3 px-4 py-2 hover:bg-background-hover transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <User className="w-4 h-4 text-text-muted" />
                    <span className="text-text-primary">Mi Perfil</span>
                  </a>
                  
                  <a
                    href="/settings"
                    className="flex items-center space-x-3 px-4 py-2 hover:bg-background-hover transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4 text-text-muted" />
                    <span className="text-text-primary">Configuración</span>
                  </a>

                  <div className="border-t border-border-primary mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-error/10 text-error transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Búsqueda móvil */}
      <div className="px-4 pb-4 md:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Overlay para cerrar menús */}
      {(isUserMenuOpen || isQuickActionsOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsUserMenuOpen(false);
            setIsQuickActionsOpen(false);
          }}
        />
      )}
    </header>
  );
}
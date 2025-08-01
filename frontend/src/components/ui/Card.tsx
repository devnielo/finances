'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  purple?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export default function Card({ 
  children, 
  className, 
  hover = false, 
  purple = false,
  padding = 'md',
  onClick 
}: CardProps) {
  const Component = onClick ? motion.div : 'div';
  
  return (
    <Component
      onClick={onClick}
      whileHover={hover ? { y: -2, scale: 1.01 } : {}}
      transition={{ duration: 0.2 }}
      className={cn(
        'card',
        hover && 'card-hover cursor-pointer',
        purple && 'card-purple',
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </Component>
  );
}

// Subcomponentes para Card
export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-lg font-semibold text-text-primary', className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('text-sm text-text-muted mt-1', className)}>
      {children}
    </p>
  );
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(className)}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-border-primary', className)}>
      {children}
    </div>
  );
}

// Card con estadísticas
interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ title, value, change, icon, className }: StatCardProps) {
  return (
    <Card hover className={cn('relative overflow-hidden', className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-text-muted">{title}</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
          {change && (
            <div className={cn(
              'flex items-center mt-2 text-sm',
              change.isPositive ? 'text-success' : 'text-error'
            )}>
              <span>{change.isPositive ? '+' : ''}{change.value}%</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-accent-primary opacity-80">
            {icon}
          </div>
        )}
      </div>
      
      {/* Gradiente decorativo */}
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-accent-primary/10 to-accent-secondary/5 rounded-full" />
    </Card>
  );
}

// Card de balance
interface BalanceCardProps {
  title: string;
  balance: number;
  currency?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  className?: string;
}

export function BalanceCard({ 
  title, 
  balance, 
  currency = 'EUR', 
  trend, 
  trendValue,
  className 
}: BalanceCardProps) {
  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-success';
      case 'down': return 'text-error';
      default: return 'text-text-muted';
    }
  };

  return (
    <Card purple className={cn('text-center', className)}>
      <CardHeader>
        <CardTitle className="text-text-secondary">{title}</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="text-balance text-gradient mb-2">
          {formatBalance(balance)}
        </div>
        
        {trend && trendValue && (
          <div className={cn('text-sm', getTrendColor())}>
            {trend === 'up' && '↗ '}
            {trend === 'down' && '↘ '}
            {trend === 'stable' && '→ '}
            {formatBalance(trendValue)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Card de transacción
interface TransactionCardProps {
  description: string;
  amount: number;
  currency?: string;
  date: string;
  category?: string;
  type: 'income' | 'expense' | 'transfer';
  className?: string;
  onClick?: () => void;
}

export function TransactionCard({ 
  description, 
  amount, 
  currency = 'EUR', 
  date, 
  category, 
  type,
  className,
  onClick 
}: TransactionCardProps) {
  const formatAmount = (value: number) => {
    const formatted = new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency,
    }).format(Math.abs(value));
    
    if (type === 'expense') return `-${formatted}`;
    if (type === 'income') return `+${formatted}`;
    return formatted;
  };

  const getAmountColor = () => {
    switch (type) {
      case 'income': return 'text-success';
      case 'expense': return 'text-error';
      default: return 'text-info';
    }
  };

  return (
    <Card hover onClick={onClick} className={cn('transition-all duration-200', className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-text-primary truncate">{description}</p>
          {category && (
            <p className="text-sm text-text-muted">{category}</p>
          )}
          <p className="text-xs text-text-muted mt-1">{date}</p>
        </div>
        
        <div className={cn('font-semibold text-right', getAmountColor())}>
          {formatAmount(amount)}
        </div>
      </div>
    </Card>
  );
}
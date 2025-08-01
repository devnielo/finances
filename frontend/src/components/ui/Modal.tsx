'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  preventClose?: boolean;
  showCloseButton?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-4',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className,
  preventClose = false,
  showCloseButton = true,
}: ModalProps) {
  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !preventClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, preventClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !preventClose) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleBackdropClick}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'relative w-full bg-surface-primary rounded-lg shadow-xl',
              'border border-border-primary',
              sizeClasses[size],
              className
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-6 border-b border-border-primary">
                {title && (
                  <h2 id="modal-title" className="text-lg font-semibold text-text-primary">
                    {title}
                  </h2>
                )}
                {showCloseButton && !preventClose && (
                  <button
                    onClick={onClose}
                    className="p-1 rounded-md hover:bg-surface-hover transition-colors"
                    aria-label="Cerrar modal"
                  >
                    <X className="w-5 h-5 text-text-muted" />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className={cn(
              'p-6',
              (title || showCloseButton) && 'pt-0'
            )}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Modal de confirmación
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  const getConfirmVariant = () => {
    switch (type) {
      case 'danger':
        return 'danger';
      case 'warning':
        return 'secondary';
      default:
        return 'primary';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      preventClose={isLoading}
      showCloseButton={!isLoading}
    >
      <div className="space-y-4">
        <p className="text-text-secondary">{message}</p>
        
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={getConfirmVariant()}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// Modal de formulario
interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function FormModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  isLoading = false,
  size = 'md',
}: FormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      preventClose={isLoading}
      showCloseButton={!isLoading}
    >
      <div className="space-y-6">
        {children}
        
        {footer && (
          <div className="flex justify-end space-x-3 pt-4 border-t border-border-primary">
            {footer}
          </div>
        )}
      </div>
    </Modal>
  );
}

// Modal de información
interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onAction?: () => void;
  actionText?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function InfoModal({
  isOpen,
  onClose,
  title,
  children,
  onAction,
  actionText = 'Entendido',
  size = 'md',
}: InfoModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
    >
      <div className="space-y-4">
        {children}
        
        <div className="flex justify-end space-x-3">
          {onAction ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={onAction}>
                {actionText}
              </Button>
            </>
          ) : (
            <Button variant="primary" onClick={onClose}>
              {actionText}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

// Hook para manejar modales
export function useModal() {
  const [isOpen, setIsOpen] = React.useState(false);

  const openModal = React.useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleModal = React.useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
  };
}
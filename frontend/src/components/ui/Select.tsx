'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  className?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  name?: string;
}

export default function Select({
  options,
  value,
  placeholder = 'Seleccionar...',
  disabled = false,
  error,
  label,
  required,
  className,
  onChange,
  onBlur,
  name,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find(option => option.value === value);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          const option = options[highlightedIndex];
          if (!option.disabled) {
            handleSelect(option.value);
          }
        } else {
          setIsOpen(true);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev => {
            const nextIndex = prev < options.length - 1 ? prev + 1 : 0;
            return options[nextIndex].disabled ? nextIndex + 1 : nextIndex;
          });
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setHighlightedIndex(prev => {
            const nextIndex = prev > 0 ? prev - 1 : options.length - 1;
            return options[nextIndex].disabled ? nextIndex - 1 : nextIndex;
          });
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
        onBlur?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onBlur]);

  // Scroll to highlighted option
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
        });
      }
    }
  }, [highlightedIndex]);

  return (
    <div className={cn('relative', className)} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-1">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <div
        className={cn(
          'input-base cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed',
          error && 'border-error',
          isOpen && 'border-accent-primary'
        )}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={label}
        data-name={name}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            {selectedOption?.icon && (
              <span className="flex-shrink-0">{selectedOption.icon}</span>
            )}
            <span className={cn(
              'truncate',
              selectedOption ? 'text-text-primary' : 'text-text-muted'
            )}>
              {selectedOption?.label || placeholder}
            </span>
          </div>
          
          <ChevronDown 
            className={cn(
              'w-4 h-4 text-text-muted transition-transform duration-200',
              isOpen && 'transform rotate-180'
            )} 
          />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.1 }}
            className="absolute z-50 w-full mt-1 bg-surface-primary border border-border-primary rounded-lg shadow-lg max-h-60 overflow-auto"
          >
            <ul
              ref={listRef}
              role="listbox"
              className="py-1"
            >
              {options.map((option, index) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={value === option.value}
                  className={cn(
                    'px-3 py-2 cursor-pointer transition-colors duration-150',
                    'flex items-center justify-between',
                    option.disabled && 'opacity-50 cursor-not-allowed',
                    !option.disabled && 'hover:bg-surface-hover',
                    highlightedIndex === index && !option.disabled && 'bg-surface-hover',
                    value === option.value && 'bg-accent-primary/10 text-accent-primary'
                  )}
                  onClick={() => !option.disabled && handleSelect(option.value)}
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {option.icon && (
                      <span className="flex-shrink-0">{option.icon}</span>
                    )}
                    <span className="truncate">{option.label}</span>
                  </div>
                  
                  {value === option.value && (
                    <Check className="w-4 h-4 text-accent-primary" />
                  )}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="mt-1 text-sm text-error">{error}</p>
      )}
    </div>
  );
}

// Componente Multi-Select
interface MultiSelectProps extends Omit<SelectProps, 'value' | 'onChange'> {
  value: string[];
  onChange: (values: string[]) => void;
  maxSelections?: number;
}

export function MultiSelect({
  options,
  value,
  placeholder = 'Seleccionar opciones...',
  disabled = false,
  error,
  label,
  required,
  className,
  onChange,
  onBlur,
  name,
  maxSelections,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOptions = options.filter(option => value.includes(option.value));

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (optionValue: string) => {
    const isSelected = value.includes(optionValue);
    let newValue: string[];

    if (isSelected) {
      newValue = value.filter(v => v !== optionValue);
    } else {
      if (maxSelections && value.length >= maxSelections) {
        return; // No permitir más selecciones
      }
      newValue = [...value, optionValue];
    }

    onChange(newValue);
  };

  const handleRemove = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== optionValue));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onBlur?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onBlur]);

  return (
    <div className={cn('relative', className)} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-1">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <div
        className={cn(
          'input-base cursor-pointer min-h-[2.5rem]',
          disabled && 'opacity-50 cursor-not-allowed',
          error && 'border-error',
          isOpen && 'border-accent-primary'
        )}
        onClick={handleToggle}
        data-name={name}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex-1 min-w-0">
            {selectedOptions.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {selectedOptions.map(option => (
                  <span
                    key={option.value}
                    className="inline-flex items-center px-2 py-1 rounded-md bg-accent-primary/10 text-accent-primary text-sm"
                  >
                    {option.icon && <span className="mr-1">{option.icon}</span>}
                    {option.label}
                    <button
                      type="button"
                      onClick={(e) => handleRemove(option.value, e)}
                      className="ml-1 hover:text-accent-secondary"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-text-muted">{placeholder}</span>
            )}
          </div>
          
          <ChevronDown 
            className={cn(
              'w-4 h-4 text-text-muted transition-transform duration-200 flex-shrink-0',
              isOpen && 'transform rotate-180'
            )} 
          />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.1 }}
            className="absolute z-50 w-full mt-1 bg-surface-primary border border-border-primary rounded-lg shadow-lg max-h-60 overflow-auto"
          >
            <ul className="py-1">
              {options.map((option) => {
                const isSelected = value.includes(option.value);
                const isDisabled = option.disabled || 
                  (maxSelections && !isSelected && value.length >= maxSelections);

                return (
                  <li
                    key={option.value}
                    className={cn(
                      'px-3 py-2 cursor-pointer transition-colors duration-150',
                      'flex items-center justify-between',
                      isDisabled && 'opacity-50 cursor-not-allowed',
                      !isDisabled && 'hover:bg-surface-hover',
                      isSelected && 'bg-accent-primary/10 text-accent-primary'
                    )}
                    onClick={() => !isDisabled && handleSelect(option.value)}
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      {option.icon && (
                        <span className="flex-shrink-0">{option.icon}</span>
                      )}
                      <span className="truncate">{option.label}</span>
                    </div>
                    
                    {isSelected && (
                      <Check className="w-4 h-4 text-accent-primary" />
                    )}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="mt-1 text-sm text-error">{error}</p>
      )}
    </div>
  );
}
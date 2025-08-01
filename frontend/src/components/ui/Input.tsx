'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputProps {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date';
  placeholder?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  name?: string;
  id?: string;
  autoComplete?: string;
  min?: number;
  max?: number;
  step?: number;
  'aria-label'?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      type = 'text',
      placeholder,
      value,
      defaultValue,
      onChange,
      onBlur,
      onFocus,
      error,
      disabled = false,
      required = false,
      className,
      leftIcon,
      rightIcon,
      name,
      id,
      autoComplete,
      min,
      max,
      step,
      'aria-label': ariaLabel,
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);

    const inputType = type === 'password' && showPassword ? 'text' : type;
    const inputId = id || name;

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(event);
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(event);
    };

    return (
      <div className={cn('w-full', className)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'label',
              error && 'label-error'
            )}
          >
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <motion.input
            ref={ref}
            type={inputType}
            id={inputId}
            name={name}
            placeholder={placeholder}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            required={required}
            autoComplete={autoComplete}
            min={min}
            max={max}
            step={step}
            aria-label={ariaLabel}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : undefined}
            whileFocus={{ scale: 1.01 }}
            transition={{ duration: 0.1 }}
            className={cn(
              'input',
              error && 'input-error',
              leftIcon && 'pl-10',
              (rightIcon || type === 'password') && 'pr-10',
              disabled && 'disabled'
            )}
          />

          {/* Right Icon or Password Toggle */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {type === 'password' ? (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-text-muted hover:text-text-secondary transition-colors p-1"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            ) : (
              rightIcon && (
                <div className="text-text-muted">
                  {rightIcon}
                </div>
              )
            )}
          </div>

          {/* Focus Ring */}
          {isFocused && (
            <motion.div
              layoutId="input-focus"
              className="absolute inset-0 border-2 border-accent-primary rounded-lg pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center mt-2 text-sm text-error"
            id={`${inputId}-error`}
          >
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

// Textarea Component
interface TextareaProps {
  label?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
  className?: string;
  name?: string;
  id?: string;
  'aria-label'?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      placeholder,
      value,
      defaultValue,
      onChange,
      onBlur,
      onFocus,
      error,
      disabled = false,
      required = false,
      rows = 4,
      className,
      name,
      id,
      'aria-label': ariaLabel,
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const textareaId = id || name;

    const handleFocus = (event: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      onFocus?.(event);
    };

    const handleBlur = (event: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false);
      onBlur?.(event);
    };

    return (
      <div className={cn('w-full', className)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={textareaId}
            className={cn(
              'label',
              error && 'label-error'
            )}
          >
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </label>
        )}

        {/* Textarea Container */}
        <div className="relative">
          <motion.textarea
            ref={ref}
            id={textareaId}
            name={name}
            placeholder={placeholder}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            required={required}
            rows={rows}
            aria-label={ariaLabel}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${textareaId}-error` : undefined}
            whileFocus={{ scale: 1.01 }}
            transition={{ duration: 0.1 }}
            className={cn(
              'input resize-none',
              error && 'input-error',
              disabled && 'disabled'
            )}
          />

          {/* Focus Ring */}
          {isFocused && (
            <motion.div
              layoutId="textarea-focus"
              className="absolute inset-0 border-2 border-accent-primary rounded-lg pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center mt-2 text-sm text-error"
            id={`${textareaId}-error`}
          >
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
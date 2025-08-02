'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { validColors } from '@/lib/validations/categories';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
  label?: string;
  error?: string;
  className?: string;
}

export default function ColorPicker({
  value,
  onChange,
  label,
  error,
  className,
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleColorSelect = (color: string) => {
    onChange(color);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center space-x-3 w-full p-3 rounded-lg border transition-colors',
          'bg-gray-800 border-gray-700 hover:border-gray-600',
          error && 'border-red-500',
          'focus:outline-none focus:ring-2 focus:ring-purple-500'
        )}
      >
        <div
          className="w-6 h-6 rounded-full border-2 border-gray-600"
          style={{ backgroundColor: value || '#8b5cf6' }}
        />
        <span className="text-gray-300 flex-1 text-left">
          {value ? value.toUpperCase() : 'Seleccionar color'}
        </span>
        <div className="text-gray-400">
          {isOpen ? '▲' : '▼'}
        </div>
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute z-50 w-full mt-2 p-4 bg-gray-800 border border-gray-700 rounded-lg shadow-lg"
        >
          <div className="grid grid-cols-5 gap-3">
            {validColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleColorSelect(color)}
                className={cn(
                  'relative w-8 h-8 rounded-full border-2 transition-all hover:scale-110',
                  value === color ? 'border-white' : 'border-gray-600 hover:border-gray-400'
                )}
                style={{ backgroundColor: color }}
                title={color}
              >
                {value === color && (
                  <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />
                )}
              </button>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-700">
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#8b5cf6"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              pattern="^#[0-9A-Fa-f]{6}$"
            />
            <p className="text-xs text-gray-400 mt-1">
              O ingresa un color hexadecimal personalizado
            </p>
          </div>
        </motion.div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
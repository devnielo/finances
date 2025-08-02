'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, Car, ShoppingCart, Coffee, Utensils, Gamepad2,
  Music, Book, Plane, Heart, Gift, Shirt, Smartphone,
  Laptop, CreditCard, PiggyBank, TrendingUp, TrendingDown,
  DollarSign, Euro, Building, Fuel, ShoppingBag, Pizza,
  Bus, Train, Bike, Wallet, Receipt, Calculator,
  Briefcase, GraduationCap, Stethoscope, Dumbbell, Users,
  Baby, Dog, Cat, Trees, Lightbulb, Wrench, Palette,
  Camera, Monitor, Headphones, Calendar, MapPin, Star,
  Check, Search
} from 'lucide-react';
import { validIcons } from '@/lib/validations/categories';
import { cn } from '@/lib/utils';

// Map de iconos de string a componente
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home, Car, ShoppingCart, Coffee, Utensils, Gamepad2,
  Music, Book, Plane, Heart, Gift, Shirt, Smartphone,
  Laptop, CreditCard, PiggyBank, TrendingUp, TrendingDown,
  DollarSign, Euro, Building, Fuel, ShoppingBag, Pizza,
  Bus, Train, Bike, Wallet, Receipt, Calculator,
  Briefcase, GraduationCap, Stethoscope, Dumbbell, Users,
  Baby, Dog, Cat, Trees, Lightbulb, Wrench, Palette,
  Camera, Monitor, Headphones, Calendar, MapPin, Star,
};

interface IconPickerProps {
  value?: string;
  onChange: (icon: string) => void;
  label?: string;
  error?: string;
  className?: string;
}

export default function IconPicker({
  value,
  onChange,
  label,
  error,
  className,
}: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleIconSelect = (icon: string) => {
    onChange(icon);
    setIsOpen(false);
  };

  const filteredIcons = validIcons.filter(icon =>
    icon.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIconComponent = (iconName: string) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
  };

  const selectedIconComponent = value ? getIconComponent(value) : null;

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
        <div className="w-6 h-6 flex items-center justify-center text-gray-400">
          {selectedIconComponent || <Star className="w-5 h-5" />}
        </div>
        <span className="text-gray-300 flex-1 text-left">
          {value || 'Seleccionar icono'}
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
          className="absolute z-50 w-full mt-2 p-4 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-80 overflow-hidden"
        >
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar iconos..."
              className="w-full pl-10 pr-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Icons Grid */}
          <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
            {filteredIcons.map((iconName) => {
              const IconComponent = iconMap[iconName];
              if (!IconComponent) return null;

              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => handleIconSelect(iconName)}
                  className={cn(
                    'p-3 rounded-lg border-2 transition-all hover:scale-105',
                    'flex items-center justify-center',
                    value === iconName
                      ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                      : 'border-gray-600 hover:border-gray-400 text-gray-400 hover:text-gray-300'
                  )}
                  title={iconName}
                >
                  <IconComponent className="w-5 h-5" />
                </button>
              );
            })}
          </div>

          {filteredIcons.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No se encontraron iconos</p>
              <p className="text-sm">Intenta con otra búsqueda</p>
            </div>
          )}

          {/* Categories for easier navigation */}
          {!searchQuery && (
            <div className="mt-4 pt-3 border-t border-gray-700">
              <p className="text-xs text-gray-400 mb-2">Categorías sugeridas:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Hogar', icons: ['Home', 'Lightbulb', 'Wrench'] },
                  { name: 'Transporte', icons: ['Car', 'Bus', 'Plane', 'Bike'] },
                  { name: 'Comida', icons: ['Coffee', 'Utensils', 'Pizza'] },
                  { name: 'Compras', icons: ['ShoppingCart', 'ShoppingBag', 'Gift'] },
                  { name: 'Finanzas', icons: ['DollarSign', 'PiggyBank', 'CreditCard'] },
                ].map((category) => (
                  <div key={category.name} className="text-xs">
                    <span className="text-gray-500">{category.name}:</span>
                    <div className="inline-flex ml-1 space-x-1">
                      {category.icons.map((iconName) => {
                        const IconComponent = iconMap[iconName];
                        return IconComponent ? (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => handleIconSelect(iconName)}
                            className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-300"
                          >
                            <IconComponent className="w-3 h-3" />
                          </button>
                        ) : null;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
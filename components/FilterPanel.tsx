'use client';

import { Plus, X, Filter } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface FilterConfig {
  column: string;
  type: string;
  operator: string;
  value: any;
}

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  columns: string[];
  items: any[];
  filters: FilterConfig[];
  onAddFilter: (filter: FilterConfig) => void;
  onRemoveFilter: (index: number) => void;
  onUpdateFilter: (index: number, filter: FilterConfig) => void;
}

const OPERATORS = {
  text: ['equals', 'does_not_equal', 'contains', 'does_not_contain', 'is_empty', 'is_not_empty'],
  number: ['equals', 'does_not_equal', 'greater_than', 'less_than', 'is_empty', 'is_not_empty'],
  checkbox: ['equals', 'does_not_equal'],
  select: ['equals', 'does_not_equal', 'is_empty', 'is_not_empty'],
  multi_select: ['contains', 'does_not_contain', 'is_empty', 'is_not_empty'],
  status: ['equals', 'does_not_equal', 'is_empty', 'is_not_empty'],
  date: ['equals', 'before', 'after', 'is_empty', 'is_not_empty'],
};

// Map Notion colors to Tailwind classes
const getColorClass = (color: string): string => {
  const colorMap: Record<string, string> = {
    gray: 'bg-gray-400',
    brown: 'bg-amber-600',
    orange: 'bg-orange-500',
    yellow: 'bg-yellow-400',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
    red: 'bg-red-500',
    default: 'bg-gray-400'
  };
  return colorMap[color] || colorMap.default;
};

export default function FilterPanel({ 
  isOpen, 
  onClose, 
  columns, 
  items, 
  filters, 
  onAddFilter, 
  onRemoveFilter, 
  onUpdateFilter 
}: FilterPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const detectType = (column: string): string => {
    if (!items || items.length === 0) return 'text';
    
    for (const item of items) {
      const value = item.properties?.[column];
      if (value) {
        if (value.type === 'checkbox') return 'checkbox';
        if (value.type === 'number') return 'number';
        if (value.type === 'select') return 'select';
        if (value.type === 'multi_select') return 'multi_select';
        if (value.type === 'status') return 'status';
        if (value.type === 'date') return 'date';
        if (value.type === 'rich_text' || value.type === 'title') return 'text';
      }
    }
    return 'text';
  };

  const handleAddFilter = () => {
    const firstColumn = columns[0];
    const type = detectType(firstColumn);
    onAddFilter({
      column: firstColumn,
      type: type,
      operator: 'equals',
      value: '',
    });
  };

  const getOperators = (type: string): string[] => {
    return OPERATORS[type as keyof typeof OPERATORS] || OPERATORS.text;
  };

  // Extract unique values for a given column
  const getUniqueValues = (columnName: string, type: string) => {
    const values = new Map();
    
    items.forEach(item => {
      const property = item.properties?.[columnName];
      if (!property) return;
      
      if (type === 'select' && property.select) {
        values.set(property.select.name, property.select);
      } else if (type === 'multi_select' && property.multi_select) {
        property.multi_select.forEach((option: any) => {
          values.set(option.name, option);
        });
      } else if (type === 'status' && property.status) {
        values.set(property.status.name, property.status);
      }
    });
    
    return Array.from(values.values());
  };

  const renderValueInput = (filter: FilterConfig, index: number) => {
    const needsValue = !['is_empty', 'is_not_empty'].includes(filter.operator);
    
    if (!needsValue) return null;

    // For select, multi_select, and status, show dropdown with actual values
    if (filter.type === 'select' || filter.type === 'multi_select' || filter.type === 'status') {
      const uniqueValues = getUniqueValues(filter.column, filter.type);
      
      if (uniqueValues.length > 0) {
        const selectedOption = uniqueValues.find(opt => opt.name === filter.value);
        
        return (
          <div className="flex-1 flex items-center gap-2">
            {selectedOption && (
              <div className={`w-4 h-4 rounded flex-shrink-0 ${getColorClass(selectedOption.color)}`} />
            )}
            <select
              value={filter.value || ''}
              onChange={(e) => onUpdateFilter(index, { ...filter, value: e.target.value })}
              className="flex-1 px-2 sm:px-3 py-1.5 bg-gray-700 text-white border border-gray-600 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            >
              <option value="">Select a value</option>
              {uniqueValues.map((option) => (
                <option key={option.name} value={option.name}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        );
      }
    }

    if (filter.type === 'checkbox') {
      return (
        <select
          value={filter.value || 'false'}
          onChange={(e) => onUpdateFilter(index, { ...filter, value: e.target.value })}
          className="flex-1 px-2 sm:px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
        >
          <option value="true">Checked</option>
          <option value="false">Unchecked</option>
        </select>
      );
    }

    if (filter.type === 'number') {
      return (
        <input
          type="number"
          value={filter.value || ''}
          onChange={(e) => onUpdateFilter(index, { ...filter, value: e.target.value })}
          placeholder="Enter value"
          className="flex-1 px-2 sm:px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
        />
      );
    }

    if (filter.type === 'date') {
      return (
        <input
          type="date"
          value={filter.value || ''}
          onChange={(e) => onUpdateFilter(index, { ...filter, value: e.target.value })}
          className="flex-1 px-2 sm:px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
        />
      );
    }

    return (
      <input
        type="text"
        value={filter.value || ''}
        onChange={(e) => onUpdateFilter(index, { ...filter, value: e.target.value })}
        placeholder="Enter value"
        className="flex-1 px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
      />
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      
      <div 
        ref={panelRef}
        className="absolute right-0 top-0 h-full w-full sm:max-w-md bg-gray-900 text-white shadow-xl transform transition-transform duration-300"
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Filters</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
          {filters.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No filters applied. Click "Add Filter" to get started.
            </p>
          ) : (
            filters.map((filter, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2">
                  <select
                    value={filter.column}
                    onChange={(e) => {
                      const newColumn = e.target.value;
                      const newType = detectType(newColumn);
                      onUpdateFilter(index, { 
                        ...filter, 
                        column: newColumn, 
                        type: newType,
                        operator: getOperators(newType)[0],
                        value: ''
                      });
                    }}
                    className="flex-1 px-2 sm:px-3 py-1.5 bg-gray-700 text-white border border-gray-600 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  >
                    {columns.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => onRemoveFilter(index)}
                    className="p-1.5 hover:bg-red-800 text-red-400 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={filter.operator}
                    onChange={(e) => onUpdateFilter(index, { ...filter, operator: e.target.value })}
                    className="flex-1 px-2 sm:px-3 py-1.5 bg-gray-700 text-white border border-gray-600 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  >
                    {getOperators(filter.type).map((op) => (
                      <option key={op} value={op}>
                        {op.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                  {renderValueInput(filter, index)}
                </div>
              </div>
            ))
          )}

          <button
            onClick={handleAddFilter}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Filter
          </button>
        </div>
      </div>
    </div>
  );
}
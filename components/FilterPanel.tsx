'use client';

import { Plus, X } from 'lucide-react';
import type { NotionFilter } from '@/lib/notion';

interface FilterPanelProps {
  properties: Record<string, any>;
  filters: NotionFilter[];
  onFiltersChange: (filters: NotionFilter[]) => void;
}

const CONDITIONS = {
  text: ['equals', 'does_not_equal', 'contains', 'does_not_contain', 'is_empty', 'is_not_empty'],
  number: ['equals', 'does_not_equal', 'greater_than', 'less_than', 'is_empty', 'is_not_empty'],
  checkbox: ['equals', 'does_not_equal'],
  select: ['equals', 'does_not_equal', 'is_empty', 'is_not_empty'],
  multi_select: ['contains', 'does_not_contain', 'is_empty', 'is_not_empty'],
  date: ['equals', 'before', 'after', 'is_empty', 'is_not_empty'],
};

export default function FilterPanel({ properties, filters, onFiltersChange }: FilterPanelProps) {
  const addFilter = () => {
    const firstProperty = Object.keys(properties)[0];
    onFiltersChange([
      ...filters,
      {
        property: firstProperty,
        condition: 'equals',
        value: '',
      },
    ]);
  };

  const updateFilter = (index: number, updates: Partial<NotionFilter>) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], ...updates };
    onFiltersChange(newFilters);
  };

  const removeFilter = (index: number) => {
    onFiltersChange(filters.filter((_, i) => i !== index));
  };

  const getPropertyType = (propertyName: string): string => {
    return properties[propertyName]?.type || 'text';
  };

  const getAvailableConditions = (propertyName: string): string[] => {
    const type = getPropertyType(propertyName);
    switch (type) {
      case 'title':
      case 'rich_text':
      case 'url':
      case 'email':
      case 'phone_number':
        return CONDITIONS.text;
      case 'number':
        return CONDITIONS.number;
      case 'checkbox':
        return CONDITIONS.checkbox;
      case 'select':
        return CONDITIONS.select;
      case 'multi_select':
        return CONDITIONS.multi_select;
      case 'date':
        return CONDITIONS.date;
      default:
        return CONDITIONS.text;
    }
  };

  const needsValueInput = (condition: string): boolean => {
    return !['is_empty', 'is_not_empty'].includes(condition);
  };

  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Filters</h3>
        <button
          onClick={addFilter}
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <Plus className="h-4 w-4" />
          Add filter
        </button>
      </div>

      {filters.length === 0 ? (
        <p className="text-sm text-muted-foreground">No filters applied</p>
      ) : (
        <div className="space-y-3">
          {filters.map((filter, index) => (
            <div key={index} className="flex items-center gap-2">
              <select
                value={filter.property}
                onChange={(e) => updateFilter(index, { 
                  property: e.target.value,
                  condition: getAvailableConditions(e.target.value)[0],
                })}
                className="px-3 py-1 border rounded-md bg-background text-sm"
              >
                {Object.entries(properties).map(([key, prop]) => (
                  <option key={key} value={key}>
                    {prop.name}
                  </option>
                ))}
              </select>

              <select
                value={filter.condition}
                onChange={(e) => updateFilter(index, { condition: e.target.value })}
                className="px-3 py-1 border rounded-md bg-background text-sm"
              >
                {getAvailableConditions(filter.property).map((condition) => (
                  <option key={condition} value={condition}>
                    {condition.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>

              {needsValueInput(filter.condition) && (
                <input
                  type="text"
                  value={filter.value}
                  onChange={(e) => updateFilter(index, { value: e.target.value })}
                  placeholder="Value"
                  className="px-3 py-1 border rounded-md bg-background text-sm flex-1"
                />
              )}

              <button
                onClick={() => removeFilter(index)}
                className="p-1 hover:bg-accent rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
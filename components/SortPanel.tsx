'use client';

import * as React from 'react';
import { useCallback, useRef, useEffect } from 'react';
import { Plus, X, GripVertical, ArrowUpDown } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { SortConfig, SortLevel } from '@/types/sort';

interface SortPanelProps {
  isOpen: boolean;
  onClose: () => void;
  columns: { name: string; type: string }[];
  items: any[];
  currentSort: SortConfig;
  onSort: (sort: SortConfig) => void;
}

interface SortItemProps {
  sort: SortLevel;
  index: number;
  columns: { name: string; type: string }[];
  onUpdate: (index: number, updates: Partial<SortLevel>) => void;
  onRemove: (index: number) => void;
}

function SortItem({ sort, index, columns, onUpdate, onRemove }: SortItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `sort-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-800 rounded-lg p-3 sm:p-4"
    >
      <div className="flex flex-col gap-2 sm:gap-3">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab hover:text-blue-400 transition-colors text-gray-400 flex-shrink-0"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <select
            value={sort.property}
            onChange={(e) => onUpdate(index, { property: e.target.value })}
            className="flex-1 px-2 sm:px-3 py-1.5 bg-gray-700 text-white border border-gray-600 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          >
            {columns.map((col) => (
              <option key={col.name} value={col.name}>
                {col.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => onRemove(index)}
            className="p-1.5 hover:bg-red-800 text-red-400 rounded transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 pl-4 sm:pl-6">
          <select
            value={sort.direction}
            onChange={(e) => onUpdate(index, { direction: e.target.value as 'ascending' | 'descending' })}
            className="flex-1 px-2 sm:px-3 py-1.5 bg-gray-700 text-white border border-gray-600 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          >
            <option value="ascending">Ascending (A → Z, 1 → 9)</option>
            <option value="descending">Descending (Z → A, 9 → 1)</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default function SortPanel({ isOpen, onClose, columns, items, currentSort, onSort }: SortPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [sortLevels, setSortLevels] = React.useState<SortLevel[]>(() => {
    if (currentSort?.levels && Array.isArray(currentSort.levels)) {
      return currentSort.levels;
    }
    return [];
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  useEffect(() => {
    if (currentSort?.levels && Array.isArray(currentSort.levels)) {
      setSortLevels(currentSort.levels);
    }
  }, [currentSort]);

  if (!isOpen) return null;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id.toString().replace('sort-', ''));
      const newIndex = parseInt(over.id.toString().replace('sort-', ''));
      
      setSortLevels((levels) => arrayMove(levels, oldIndex, newIndex));
    }
  };

  const addSort = () => {
    const newSort: SortLevel = {
      property: columns[0]?.name || '',
      direction: 'ascending',
    };
    setSortLevels([...sortLevels, newSort]);
  };

  const updateSort = (index: number, updates: Partial<SortLevel>) => {
    const updated = [...sortLevels];
    updated[index] = { ...updated[index], ...updates };
    setSortLevels(updated);
  };

  const removeSort = (index: number) => {
    setSortLevels(sortLevels.filter((_, i) => i !== index));
  };

  const applySort = () => {
    onSort({
      levels: sortLevels,
      enabled: true,
    });
    onClose();
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
            <ArrowUpDown className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Sort</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
          {sortLevels.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No sorting applied. Click "Add Sort" to get started.
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortLevels.map((_, index) => `sort-${index}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {sortLevels.map((sort, index) => (
                    <SortItem
                      key={`sort-${index}`}
                      sort={sort}
                      index={index}
                      columns={columns}
                      onUpdate={updateSort}
                      onRemove={removeSort}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          <div className="space-y-3 pt-4">
            <button
              onClick={addSort}
              className="w-full py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Sort Level
            </button>
            
            {sortLevels.length > 0 && (
              <button
                onClick={applySort}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Apply Sort
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
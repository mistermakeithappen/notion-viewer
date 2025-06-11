'use client';

import { useCallback } from 'react';
import { Plus, X, GripVertical } from 'lucide-react';
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
import type { SortConfig } from '@/types/sort';

interface SortPanelProps {
  properties: Record<string, any>;
  sortConfig: SortConfig[];
  onSortChange: (sortConfig: SortConfig[]) => void;
}

interface SortItemProps {
  sort: SortConfig;
  index: number;
  properties: Record<string, any>;
  onUpdate: (index: number, updates: Partial<SortConfig>) => void;
  onRemove: (index: number) => void;
}

function SortItem({ sort, index, properties, onUpdate, onRemove }: SortItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sort.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 bg-background rounded border"
    >
      <button
        className="cursor-move touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      <select
        value={sort.property}
        onChange={(e) => onUpdate(index, { property: e.target.value })}
        className="px-3 py-1 border rounded-md bg-background text-sm flex-1"
      >
        {Object.entries(properties).map(([key, prop]) => (
          <option key={key} value={key}>
            {prop.name}
          </option>
        ))}
      </select>

      <select
        value={sort.direction}
        onChange={(e) => onUpdate(index, { direction: e.target.value as 'ascending' | 'descending' })}
        className="px-3 py-1 border rounded-md bg-background text-sm"
      >
        <option value="ascending">Ascending</option>
        <option value="descending">Descending</option>
      </select>

      <button
        onClick={() => onRemove(index)}
        className="p-1 hover:bg-accent rounded"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function SortPanel({ properties, sortConfig, onSortChange }: SortPanelProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addSort = () => {
    const firstProperty = Object.keys(properties)[0];
    const newSort: SortConfig = {
      id: `sort-${Date.now()}`,
      property: firstProperty,
      direction: 'ascending',
    };
    onSortChange([...sortConfig, newSort]);
  };

  const updateSort = useCallback((index: number, updates: Partial<SortConfig>) => {
    const newSortConfig = [...sortConfig];
    newSortConfig[index] = { ...newSortConfig[index], ...updates };
    onSortChange(newSortConfig);
  }, [sortConfig, onSortChange]);

  const removeSort = useCallback((index: number) => {
    onSortChange(sortConfig.filter((_, i) => i !== index));
  }, [sortConfig, onSortChange]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortConfig.findIndex((item) => item.id === active.id);
      const newIndex = sortConfig.findIndex((item) => item.id === over.id);
      onSortChange(arrayMove(sortConfig, oldIndex, newIndex));
    }
  };

  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Sort</h3>
        <button
          onClick={addSort}
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <Plus className="h-4 w-4" />
          Add sort
        </button>
      </div>

      {sortConfig.length === 0 ? (
        <p className="text-sm text-muted-foreground">No sorting applied</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortConfig.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {sortConfig.map((sort, index) => (
                <SortItem
                  key={sort.id}
                  sort={sort}
                  index={index}
                  properties={properties}
                  onUpdate={updateSort}
                  onRemove={removeSort}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
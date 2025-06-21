'use client';

import { useState, useEffect } from 'react';
import { notionService } from '@/lib/notion';
import { ArrowLeft, Loader2, Settings2, Eye, EyeOff, GripVertical, X, LogOut, Filter, ArrowUpDown, ArrowUp, ArrowDown, SortAsc } from 'lucide-react';
import PropertyRenderer from './PropertyRenderer';
import FilterPanel from './FilterPanel';
import SortPanel from './SortPanel';
import { sortItems, detectPropertyType, getSuggestedSortOptions } from '@/lib/sortUtils';
import { EnhancedSortConfig, SortLevel } from '@/types/sort';
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
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DatabaseViewProps {
  apiKey: string;
  databaseId: string;
  onPageSelect: (pageId: string) => void;
  onBack: () => void;
  onLogout: () => void;
}

interface ColumnConfig {
  name: string;
  visible: boolean;
  order: number;
}

interface SimpleSortConfig {
  column: string | null;
  direction: 'asc' | 'desc';
}

interface FilterConfig {
  column: string;
  type: string;
  operator: string;
  value: any;
}

interface DatabasePreferences {
  columns: ColumnConfig[];
  sort: SimpleSortConfig;
  enhancedSort?: EnhancedSortConfig;
  filters: FilterConfig[];
}

// Sortable header component
function SortableHeader({ 
  column, 
  children, 
  sortConfig,
  onSort 
}: { 
  column: string; 
  children: React.ReactNode;
  sortConfig: SimpleSortConfig;
  onSort: (column: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isSorted = sortConfig.column === column;
  const isAsc = isSorted && sortConfig.direction === 'asc';

  return (
    <th
      ref={setNodeRef}
      style={style}
      className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide sortable-header"
    >
      <div className="flex items-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab hover:text-[var(--primary)] transition-colors opacity-40 hover:opacity-100"
          title="Drag to reorder column"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onSort(column)}
          className="flex-1 flex items-center gap-1 hover:text-[var(--primary)] transition-colors group text-left"
          title={`Sort by ${column}`}
        >
          <span className="select-none">{children}</span>
          <span className="ml-auto">
            {isSorted ? (
              isAsc ? (
                <ArrowUp className="w-3.5 h-3.5 text-[var(--primary)]" />
              ) : (
                <ArrowDown className="w-3.5 h-3.5 text-[var(--primary)]" />
              )
            ) : (
              <ArrowUpDown className="w-3.5 h-3.5 opacity-0 group-hover:opacity-40 transition-opacity" />
            )}
          </span>
        </button>
      </div>
    </th>
  );
}

// Column settings item
function ColumnItem({ column, onToggle }: { column: ColumnConfig; onToggle: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.name });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab hover:text-blue-400 text-gray-400 flex-shrink-0"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      
      <label className="flex items-center gap-3 flex-1 cursor-pointer min-w-0">
        <input
          type="checkbox"
          checked={column.visible}
          onChange={onToggle}
          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2 flex-shrink-0"
        />
        <span className="text-sm font-medium text-white truncate">{column.name}</span>
      </label>
      
      {column.visible ? (
        <Eye className="w-4 h-4 text-gray-400 flex-shrink-0" />
      ) : (
        <EyeOff className="w-4 h-4 text-gray-400 flex-shrink-0" />
      )}
    </div>
  );
}

export default function DatabaseView({ apiKey, databaseId, onPageSelect, onBack, onLogout }: DatabaseViewProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [columnConfigs, setColumnConfigs] = useState<ColumnConfig[]>([]);
  const [sortConfig, setSortConfig] = useState<SimpleSortConfig>({ column: null, direction: 'asc' });
  const [enhancedSortConfig, setEnhancedSortConfig] = useState<EnhancedSortConfig>({ levels: [], presets: [] });
  const [filters, setFilters] = useState<FilterConfig[]>([]);
  
  const PREFS_KEY = `notion_prefs_${databaseId}`;
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // Initialize the notion service with the API key
    notionService.initialize(apiKey);
    loadDatabaseItems();
  }, [databaseId, apiKey]);

  const loadDatabaseItems = async () => {
    try {
      setLoading(true);
      const results = await notionService.queryDatabase(databaseId);
      setItems(results);
      
      // Initialize column configs
      if (results.length > 0) {
        const allColumns: string[] = Array.from(new Set(results.flatMap((item: any) => Object.keys(item.properties))));
        
        // Check for saved preferences
        const savedPrefs = localStorage.getItem(PREFS_KEY);
        if (savedPrefs) {
          try {
            const prefs: DatabasePreferences = JSON.parse(savedPrefs);
            
            // Load column configs
            const configMap = new Map(prefs.columns.map((p: ColumnConfig) => [p.name, p]));
            const configs = allColumns.map((col, index) => {
              const saved = configMap.get(col);
              return saved || { name: col, visible: true, order: index + 1000 };
            });
            configs.sort((a, b) => a.order - b.order);
            setColumnConfigs(configs);
            
            // Load sort config
            if (prefs.sort) {
              setSortConfig(prefs.sort);
            }
            
            // Load enhanced sort config
            if (prefs.enhancedSort) {
              setEnhancedSortConfig(prefs.enhancedSort);
            }
            
            // Load filters
            if (prefs.filters) {
              setFilters(prefs.filters);
            }
          } catch (e) {
            // Fallback to default if parse fails
            setColumnConfigs(allColumns.map((col, index) => ({
              name: col,
              visible: true,
              order: index,
            })));
          }
        } else {
          // Default: only show title and status properties
          setColumnConfigs(allColumns.map((col, index) => {
            const property = results[0]?.properties[col];
            const isTitle = property?.type === 'title';
            const isStatus = property?.type === 'status';
            
            return {
              name: col,
              visible: isTitle || isStatus,
              order: index,
            };
          }));
        }
      }
    } catch (err) {
      setError('Failed to load database items.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Save preferences whenever they change
  useEffect(() => {
    if (columnConfigs.length > 0) {
      const prefs: DatabasePreferences = {
        columns: columnConfigs,
        sort: sortConfig,
        enhancedSort: enhancedSortConfig,
        filters: filters
      };
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    }
  }, [columnConfigs, sortConfig, enhancedSortConfig, filters, PREFS_KEY]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setColumnConfigs((configs) => {
        const oldIndex = configs.findIndex((c) => c.name === active.id);
        const newIndex = configs.findIndex((c) => c.name === over?.id);
        
        return arrayMove(configs, oldIndex, newIndex).map((config, index) => ({
          ...config,
          order: index,
        }));
      });
    }
  };

  const toggleColumnVisibility = (columnName: string) => {
    setColumnConfigs(configs =>
      configs.map(config =>
        config.name === columnName
          ? { ...config, visible: !config.visible }
          : config
      )
    );
  };

  const handleSort = (column: string) => {
    if (sortConfig.column === column) {
      const newDirection = sortConfig.direction === 'asc' ? 'desc' : 'asc';
      setSortConfig({
        column,
        direction: newDirection
      });
      
      // Update enhanced sort config
      const existingLevel = enhancedSortConfig.levels.find(l => l.column === column);
      if (existingLevel) {
        setEnhancedSortConfig({
          ...enhancedSortConfig,
          levels: enhancedSortConfig.levels.map(l => 
            l.column === column ? { ...l, direction: newDirection } : l
          )
        });
      } else {
        // Create a new sort level with field-type-specific defaults
        const propertyType = detectPropertyType(items, column);
        const newLevel: SortLevel = {
          id: Date.now().toString(),
          column,
          direction: newDirection,
          enabled: true,
          nullHandling: 'last',
          ...(propertyType && getSuggestedSortOptions(propertyType, items, column))
        };
        setEnhancedSortConfig({
          ...enhancedSortConfig,
          levels: [newLevel]
        });
      }
    } else {
      setSortConfig({ column, direction: 'asc' });
      
      // Create a new sort level with field-type-specific defaults
      const propertyType = detectPropertyType(items, column);
      const newLevel: SortLevel = {
        id: Date.now().toString(),
        column,
        direction: 'asc',
        enabled: true,
        nullHandling: 'last',
        ...(propertyType && getSuggestedSortOptions(propertyType, items, column))
      };
      setEnhancedSortConfig({
        ...enhancedSortConfig,
        levels: [newLevel]
      });
    }
  };

  const handleEnhancedSort = (newSortConfig: EnhancedSortConfig) => {
    setEnhancedSortConfig(newSortConfig);
    
    // Update simple sort config based on the first enabled level
    const firstEnabledLevel = newSortConfig.levels.find(l => l.enabled);
    if (firstEnabledLevel) {
      setSortConfig({
        column: firstEnabledLevel.column,
        direction: firstEnabledLevel.direction
      });
    } else {
      setSortConfig({ column: null, direction: 'asc' });
    }
  };

  const addFilter = (filter: FilterConfig) => {
    setFilters([...filters, filter]);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, filter: FilterConfig) => {
    setFilters(filters.map((f, i) => i === index ? filter : f));
  };

  // Apply sorting and filtering to items
  const processedItems = (() => {
    let result = [...items];

    // Apply filters
    filters.forEach(filter => {
      result = result.filter(item => {
        const property = item.properties[filter.column];
        if (!property) return false;

        switch (filter.operator) {
          case 'contains':
            if (property.type === 'title' || property.type === 'rich_text') {
              const text = property[property.type]?.[0]?.plain_text || '';
              return text.toLowerCase().includes(filter.value.toLowerCase());
            }
            return false;
          
          case 'does_not_contain':
            if (property.type === 'title' || property.type === 'rich_text') {
              const text = property[property.type]?.[0]?.plain_text || '';
              return !text.toLowerCase().includes(filter.value.toLowerCase());
            }
            return false;
          
          case 'equals':
            if (property.type === 'select' || property.type === 'status') {
              return property[property.type]?.name === filter.value;
            }
            if (property.type === 'checkbox') {
              return property.checkbox === filter.value;
            }
            if (property.type === 'number') {
              return property.number === filter.value;
            }
            return false;
          
          case 'not_equals':
            if (property.type === 'select' || property.type === 'status') {
              return property[property.type]?.name !== filter.value;
            }
            return false;
          
          case 'greater_than':
            if (property.type === 'number') {
              return (property.number || 0) > filter.value;
            }
            return false;
          
          case 'less_than':
            if (property.type === 'number') {
              return (property.number || 0) < filter.value;
            }
            return false;
          
          case 'before':
            if (property.type === 'date') {
              const date = new Date(property.date?.start || 0);
              const filterDate = new Date(filter.value);
              return date < filterDate;
            }
            return false;
          
          case 'after':
            if (property.type === 'date') {
              const date = new Date(property.date?.start || 0);
              const filterDate = new Date(filter.value);
              return date > filterDate;
            }
            return false;
          
          case 'is_empty':
            if (property.type === 'title' || property.type === 'rich_text') {
              return !property[property.type] || property[property.type].length === 0 || !property[property.type][0]?.plain_text;
            }
            if (property.type === 'select' || property.type === 'status') {
              return !property[property.type];
            }
            if (property.type === 'number') {
              return property.number === null || property.number === undefined;
            }
            if (property.type === 'date') {
              return !property.date;
            }
            return false;
          
          case 'is_not_empty':
            if (property.type === 'title' || property.type === 'rich_text') {
              return property[property.type] && property[property.type].length > 0 && property[property.type][0]?.plain_text;
            }
            if (property.type === 'select' || property.type === 'status') {
              return !!property[property.type];
            }
            if (property.type === 'number') {
              return property.number !== null && property.number !== undefined;
            }
            if (property.type === 'date') {
              return !!property.date;
            }
            return false;
          
          default:
            return true;
        }
      });
    });

    // Apply sorting using the enhanced sort system
    if (enhancedSortConfig.levels.length > 0) {
      result = sortItems(result, enhancedSortConfig);
    }

    return result;
  })();

  const visibleColumns = columnConfigs
    .filter(config => config.visible)
    .sort((a, b) => a.order - b.order);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--card)] border-b border-[var(--border)] backdrop-blur-sm bg-opacity-95">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <div className="h-4 w-px bg-[var(--border)]" />
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--muted-foreground)]">Showing</span>
                <span className="text-sm font-medium">{processedItems.length} of {items.length}</span>
                {filters.length > 0 && (
                  <span className="text-xs px-2 py-0.5 bg-[var(--primary)] text-white rounded-full">
                    {filters.length} filter{filters.length > 1 ? 's' : ''}
                  </span>
                )}
                {sortConfig.column && (
                  <span className="text-xs px-2 py-0.5 bg-blue-500 text-white rounded-full">
                    Sorted by {sortConfig.column}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSort(!showSort)}
                className="button-secondary"
              >
                <SortAsc className="h-4 w-4" />
                <span className="hidden sm:inline">Sort</span>
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="button-secondary"
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filter</span>
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="button-secondary"
              >
                <Settings2 className="h-4 w-4" />
                <span className="hidden sm:inline">Customize</span>
              </button>
              <button
                onClick={onLogout}
                className="button-secondary"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-3 sm:p-6">
        {items.length === 0 ? (
          <div className="card p-6 sm:p-12 text-center">
            <p className="text-sm sm:text-base text-[var(--muted-foreground)]">
              No items found in this database.
            </p>
          </div>
        ) : (
          <div className="card overflow-hidden shadow-sm">
            <div className="overflow-x-auto overflow-y-visible">
              <div className="min-w-max">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <table className="table-modern">
                  <thead>
                    <SortableContext
                      items={visibleColumns.map(col => col.name)}
                      strategy={horizontalListSortingStrategy}
                    >
                      <tr>
                        {visibleColumns.map((column) => (
                          <SortableHeader 
                            key={column.name} 
                            column={column.name}
                            sortConfig={sortConfig}
                            onSort={handleSort}
                          >
                            {column.name}
                          </SortableHeader>
                        ))}
                      </tr>
                    </SortableContext>
                  </thead>
                  <tbody>
                    {processedItems.map((item) => {
                      // Check if this row has any non-empty values
                      const hasContent = visibleColumns.some(col => {
                        const prop = item.properties[col.name];
                        if (!prop) return false;
                        if (prop.type === 'title' && prop.title?.[0]?.plain_text) return true;
                        if (prop.type === 'rich_text' && prop.rich_text?.[0]?.plain_text) return true;
                        if (prop.type === 'number' && prop.number !== null) return true;
                        if (prop.type === 'select' && prop.select) return true;
                        if (prop.type === 'multi_select' && prop.multi_select?.length > 0) return true;
                        if (prop.type === 'checkbox') return true;
                        if (prop.type === 'date' && prop.date) return true;
                        if (prop.type === 'url' && prop.url) return true;
                        if (prop.type === 'email' && prop.email) return true;
                        if (prop.type === 'phone_number' && prop.phone_number) return true;
                        if (prop.type === 'people' && prop.people?.length > 0) return true;
                        if (prop.type === 'files' && prop.files?.length > 0) return true;
                        if (prop.type === 'status' && prop.status) return true;
                        if (prop.type === 'button') return true;
                        return false;
                      });

                      return (
                        <tr
                          key={item.id}
                          onClick={() => onPageSelect(item.id)}
                          className={`group cursor-pointer transition-all ${!hasContent ? 'opacity-50' : ''}`}
                        >
                          {visibleColumns.map((column) => {
                            const property = item.properties[column.name];
                            const isEmpty = !property || (
                              property.type === 'title' && !property.title?.[0]?.plain_text &&
                              property.type === 'rich_text' && !property.rich_text?.[0]?.plain_text
                            );
                            
                            return (
                              <td
                                key={column.name}
                                className="px-4 py-3"
                              >
                                <div className="table-cell-wrap">
                                  {property ? (
                                    <PropertyRenderer property={property} propertyName={column.name} item={item} />
                                  ) : (
                                    <span className="text-gray-300 dark:text-gray-700 select-none">—</span>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </DndContext>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/20" onClick={() => setShowSettings(false)} />
          
          <div className={`absolute right-0 top-0 h-full w-full sm:max-w-md bg-gray-900 text-white shadow-xl transform transition-transform duration-300 ${showSettings ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Customize Columns</h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  Toggle visibility and drag to reorder
                </p>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={columnConfigs.sort((a, b) => a.order - b.order).map(col => col.name)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1">
                {columnConfigs
                  .sort((a, b) => a.order - b.order)
                  .map((column) => (
                    <ColumnItem
                      key={column.name}
                      column={column}
                      onToggle={() => toggleColumnVisibility(column.name)}
                    />
                  ))}
              </div>
            </SortableContext>
          </DndContext>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Panel */}
      <FilterPanel
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        columns={columnConfigs.map(c => c.name)}
        items={items}
        filters={filters}
        onAddFilter={addFilter}
        onRemoveFilter={removeFilter}
        onUpdateFilter={updateFilter}
      />

      {/* Sort Panel */}
      <SortPanel
        isOpen={showSort}
        onClose={() => setShowSort(false)}
        columns={visibleColumns.map(c => ({
          name: c.name,
          type: detectPropertyType(items, c.name)
        }))}
        items={items}
        currentSort={enhancedSortConfig}
        onSort={handleEnhancedSort}
      />
    </div>
  );
}
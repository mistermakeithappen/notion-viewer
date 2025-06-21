export interface SortConfig {
  id: string;
  property: string;
  direction: 'ascending' | 'descending';
  levels?: SortLevel[];
  presets?: any[];
}

export interface SortLevel {
  id?: string;
  property?: string;
  column?: string;
  direction: 'ascending' | 'descending' | 'asc' | 'desc';
  enabled?: boolean;
  nullHandling?: 'first' | 'last';
  type?: string;
}
import { NotionPage, getPropertyValue } from './notion';
import type { SortConfig } from '@/types/sort';

export function applySort(pages: NotionPage[], sortConfig: SortConfig[]): NotionPage[] {
  if (sortConfig.length === 0) return pages;

  return [...pages].sort((a, b) => {
    for (const sort of sortConfig) {
      const aValue = getPropertyValue(a.properties[sort.property]);
      const bValue = getPropertyValue(b.properties[sort.property]);

      // Handle null/undefined values
      if (aValue === '' && bValue === '') continue;
      if (aValue === '') return sort.direction === 'ascending' ? 1 : -1;
      if (bValue === '') return sort.direction === 'ascending' ? -1 : 1;

      let comparison = 0;

      // Compare based on type
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        comparison = Number(aValue) - Number(bValue);
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else {
        // String comparison (case-insensitive)
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        comparison = aStr.localeCompare(bStr);
      }

      if (comparison !== 0) {
        return sort.direction === 'ascending' ? comparison : -comparison;
      }
    }

    return 0;
  });
}

export function sortByProperty(
  pages: NotionPage[],
  property: string,
  direction: 'ascending' | 'descending' = 'ascending'
): NotionPage[] {
  return applySort(pages, [{
    id: `sort-${Date.now()}`,
    property,
    direction
  }]);
}

export function getPropertyType(properties: Record<string, any>, propertyName: string): string {
  return properties[propertyName]?.type || 'text';
}

export function isNumericProperty(propertyType: string): boolean {
  return ['number', 'formula', 'rollup'].includes(propertyType);
}

export function isDateProperty(propertyType: string): boolean {
  return ['date', 'created_time', 'last_edited_time'].includes(propertyType);
}

export function isBooleanProperty(propertyType: string): boolean {
  return propertyType === 'checkbox';
}

export function sortItems(items: any[], sortConfig: any): any[] {
  if (!sortConfig || !sortConfig.column) return items;
  
  return [...items].sort((a, b) => {
    const aValue = getPropertyValue(a.properties[sortConfig.column]);
    const bValue = getPropertyValue(b.properties[sortConfig.column]);
    
    // Handle null/undefined values
    if (aValue === '' && bValue === '') return 0;
    if (aValue === '') return sortConfig.direction === 'asc' ? 1 : -1;
    if (bValue === '') return sortConfig.direction === 'asc' ? -1 : 1;
    
    let comparison = 0;
    
    // Compare based on type
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    } else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
      comparison = Number(aValue) - Number(bValue);
    } else if (aValue instanceof Date && bValue instanceof Date) {
      comparison = aValue.getTime() - bValue.getTime();
    } else {
      // String comparison (case-insensitive)
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      comparison = aStr.localeCompare(bStr);
    }
    
    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });
}

export function detectPropertyType(items: any[], propertyName: string): string {
  if (!items || items.length === 0) return 'text';
  
  for (const item of items) {
    const property = item.properties?.[propertyName];
    if (property?.type) {
      return property.type;
    }
  }
  
  return 'text';
}

export function getSuggestedSortOptions(propertyType: string): string[] {
  switch (propertyType) {
    case 'number':
    case 'formula':
    case 'rollup':
      return ['Lowest to Highest', 'Highest to Lowest'];
    case 'date':
    case 'created_time':
    case 'last_edited_time':
      return ['Oldest to Newest', 'Newest to Oldest'];
    case 'checkbox':
      return ['Unchecked → Checked', 'Checked → Unchecked'];
    default:
      return ['A → Z', 'Z → A'];
  }
}
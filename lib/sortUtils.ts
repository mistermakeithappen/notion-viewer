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
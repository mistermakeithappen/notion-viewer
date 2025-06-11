'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, Filter, ArrowUpDown, Eye } from 'lucide-react';
import FilterPanel from './FilterPanel';
import SortPanel from './SortPanel';
import PropertyRenderer from './PropertyRenderer';
import PageView from './PageView';
import { applySort } from '@/lib/sortUtils';
import type { NotionPage, NotionFilter, SortConfig } from '@/lib/notion';

interface DatabaseViewProps {
  apiKey: string;
  databaseId: string;
  onBack: () => void;
}

export default function DatabaseView({ apiKey, databaseId, onBack }: DatabaseViewProps) {
  const [pages, setPages] = useState<NotionPage[]>([]);
  const [filteredPages, setFilteredPages] = useState<NotionPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [filters, setFilters] = useState<NotionFilter[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig[]>([]);
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [properties, setProperties] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchDatabase();
  }, [databaseId]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [pages, filters, sortConfig]);

  const fetchDatabase = async () => {
    try {
      // First, fetch the database to get property information
      const dbResponse = await fetch(`/api/notion/databases/${databaseId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!dbResponse.ok) {
        throw new Error('Failed to fetch database info');
      }

      const dbData = await dbResponse.json();
      setProperties(dbData.properties || {});

      // Then fetch the pages
      const response = await fetch(`/api/notion/databases/${databaseId}/query`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch database pages');
      }

      const data = await response.json();
      setPages(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let result = [...pages];

    // Apply filters
    filters.forEach(filter => {
      result = result.filter(page => {
        const propertyValue = page.properties[filter.property];
        
        switch (filter.condition) {
          case 'equals':
            return getPropertyValue(propertyValue) === filter.value;
          case 'does_not_equal':
            return getPropertyValue(propertyValue) !== filter.value;
          case 'contains':
            return String(getPropertyValue(propertyValue)).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'does_not_contain':
            return !String(getPropertyValue(propertyValue)).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'is_empty':
            return !getPropertyValue(propertyValue);
          case 'is_not_empty':
            return !!getPropertyValue(propertyValue);
          default:
            return true;
        }
      });
    });

    // Apply sorting
    if (sortConfig.length > 0) {
      result = applySort(result, sortConfig);
    }

    setFilteredPages(result);
  };

  const getPropertyValue = (property: any): any => {
    if (!property) return '';
    
    switch (property.type) {
      case 'title':
        return property.title[0]?.text?.content || '';
      case 'rich_text':
        return property.rich_text[0]?.text?.content || '';
      case 'number':
        return property.number;
      case 'select':
        return property.select?.name || '';
      case 'multi_select':
        return property.multi_select.map((s: any) => s.name).join(', ');
      case 'date':
        return property.date?.start || '';
      case 'checkbox':
        return property.checkbox;
      case 'url':
        return property.url || '';
      case 'email':
        return property.email || '';
      case 'phone_number':
        return property.phone_number || '';
      default:
        return '';
    }
  };

  const getPageTitle = (page: NotionPage) => {
    const titleProp = Object.values(page.properties).find((prop: any) => prop.type === 'title');
    return titleProp?.title?.[0]?.text?.content || 'Untitled';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-destructive mb-4">{error}</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Go back
        </button>
      </div>
    );
  }

  if (selectedPage) {
    return (
      <PageView
        apiKey={apiKey}
        pageId={selectedPage}
        onBack={() => setSelectedPage(null)}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to databases
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${
              showFilters ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters {filters.length > 0 && `(${filters.length})`}
          </button>
          <button
            onClick={() => setShowSort(!showSort)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${
              showSort ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
            }`}
          >
            <ArrowUpDown className="h-4 w-4" />
            Sort {sortConfig.length > 0 && `(${sortConfig.length})`}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-6">
          <FilterPanel
            properties={properties}
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>
      )}

      {showSort && (
        <div className="mb-6">
          <SortPanel
            properties={properties}
            sortConfig={sortConfig}
            onSortChange={setSortConfig}
          />
        </div>
      )}

      <div className="text-sm text-muted-foreground mb-4">
        Showing {filteredPages.length} of {pages.length} pages
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2 font-medium">Title</th>
              {Object.entries(properties).map(([key, prop]) => (
                prop.type !== 'title' && (
                  <th key={key} className="text-left p-2 font-medium">
                    {prop.name}
                  </th>
                )
              ))}
              <th className="text-left p-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPages.map((page) => (
              <tr key={page.id} className="border-b hover:bg-accent/50">
                <td className="p-2">{getPageTitle(page)}</td>
                {Object.entries(properties).map(([key, prop]) => (
                  prop.type !== 'title' && (
                    <td key={key} className="p-2">
                      <PropertyRenderer property={page.properties[key]} />
                    </td>
                  )
                ))}
                <td className="p-2">
                  <button
                    onClick={() => setSelectedPage(page.id)}
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredPages.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No pages found matching your filters.
        </div>
      )}
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import BlockRenderer from './BlockRenderer';
import PropertyRenderer from './PropertyRenderer';

interface PageViewProps {
  apiKey: string;
  pageId: string;
  onBack: () => void;
}

interface NotionBlock {
  id: string;
  type: string;
  [key: string]: any;
}

export default function PageView({ apiKey, pageId, onBack }: PageViewProps) {
  const [page, setPage] = useState<any>(null);
  const [blocks, setBlocks] = useState<NotionBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPageData();
  }, [pageId]);

  const fetchPageData = async () => {
    try {
      // Fetch page details
      const pageResponse = await fetch(`/api/notion/pages/${pageId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!pageResponse.ok) {
        throw new Error('Failed to fetch page');
      }

      const pageData = await pageResponse.json();
      setPage(pageData);

      // Fetch page blocks
      const blocksResponse = await fetch(`/api/notion/blocks/${pageId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!blocksResponse.ok) {
        throw new Error('Failed to fetch blocks');
      }

      const blocksData = await blocksResponse.json();
      setBlocks(blocksData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPageTitle = () => {
    if (!page?.properties) return 'Untitled';
    
    const titleProp = Object.values(page.properties).find(
      (prop: any) => prop.type === 'title'
    ) as any;
    
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

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 mb-6 text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to database
      </button>

      {page && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">{getPageTitle()}</h1>
          
          {/* Page Properties */}
          <div className="bg-card border rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Properties</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(page.properties).map(([key, property]: [string, any]) => (
                <div key={key} className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    {property.type === 'title' ? 'Title' : key}
                  </div>
                  <div>
                    <PropertyRenderer property={property} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Page Content */}
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        {blocks.map((block) => (
          <BlockRenderer key={block.id} block={block} />
        ))}
      </div>

      {blocks.length === 0 && (
        <p className="text-muted-foreground text-center py-8">
          This page has no content blocks.
        </p>
      )}
    </div>
  );
}
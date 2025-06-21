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
    <div className="max-w-4xl mx-auto px-4 sm:px-0">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 mb-4 sm:mb-6 text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm sm:text-base">Back to database</span>
      </button>

      {page && (
        <div className="mb-8">
          <h1 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6">{getPageTitle()}</h1>
          
          {/* Page Properties - Grouped by Workflow Stage */}
          {(() => {
            const properties = Object.entries(page.properties);
            
            // Group properties by workflow stage based on property names
            const startBuildProps = properties.filter(([key, prop]: [string, any]) => 
              key.toLowerCase().includes('start') && key.toLowerCase().includes('build') ||
              key.toLowerCase().includes('starting') && key.toLowerCase().includes('build')
            );
            
            const orderBuiltProps = properties.filter(([key, prop]: [string, any]) => 
              key.toLowerCase().includes('order') && key.toLowerCase().includes('built') ||
              key.toLowerCase().includes('order') && key.toLowerCase().includes('complete') ||
              (key.toLowerCase().includes('built') && !key.toLowerCase().includes('start'))
            );
            
            const completionProps = properties.filter(([key, prop]: [string, any]) => 
              key.toLowerCase().includes('installation') ||
              key.toLowerCase().includes('pickup') ||
              key.toLowerCase().includes('delivery') ||
              (key.toLowerCase().includes('complete') && !orderBuiltProps.some(([k]) => k === key))
            );
            
            const bhsBidProps = properties.filter(([key, prop]: [string, any]) => 
              key.toLowerCase().includes('bhs') && key.toLowerCase().includes('bid') ||
              key.toLowerCase().includes('request') && key.toLowerCase().includes('bhs')
            );
            
            // All other properties not in the above categories
            const otherProps = properties.filter(([key, prop]: [string, any]) => 
              !startBuildProps.some(([k]) => k === key) && 
              !orderBuiltProps.some(([k]) => k === key) && 
              !completionProps.some(([k]) => k === key) &&
              !bhsBidProps.some(([k]) => k === key)
            );

            return (
              <>
                {/* Starting to Build Section */}
                {startBuildProps.length > 0 && (
                  <div className="bg-card border rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
                    <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Starting to Build</h2>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {startBuildProps.map(([key, property]: [string, any]) => (
                        <div key={key}>
                          {property.type === 'button' ? (
                            <PropertyRenderer property={property} propertyName={key} item={page} />
                          ) : (
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-muted-foreground">{key}</div>
                              <PropertyRenderer property={property} propertyName={key} item={page} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Order is Built Section */}
                {orderBuiltProps.length > 0 && (
                  <div className="bg-card border rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
                    <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Order is Built</h2>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {orderBuiltProps.map(([key, property]: [string, any]) => (
                        <div key={key}>
                          {property.type === 'button' ? (
                            <PropertyRenderer property={property} propertyName={key} item={page} />
                          ) : (
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-muted-foreground">{key}</div>
                              <PropertyRenderer property={property} propertyName={key} item={page} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Installation/Pickup/Delivery Complete Section */}
                {completionProps.length > 0 && (
                  <div className="bg-card border rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
                    <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Installation/Pickup/Delivery Complete</h2>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {completionProps.map(([key, property]: [string, any]) => (
                        <div key={key}>
                          {property.type === 'button' ? (
                            <PropertyRenderer property={property} propertyName={key} item={page} />
                          ) : (
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-muted-foreground">{key}</div>
                              <PropertyRenderer property={property} propertyName={key} item={page} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Request BHS Bid Section - Full Width */}
                {bhsBidProps.length > 0 && (
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
                    <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-yellow-900 dark:text-yellow-100">Request BHS Bid</h2>
                    <div className="flex flex-wrap gap-2 sm:gap-4">
                      {bhsBidProps.map(([key, property]: [string, any]) => (
                        <div key={key} className="flex-1">
                          {property.type === 'button' ? (
                            <PropertyRenderer property={property} propertyName={key} item={page} />
                          ) : (
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200">{key}</div>
                              <PropertyRenderer property={property} propertyName={key} item={page} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Other Properties Section */}
                {otherProps.length > 0 && (
                  <div className="bg-card border rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
                    <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Other Information</h2>
                    <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                      {otherProps.map(([key, property]: [string, any]) => (
                        <div key={key} className="space-y-1">
                          <div className="text-sm font-medium text-muted-foreground">
                            {property.type === 'title' ? 'Title' : key}
                          </div>
                          <div>
                            <PropertyRenderer property={property} propertyName={key} item={page} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* Page Content */}
      <div className="prose prose-sm sm:prose-base prose-neutral dark:prose-invert max-w-none">
        {blocks.map((block) => (
          <BlockRenderer key={block.id} block={block} />
        ))}
      </div>

      {blocks.length === 0 && (
        <p className="text-sm sm:text-base text-muted-foreground text-center py-6 sm:py-8">
          This page has no content blocks.
        </p>
      )}
    </div>
  );
}
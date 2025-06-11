'use client';

import { useEffect, useState } from 'react';
import { Database, ArrowLeft, Loader2 } from 'lucide-react';

interface DatabaseSelectorProps {
  apiKey: string;
  onSelectDatabase: (databaseId: string) => void;
  onBack: () => void;
}

interface NotionDatabase {
  id: string;
  title: Array<{
    text: {
      content: string;
    };
  }>;
  icon?: {
    type: string;
    emoji?: string;
  };
  last_edited_time: string;
}

export default function DatabaseSelector({ apiKey, onSelectDatabase, onBack }: DatabaseSelectorProps) {
  const [databases, setDatabases] = useState<NotionDatabase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDatabases();
  }, [apiKey]);

  const fetchDatabases = async () => {
    try {
      const response = await fetch('/api/notion/databases', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch databases');
      }

      const data = await response.json();
      setDatabases(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDatabaseTitle = (db: NotionDatabase) => {
    return db.title[0]?.text?.content || 'Untitled Database';
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
    <div>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 mb-6 text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Change API Key
      </button>

      <h2 className="text-2xl font-semibold mb-6">Select a Database</h2>

      {databases.length === 0 ? (
        <p className="text-muted-foreground">No databases found. Make sure your integration has access to at least one database.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {databases.map((db) => (
            <button
              key={db.id}
              onClick={() => onSelectDatabase(db.id)}
              className="p-6 bg-card border rounded-lg hover:border-primary transition-colors text-left"
            >
              <div className="flex items-start gap-3">
                {db.icon?.emoji ? (
                  <span className="text-2xl">{db.icon.emoji}</span>
                ) : (
                  <Database className="h-6 w-6 text-muted-foreground" />
                )}
                <div className="flex-1">
                  <h3 className="font-medium">{getDatabaseTitle(db)}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Last edited: {new Date(db.last_edited_time).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
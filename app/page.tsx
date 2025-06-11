'use client';

import { useState } from 'react';
import ApiKeyInput from '@/components/ApiKeyInput';
import DatabaseSelector from '@/components/DatabaseSelector';
import DatabaseView from '@/components/DatabaseView';

export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Notion Database Viewer</h1>
        
        {!apiKey ? (
          <ApiKeyInput onApiKeySubmit={setApiKey} />
        ) : !selectedDatabase ? (
          <DatabaseSelector 
            apiKey={apiKey} 
            onSelectDatabase={setSelectedDatabase}
            onBack={() => setApiKey('')}
          />
        ) : (
          <DatabaseView 
            apiKey={apiKey} 
            databaseId={selectedDatabase}
            onBack={() => setSelectedDatabase(null)}
          />
        )}
      </div>
    </main>
  );
}
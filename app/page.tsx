'use client';

import { useState } from 'react';
import ApiKeyInput from '@/components/ApiKeyInput';
import DatabaseSelector from '@/components/DatabaseSelector';
import DatabaseView from '@/components/DatabaseView';
import PageView from '@/components/PageView';

export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState<string | null>(null);

  const handleLogout = () => {
    // Clear the stored API key from localStorage
    localStorage.removeItem('notion_viewer_api_key');
    
    // Reset all state
    setApiKey('');
    setSelectedDatabase(null);
    setSelectedPage(null);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
        <div className="flex items-center mb-4 sm:mb-6 md:mb-8 justify-center sm:justify-start">
          <img 
            src="https://storage.googleapis.com/msgsndr/oAgpWJeBH2dxE6gbifa3/media/682f1be1edabcf281457ac8f.png" 
            alt="Notion Viewer App Logo" 
            className="w-[150px] h-auto"
          />
        </div>
        
        {!apiKey ? (
          <ApiKeyInput onApiKeySubmit={setApiKey} />
        ) : !selectedDatabase ? (
          <DatabaseSelector 
            apiKey={apiKey} 
            onSelectDatabase={setSelectedDatabase}
            onBack={() => setApiKey('')}
          />
        ) : selectedPage ? (
          <PageView
            apiKey={apiKey}
            pageId={selectedPage}
            onBack={() => setSelectedPage(null)}
          />
        ) : (
          <DatabaseView 
            apiKey={apiKey} 
            databaseId={selectedDatabase}
            onBack={() => setSelectedDatabase(null)}
            onPageSelect={setSelectedPage}
            onLogout={handleLogout}
          />
        )}
      </div>
    </main>
  );
}
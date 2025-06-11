'use client';

import { useState } from 'react';
import { KeyRound } from 'lucide-react';

interface ApiKeyInputProps {
  onApiKeySubmit: (apiKey: string) => void;
}

export default function ApiKeyInput({ onApiKeySubmit }: ApiKeyInputProps) {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError('Please enter your Notion API key');
      return;
    }
    if (!apiKey.startsWith('secret_') && !apiKey.startsWith('ntn_')) {
      setError('Invalid API key format. Notion API keys start with "secret_" or "ntn_"');
      return;
    }
    onApiKeySubmit(apiKey.trim());
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-card p-8 rounded-lg shadow-lg border">
        <div className="flex items-center gap-3 mb-6">
          <KeyRound className="h-8 w-8 text-primary" />
          <h2 className="text-2xl font-semibold">Enter Notion API Key</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium mb-2">
              API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setError('');
              }}
              placeholder="secret_..."
              className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {error && (
              <p className="mt-2 text-sm text-destructive">{error}</p>
            )}
          </div>
          
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
          >
            Connect to Notion
          </button>
        </form>
        
        <div className="mt-6 text-sm text-muted-foreground">
          <p>To get your API key:</p>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Go to <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">notion.so/my-integrations</a></li>
            <li>Click "New integration"</li>
            <li>Give it a name and select the workspace</li>
            <li>Copy the "Internal Integration Secret"</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
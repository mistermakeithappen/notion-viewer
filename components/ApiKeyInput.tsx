'use client';

import { useState, useEffect } from 'react';
import { KeyRound } from 'lucide-react';

interface ApiKeyInputProps {
  onApiKeySubmit: (apiKey: string) => void;
}

const STORAGE_KEY = 'notion_viewer_api_key';

export default function ApiKeyInput({ onApiKeySubmit }: ApiKeyInputProps) {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Check for stored API key on mount
  useEffect(() => {
    const storedKey = localStorage.getItem(STORAGE_KEY);
    if (storedKey) {
      setApiKey(storedKey);
      setRememberMe(true);
      // Auto-submit if we have a stored key
      onApiKeySubmit(storedKey);
    }
  }, [onApiKeySubmit]);

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
    
    const trimmedKey = apiKey.trim();
    
    // Store or remove the API key based on remember me checkbox
    if (rememberMe) {
      localStorage.setItem(STORAGE_KEY, trimmedKey);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    
    onApiKeySubmit(trimmedKey);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-card p-6 sm:p-8 rounded-lg shadow-lg border">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <KeyRound className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <h2 className="text-xl sm:text-2xl font-semibold">Enter Notion API Key</h2>
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
          
          <div className="flex items-center gap-2">
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="rememberMe" className="text-sm font-medium">
              Remember me
            </label>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p className="text-xs sm:text-sm">Your API key will be stored locally in your browser. You can logout anytime to clear it.</p>
          </div>
          
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
          >
            Connect to Notion
          </button>
        </form>
        
        <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-muted-foreground">
          <p>To get your API key:</p>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Go to <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">notion.so/my-integrations</a></li>
            <li>Click "New integration"</li>
            <li>Give it a name and select the workspace</li>
            <li>Copy the "Internal Integration Secret"</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
export interface NotionPage {
  id: string;
  properties: Record<string, any>;
  created_time: string;
  last_edited_time: string;
  archived: boolean;
  icon?: {
    type: string;
    emoji?: string;
  };
  cover?: {
    type: string;
    external?: { url: string };
    file?: { url: string };
  };
}

export interface NotionDatabase {
  id: string;
  title: Array<{
    text: {
      content: string;
    };
  }>;
  properties: Record<string, NotionProperty>;
  icon?: {
    type: string;
    emoji?: string;
  };
  created_time: string;
  last_edited_time: string;
}

export interface NotionProperty {
  id: string;
  name: string;
  type: string;
  [key: string]: any;
}

export interface NotionFilter {
  property: string;
  condition: string;
  value: any;
}

export interface SortConfig {
  id: string;
  property: string;
  direction: 'ascending' | 'descending';
}

export interface NotionBlock {
  id: string;
  type: string;
  created_time: string;
  last_edited_time: string;
  has_children: boolean;
  archived: boolean;
  [key: string]: any;
}

export interface NotionRichText {
  type: 'text' | 'mention' | 'equation';
  text?: {
    content: string;
    link?: { url: string };
  };
  annotations: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: string;
  };
  plain_text: string;
  href?: string;
}

export const NOTION_API_VERSION = '2022-06-28';

export function getPropertyValue(property: any): any {
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
    case 'formula':
      return property.formula?.[property.formula.type] || '';
    case 'relation':
      return property.relation.map((r: any) => r.id).join(', ');
    case 'rollup':
      return property.rollup?.[property.rollup.type] || '';
    case 'created_time':
      return property.created_time;
    case 'last_edited_time':
      return property.last_edited_time;
    case 'created_by':
      return property.created_by?.name || property.created_by?.id || '';
    case 'last_edited_by':
      return property.last_edited_by?.name || property.last_edited_by?.id || '';
    default:
      return '';
  }
}

// Notion service class
export class NotionService {
  private apiKey: string | null = null;

  initialize(apiKey: string) {
    this.apiKey = apiKey;
  }

  private getHeaders() {
    if (!this.apiKey) throw new Error('Notion API key not initialized');
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async getDatabases() {
    const response = await fetch('/api/notion/databases', {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || error.error || 'Failed to fetch databases');
    }

    return response.json();
  }

  async queryDatabase(databaseId: string) {
    const response = await fetch(`/api/notion/databases/${databaseId}/query`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to query database');
    }

    return response.json();
  }

  async getPage(pageId: string) {
    const response = await fetch(`/api/notion/pages/${pageId}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch page');
    }

    return response.json();
  }

  async getBlocks(blockId: string) {
    const response = await fetch(`/api/notion/blocks/${blockId}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch blocks');
    }

    return response.json();
  }
}

export const notionService = new NotionService();
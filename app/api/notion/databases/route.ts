import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 });
  }

  const token = authHeader.substring(7);
  const notion = new Client({ auth: token });

  try {
    const response = await notion.search({
      filter: {
        value: 'database',
        property: 'object',
      },
      sort: {
        direction: 'descending',
        timestamp: 'last_edited_time',
      },
    });

    return NextResponse.json(response.results);
  } catch (error: any) {
    console.error('Notion API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch databases',
      details: error.message || 'Unknown error',
      code: error.code
    }, { status: 500 });
  }
}
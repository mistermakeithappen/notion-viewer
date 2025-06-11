import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 });
  }

  const token = authHeader.substring(7);
  const notion = new Client({ auth: token });

  try {
    const blocks = [];
    let cursor;
    
    do {
      const response = await notion.blocks.children.list({
        block_id: params.id,
        start_cursor: cursor,
      });
      
      blocks.push(...response.results);
      cursor = response.next_cursor;
    } while (cursor);

    return NextResponse.json(blocks);
  } catch (error) {
    console.error('Notion API error:', error);
    return NextResponse.json({ error: 'Failed to fetch blocks' }, { status: 500 });
  }
}
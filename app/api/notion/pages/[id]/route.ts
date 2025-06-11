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
    const page = await notion.pages.retrieve({ page_id: params.id });
    return NextResponse.json(page);
  } catch (error) {
    console.error('Notion API error:', error);
    return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getTableSchema } from '@/utils/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { table: string } }
) {
  const table = await params.table;

  try {
    const schema = await getTableSchema(table);
    return NextResponse.json(schema);
  } catch (error) {
    console.error('Error fetching schema:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 
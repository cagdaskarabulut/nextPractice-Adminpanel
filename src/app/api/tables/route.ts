import { NextResponse } from 'next/server';
import { getTables } from '@/utils/db';

export async function GET() {
  try {
    const tables = await getTables();
    return NextResponse.json(tables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 
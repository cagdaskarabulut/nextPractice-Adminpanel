import { NextRequest, NextResponse } from 'next/server';
import { getTableRow } from '@/utils/db';
import { isTableManaged, hasTablePermission } from '@/config/tables';

export async function GET(
  request: NextRequest,
  { params }: { params: { table: string; id: string } }
) {
  const table = await params.table;
  const id = await params.id;

  if (!isTableManaged(table)) {
    return NextResponse.json(
      { error: 'Table not found or not managed' },
      { status: 404 }
    );
  }

  if (!hasTablePermission(table, 'select')) {
    return NextResponse.json(
      { error: 'Operation not permitted' },
      { status: 403 }
    );
  }

  try {
    const data = await getTableRow(table, id);
    if (!data) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching row:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 
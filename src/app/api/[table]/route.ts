import { NextRequest, NextResponse } from 'next/server';
import { getTableData, createTableRow, updateTableRow, deleteTableRow } from '@/utils/db';
import { isTableManaged, hasTablePermission } from '@/config/tables';

export async function GET(
  request: NextRequest,
  { params }: { params: { table: string } }
) {
  const table = await params.table;

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
    const data = await getTableData(table);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { table: string } }
) {
  const table = await params.table;

  if (!isTableManaged(table)) {
    return NextResponse.json(
      { error: 'Table not found or not managed' },
      { status: 404 }
    );
  }

  if (!hasTablePermission(table, 'insert')) {
    return NextResponse.json(
      { error: 'Operation not permitted' },
      { status: 403 }
    );
  }

  try {
    const data = await request.json();
    const result = await createTableRow(table, data);
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error creating row:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { table: string } }
) {
  const table = await params.table;

  if (!isTableManaged(table)) {
    return NextResponse.json(
      { error: 'Table not found or not managed' },
      { status: 404 }
    );
  }

  if (!hasTablePermission(table, 'update')) {
    return NextResponse.json(
      { error: 'Operation not permitted' },
      { status: 403 }
    );
  }

  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    const result = await updateTableRow(table, id, updateData);
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating row:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { table: string } }
) {
  const table = await params.table;

  if (!isTableManaged(table)) {
    return NextResponse.json(
      { error: 'Table not found or not managed' },
      { status: 404 }
    );
  }

  if (!hasTablePermission(table, 'delete')) {
    return NextResponse.json(
      { error: 'Operation not permitted' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    const result = await deleteTableRow(table, id);
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error deleting row:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 
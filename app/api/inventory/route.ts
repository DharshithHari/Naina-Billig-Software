import { NextRequest, NextResponse } from 'next/server';
import {
  getAllInventoryItems,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  InventoryItem,
} from '@/lib/localStorage';

export async function GET() {
  try {
    const items = await getAllInventoryItems();
    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, price, description } = body;

    if (!name || price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Name and price are required' },
        { status: 400 }
      );
    }

    const item = await addInventoryItem({ name, price, description });
    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    console.error('Error adding inventory item:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add inventory item' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const item = await updateInventoryItem(id, updates);
    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    console.error('Error updating inventory item:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update inventory item' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Item ID is required' },
        { status: 400 }
      );
    }

    await deleteInventoryItem(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete inventory item' },
      { status: 500 }
    );
  }
}


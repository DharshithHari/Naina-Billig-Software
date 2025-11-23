import { NextRequest, NextResponse } from 'next/server';
import { saveAllBillsToSheets, saveAllInventoryToSheets } from '@/lib/googleSheets';
import { getAllBills, getAllInventoryItems } from '@/lib/localStorage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, spreadsheetId } = body; // type: 'bills' | 'inventory' | 'all'

    if (!type || !['bills', 'inventory', 'all'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid type. Must be "bills", "inventory", or "all"' },
        { status: 400 }
      );
    }

    const results: any = {};

    if (type === 'bills' || type === 'all') {
      const bills = await getAllBills();
      const sheetId = await saveAllBillsToSheets(bills, spreadsheetId);
      results.bills = { success: true, spreadsheetId: sheetId };
    }

    if (type === 'inventory' || type === 'all') {
      const inventory = await getAllInventoryItems();
      const sheetId = await saveAllInventoryToSheets(inventory, spreadsheetId);
      results.inventory = { success: true, spreadsheetId: sheetId };
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error('Error syncing to Google Sheets:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to sync to Google Sheets' },
      { status: 500 }
    );
  }
}


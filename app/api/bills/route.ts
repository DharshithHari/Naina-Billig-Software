import { NextRequest, NextResponse } from 'next/server';
import { saveBill, getAllBills, Bill } from '@/lib/localStorage';

export async function POST(request: NextRequest) {
  try {
    const bill: Bill = await request.json();
    
    // Check if bill with same bill number already exists
    const existingBills = await getAllBills();
    const duplicate = existingBills.find(b => b.billNumber === bill.billNumber);
    
    if (duplicate) {
      return NextResponse.json(
        { success: false, error: 'Bill with this number already exists. Please try again.' },
        { status: 400 }
      );
    }
    
    await saveBill(bill);
    return NextResponse.json({ success: true, bill });
  } catch (error: any) {
    console.error('Error creating bill:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create bill' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const bills = await getAllBills();
    return NextResponse.json({ success: true, bills });
  } catch (error: any) {
    console.error('Error fetching bills:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch bills' },
      { status: 500 }
    );
  }
}


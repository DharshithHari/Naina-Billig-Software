import {
  readBillsFromSheets,
  saveBillToSheets,
  saveAllBillsToSheets,
  readInventoryFromSheets,
  saveAllInventoryToSheets,
} from './googleSheets';

export interface BillItem {
  itemName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Bill {
  billNumber: string;
  date: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  items: BillItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
}

// Bills functions - using Google Sheets
export async function saveBill(bill: Bill): Promise<void> {
  try {
    await saveBillToSheets(bill);
  } catch (error) {
    console.error('Error saving bill:', error);
    throw error;
  }
}

export async function getAllBills(): Promise<Bill[]> {
  try {
    return await readBillsFromSheets();
  } catch (error) {
    console.error('Error fetching bills:', error);
    throw error;
  }
}

export async function getBillByNumber(billNumber: string): Promise<Bill | null> {
  try {
    const bills = await readBillsFromSheets();
    return bills.find(bill => bill.billNumber === billNumber) || null;
  } catch (error) {
    console.error('Error fetching bill:', error);
    throw error;
  }
}

// Inventory functions - using Google Sheets
export async function getAllInventoryItems(): Promise<InventoryItem[]> {
  try {
    return await readInventoryFromSheets();
  } catch (error) {
    console.error('Error fetching inventory:', error);
    throw error;
  }
}

export async function addInventoryItem(item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
  try {
    const items = await readInventoryFromSheets();
    const newItem: InventoryItem = {
      ...item,
      id: Date.now().toString(),
    };
    items.push(newItem);
    await saveAllInventoryToSheets(items);
    return newItem;
  } catch (error) {
    console.error('Error adding inventory item:', error);
    throw error;
  }
}

export async function updateInventoryItem(id: string, item: Partial<InventoryItem>): Promise<InventoryItem> {
  try {
    const items = await readInventoryFromSheets();
    const index = items.findIndex(i => i.id === id);
    if (index === -1) {
      throw new Error('Item not found');
    }
    items[index] = { ...items[index], ...item };
    await saveAllInventoryToSheets(items);
    return items[index];
  } catch (error) {
    console.error('Error updating inventory item:', error);
    throw error;
  }
}

export async function deleteInventoryItem(id: string): Promise<void> {
  try {
    const items = await readInventoryFromSheets();
    const filtered = items.filter(i => i.id !== id);
    await saveAllInventoryToSheets(filtered);
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    throw error;
  }
}

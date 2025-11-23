import fs from 'fs';
import path from 'path';

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
}

const DATA_DIR = path.join(process.cwd(), 'data');
const BILLS_FILE = path.join(DATA_DIR, 'bills.json');
const INVENTORY_FILE = path.join(DATA_DIR, 'inventory.json');

// Ensure data directory exists
function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Initialize bills file if it doesn't exist
function initializeBillsFile() {
  ensureDataDirectory();
  if (!fs.existsSync(BILLS_FILE)) {
    fs.writeFileSync(BILLS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

// Read all bills from file
function readBills(): Bill[] {
  initializeBillsFile();
  try {
    const data = fs.readFileSync(BILLS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading bills file:', error);
    return [];
  }
}

// Write bills to file
function writeBills(bills: Bill[]): void {
  ensureDataDirectory();
  try {
    fs.writeFileSync(BILLS_FILE, JSON.stringify(bills, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing bills file:', error);
    throw error;
  }
}

export async function saveBill(bill: Bill): Promise<void> {
  try {
    const bills = readBills();
    bills.push(bill);
    writeBills(bills);
  } catch (error) {
    console.error('Error saving bill:', error);
    throw error;
  }
}

export async function getAllBills(): Promise<Bill[]> {
  try {
    return readBills();
  } catch (error) {
    console.error('Error fetching bills:', error);
    throw error;
  }
}

export async function getBillByNumber(billNumber: string): Promise<Bill | null> {
  try {
    const bills = readBills();
    return bills.find(bill => bill.billNumber === billNumber) || null;
  } catch (error) {
    console.error('Error fetching bill:', error);
    throw error;
  }
}

// Inventory functions
function initializeInventoryFile() {
  ensureDataDirectory();
  if (!fs.existsSync(INVENTORY_FILE)) {
    // Initialize with default items
    const defaultItems: InventoryItem[] = [
      { id: '1', name: 'Product A', price: 100.00, description: 'Sample product A' },
      { id: '2', name: 'Product B', price: 200.00, description: 'Sample product B' },
      { id: '3', name: 'Product C', price: 150.00, description: 'Sample product C' },
      { id: '4', name: 'Service X', price: 500.00, description: 'Sample service X' },
      { id: '5', name: 'Service Y', price: 750.00, description: 'Sample service Y' },
    ];
    fs.writeFileSync(INVENTORY_FILE, JSON.stringify(defaultItems, null, 2), 'utf-8');
  }
}

function readInventory(): InventoryItem[] {
  initializeInventoryFile();
  try {
    const data = fs.readFileSync(INVENTORY_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading inventory file:', error);
    return [];
  }
}

function writeInventory(items: InventoryItem[]): void {
  ensureDataDirectory();
  try {
    fs.writeFileSync(INVENTORY_FILE, JSON.stringify(items, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing inventory file:', error);
    throw error;
  }
}

export async function getAllInventoryItems(): Promise<InventoryItem[]> {
  try {
    return readInventory();
  } catch (error) {
    console.error('Error fetching inventory:', error);
    throw error;
  }
}

export async function addInventoryItem(item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
  try {
    const items = readInventory();
    const newItem: InventoryItem = {
      ...item,
      id: Date.now().toString(),
    };
    items.push(newItem);
    writeInventory(items);
    return newItem;
  } catch (error) {
    console.error('Error adding inventory item:', error);
    throw error;
  }
}

export async function updateInventoryItem(id: string, item: Partial<InventoryItem>): Promise<InventoryItem> {
  try {
    const items = readInventory();
    const index = items.findIndex(i => i.id === id);
    if (index === -1) {
      throw new Error('Item not found');
    }
    items[index] = { ...items[index], ...item };
    writeInventory(items);
    return items[index];
  } catch (error) {
    console.error('Error updating inventory item:', error);
    throw error;
  }
}

export async function deleteInventoryItem(id: string): Promise<void> {
  try {
    const items = readInventory();
    const filtered = items.filter(i => i.id !== id);
    writeInventory(filtered);
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    throw error;
  }
}


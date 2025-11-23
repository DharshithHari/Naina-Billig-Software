import { google } from 'googleapis';
import { Bill } from './localStorage';
import { InventoryItem } from './localStorage';

// Initialize Google Sheets API
function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

// Initialize or get spreadsheet ID
async function getOrCreateSpreadsheet(sheets: any, spreadsheetId?: string) {
  if (spreadsheetId) {
    return spreadsheetId;
  }

  // Create a new spreadsheet if ID is not provided
  const drive = google.drive({ version: 'v3', auth: sheets.auth });
  const response = await drive.files.create({
    requestBody: {
      name: 'Billing Software Data',
      mimeType: 'application/vnd.google-apps.spreadsheet',
    },
  });

  return response.data.id!;
}

// Ensure sheet exists in spreadsheet
async function ensureSheetExists(sheets: any, spreadsheetId: string, sheetName: string) {
  try {
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    const sheetExists = spreadsheet.data.sheets?.some(
      (sheet: any) => sheet.properties?.title === sheetName
    );

    if (!sheetExists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName,
                },
              },
            },
          ],
        },
      });
    }
  } catch (error) {
    console.error(`Error ensuring sheet "${sheetName}" exists:`, error);
    throw error;
  }
}

// Get spreadsheet ID (create if needed)
async function getSpreadsheetId(spreadsheetId?: string): Promise<string> {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
    throw new Error('Google Sheets credentials not configured. Please set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY in your .env.local file.');
  }

  const sheets = getSheetsClient();
  return await getOrCreateSpreadsheet(sheets, spreadsheetId || process.env.GOOGLE_SHEETS_ID);
}

// Read all bills from Google Sheets
export async function readBillsFromSheets(spreadsheetId?: string): Promise<Bill[]> {
  try {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
      throw new Error('Google Sheets credentials not configured');
    }

    const sheets = getSheetsClient();
    const sheetId = await getSpreadsheetId(spreadsheetId);
    
    // Ensure Bills sheet exists
    await ensureSheetExists(sheets, sheetId, 'Bills');

    // Read all data from Bills sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Bills!A2:B10000', // Skip header row, read up to 10000 rows
    });

    const rows = response.data.values || [];
    const bills: Bill[] = [];

    for (const row of rows) {
      if (row[0] && row[1]) {
        try {
          // Parse JSON bill data from column B
          const bill: Bill = JSON.parse(row[1]);
          bills.push(bill);
        } catch (error) {
          console.error('Error parsing bill JSON:', error, row[1]);
        }
      }
    }

    return bills;
  } catch (error) {
    console.error('Error reading bills from Google Sheets:', error);
    throw error;
  }
}

// Save a single bill to Google Sheets (stores as JSON)
export async function saveBillToSheets(bill: Bill, spreadsheetId?: string): Promise<string> {
  try {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
      throw new Error('Google Sheets credentials not configured');
    }

    const sheets = getSheetsClient();
    const sheetId = await getSpreadsheetId(spreadsheetId);
    
    // Ensure Bills sheet exists
    await ensureSheetExists(sheets, sheetId, 'Bills');

    // Check if header row exists, if not add it
    const headerCheck = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Bills!A1:B1',
    });

    if (!headerCheck.data.values || headerCheck.data.values.length === 0) {
      // Add header row
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: 'Bills!A1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [['Bill Number', 'Bill Data (JSON)']],
        },
      });
    }

    // Store bill as JSON in column B, bill number in column A for easy lookup
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Bills!A:B',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[bill.billNumber, JSON.stringify(bill)]],
      },
    });

    return sheetId;
  } catch (error) {
    console.error('Error saving bill to Google Sheets:', error);
    throw error;
  }
}

// Save all bills to Google Sheets (overwrites existing)
export async function saveAllBillsToSheets(bills: Bill[], spreadsheetId?: string): Promise<string> {
  try {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
      throw new Error('Google Sheets credentials not configured');
    }

    const sheets = getSheetsClient();
    const sheetId = await getSpreadsheetId(spreadsheetId);
    
    // Ensure Bills sheet exists
    await ensureSheetExists(sheets, sheetId, 'Bills');

    // Prepare data
    const billsData = [['Bill Number', 'Bill Data (JSON)']];
    bills.forEach((bill) => {
      billsData.push([bill.billNumber, JSON.stringify(bill)]);
    });

    // Clear existing data and write new data
    await sheets.spreadsheets.values.clear({
      spreadsheetId: sheetId,
      range: 'Bills!A1:B10000',
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: 'Bills!A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: billsData,
      },
    });

    return sheetId;
  } catch (error) {
    console.error('Error saving all bills to Google Sheets:', error);
    throw error;
  }
}

// Read all inventory from Google Sheets
export async function readInventoryFromSheets(spreadsheetId?: string): Promise<InventoryItem[]> {
  try {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
      throw new Error('Google Sheets credentials not configured');
    }

    const sheets = getSheetsClient();
    const sheetId = await getSpreadsheetId(spreadsheetId);
    
    // Ensure Inventory sheet exists
    await ensureSheetExists(sheets, sheetId, 'Inventory');

    // Read all data from Inventory sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Inventory!A2:E10000', // Skip header row
    });

    const rows = response.data.values || [];
    const inventory: InventoryItem[] = [];

    for (const row of rows) {
      if (row[0] && row[1]) {
        try {
          inventory.push({
            id: row[0],
            name: row[1],
            price: parseFloat(row[2]) || 0,
            description: row[3] || '',
            imageUrl: row[4] || '',
          });
        } catch (error) {
          console.error('Error parsing inventory row:', error, row);
        }
      }
    }

    return inventory;
  } catch (error) {
    console.error('Error reading inventory from Google Sheets:', error);
    throw error;
  }
}

// Save all inventory to Google Sheets (overwrites existing)
export async function saveAllInventoryToSheets(inventory: InventoryItem[], spreadsheetId?: string): Promise<string> {
  try {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
      throw new Error('Google Sheets credentials not configured');
    }

    const sheets = getSheetsClient();
    const sheetId = await getSpreadsheetId(spreadsheetId);
    
    // Ensure Inventory sheet exists
    await ensureSheetExists(sheets, sheetId, 'Inventory');

    // Prepare data
    const inventoryData = [['ID', 'Product Name', 'Price', 'Description', 'Image URL']];
    inventory.forEach((item) => {
      inventoryData.push([
        item.id,
        item.name,
        item.price.toString(),
        item.description || '',
        item.imageUrl || '',
      ]);
    });

    // Clear existing data and write new data
    await sheets.spreadsheets.values.clear({
      spreadsheetId: sheetId,
      range: 'Inventory!A1:E10000',
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: 'Inventory!A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: inventoryData,
      },
    });

    return sheetId;
  } catch (error) {
    console.error('Error saving inventory to Google Sheets:', error);
    throw error;
  }
}

// Legacy functions for backward compatibility (now use the new functions above)
export async function saveBillsToSheets(bills: Bill[], spreadsheetId?: string) {
  return await saveAllBillsToSheets(bills, spreadsheetId);
}

export async function saveInventoryToSheets(inventory: InventoryItem[], spreadsheetId?: string) {
  return await saveAllInventoryToSheets(inventory, spreadsheetId);
}

export async function appendBillToSheets(bill: Bill, spreadsheetId?: string) {
  return await saveBillToSheets(bill, spreadsheetId);
}


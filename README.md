# Billing Software

A modern billing software built with Next.js that stores all data in Google Sheets and Google Drive, with bill printing functionality.

## Features

- ✅ Create and manage bills with customer information
- ✅ Add multiple items with quantities and prices
- ✅ Automatic calculation of subtotals, tax, and totals
- ✅ **All data stored in Google Sheets** (bills and inventory)
- ✅ **Product images stored in Google Drive**
- ✅ Print bills directly from the application
- ✅ Modern and responsive UI
- ✅ Real-time bill preview

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Configure Environment Variables

**IMPORTANT**: This application requires Google Cloud credentials to function. All data is stored in Google Sheets and Google Drive.

Create a `.env.local` file in the project root with the following variables:

```env
# Application Password
APP_PASSWORD=admin123

# Google Service Account Credentials (REQUIRED)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"

# Optional: Google Sheets ID (if using existing sheet)
# If not provided, a new sheet will be created automatically
GOOGLE_SHEETS_ID=

# Optional: Google Drive folder name (default: "Product Images")
GOOGLE_DRIVE_FOLDER_NAME=Product Images
```

**Setup Instructions:**
1. Follow the detailed setup guide in [GOOGLE_SETUP.md](./GOOGLE_SETUP.md)
2. Get your Google Cloud service account credentials
3. Add them to `.env.local`
4. The `.env.local` file is already in `.gitignore` and won't be committed to version control

**Important**: 
- The default password is `admin123` - **Change this to a strong password** for production use
- Google credentials are **REQUIRED** - the application will not work without them

## Usage

1. **Login**: Enter the password configured in your `.env.local` file
2. **Select Items**: Choose items from inventory and set quantities
3. **Generate Bill**: Click "Generate Bill" to proceed to billing page
4. **Fill Customer Details**: Enter customer name (required), address, and phone
5. **Set Tax Rate**: Enter the tax percentage (if applicable)
6. **Generate & Print**: Click "Generate Bill" to save, then "Print Bill" to print

## Data Storage

**All data is stored in Google Sheets and Google Drive** - there is no local file storage.

### Data Location
- **Bills**: Stored in Google Sheets (sheet named "Bills")
- **Inventory**: Stored in Google Sheets (sheet named "Inventory")
- **Product Images**: Stored in Google Drive folder (default: "Product Images")

### Google Sheets & Drive Integration

**REQUIRED**: Google Cloud credentials must be configured for the application to work.

**Setup:**
1. Follow the detailed setup guide in [GOOGLE_SETUP.md](./GOOGLE_SETUP.md)
2. Configure the required environment variables in `.env.local`
3. A Google Sheet will be created automatically (or use an existing one via `GOOGLE_SHEETS_ID`)

**Features:**
- Bills are automatically saved to Google Sheets when created
- Inventory data is automatically saved to Google Sheets when added/updated/deleted
- Product images are automatically uploaded to Google Drive
- All data is stored in the cloud - accessible from anywhere
- Manual sync available via API endpoint (`/api/google/sync-sheets`)

### Backup
Your data is automatically backed up in Google Sheets and Google Drive. You can:
- Access your data directly in Google Sheets
- Download your Google Sheet as a backup
- Use Google Drive's built-in version history

## Project Structure

```
├── app/
│   ├── api/bills/      # API routes for bill operations
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Main page
├── components/
│   ├── BillForm.tsx    # Bill creation form
│   └── BillPreview.tsx # Bill preview component
├── lib/
│   ├── localStorage.ts # Google Sheets storage interface
│   ├── googleSheets.ts # Google Sheets API integration
│   └── googleDrive.ts  # Google Drive API integration
└── package.json
```

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Google Sheets API** - Data storage for bills and inventory
- **Google Drive API** - Product image storage
- **date-fns** - Date formatting

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## License

MIT

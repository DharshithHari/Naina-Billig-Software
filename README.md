# Billing Software

A modern billing software built with Next.js that stores data locally in JSON files and includes bill printing functionality.

## Features

- ✅ Create and manage bills with customer information
- ✅ Add multiple items with quantities and prices
- ✅ Automatic calculation of subtotals, tax, and totals
- ✅ Store all data locally in JSON files (no external dependencies)
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

The `.env.local` file has been created with a default password. You can change it if needed:

```env
APP_PASSWORD=admin123
```

**Important**: 
- The default password is `admin123`
- **Change this to a strong password** for production use
- This password will be required to access the application
- The `.env.local` file is already in `.gitignore` and won't be committed to version control

All bills are automatically saved to `data/bills.json` in your project directory.

## Usage

1. **Login**: Enter the password configured in your `.env.local` file
2. **Select Items**: Choose items from inventory and set quantities
3. **Generate Bill**: Click "Generate Bill" to proceed to billing page
4. **Fill Customer Details**: Enter customer name (required), address, and phone
5. **Set Tax Rate**: Enter the tax percentage (if applicable)
6. **Generate & Print**: Click "Generate Bill" to save, then "Print Bill" to print

## Data Storage

All bills are stored locally in `data/bills.json` file. This file is automatically created when you generate your first bill. The data directory is excluded from version control (see `.gitignore`).

### Data Location
- **Bills File**: `data/bills.json`
- The file is automatically created in the project root directory
- All bills are stored as JSON array

### Backup
To backup your bills, simply copy the `data/bills.json` file to a safe location.

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
│   └── localStorage.ts # Local JSON file storage
├── data/
│   └── bills.json      # Bills data (auto-generated)
└── package.json
```

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Node.js File System** - Local data storage
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

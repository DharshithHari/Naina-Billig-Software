# Google Sheets and Drive Setup Guide

**IMPORTANT**: Google Sheets and Drive integration is **REQUIRED** for this application. All data is stored in Google Sheets and Google Drive - there is no local file storage.

This guide will help you set up Google Sheets and Google Drive integration for the billing software.

## Prerequisites

1. A Google Cloud Platform (GCP) account
2. A Google Cloud project with APIs enabled

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

## Step 2: Enable Required APIs

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Enable the following APIs:
   - **Google Sheets API**
   - **Google Drive API**

## Step 3: Create a Service Account

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **Service Account**
3. Fill in the service account details:
   - **Name**: `billing-software-service`
   - **Description**: `Service account for billing software`
4. Click **Create and Continue**
5. Skip the optional steps and click **Done**

## Step 4: Create and Download Service Account Key

1. Click on the service account you just created
2. Go to the **Keys** tab
3. Click **Add Key** > **Create new key**
4. Select **JSON** format
5. Click **Create** - this will download a JSON file

## Step 5: Share Google Drive Folder (REQUIRED for Image Uploads)

**Important**: Service accounts cannot upload files directly to their own Drive. You must share a folder with the service account.

1. Create a folder in Google Drive named "Product Images" (or any name you prefer)
2. Right-click the folder and select **Share**
3. Add the service account email (found in the JSON file as `client_email`)
4. Give it **Editor** access
5. Click **Send**
6. **Copy the Folder ID** from the URL:
   - The URL will look like: `https://drive.google.com/drive/folders/FOLDER_ID`
   - Copy the `FOLDER_ID` part
   - Add it to your `.env.local` as `GOOGLE_DRIVE_FOLDER_ID`

## Step 6: Share Google Sheets (Optional)

If you want to use an existing Google Sheet:

1. Create a new Google Sheet or use an existing one
2. Click **Share** button
3. Add the service account email (found in the JSON file as `client_email`)
4. Give it **Editor** access
5. Copy the Sheet ID from the URL (the long string between `/d/` and `/edit`)
   - Example: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - The `SPREADSHEET_ID` is what you need

## Step 7: Configure Environment Variables

1. Open the downloaded JSON file from Step 4
2. Copy the following values:
   - `client_email` - This is your service account email
   - `private_key` - This is your private key (keep it secure!)

3. Create or update your `.env.local` file in the project root:

```env
# Existing variables
APP_PASSWORD=your_password_here

# Google Service Account Credentials
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"

# Optional: Google Sheets ID (if using existing sheet)
# If not provided, a new sheet will be created automatically
GOOGLE_SHEETS_ID=your_spreadsheet_id_here

# Optional: Google Drive folder name (default: "Product Images")
GOOGLE_DRIVE_FOLDER_NAME=Product Images

# Optional: Google Drive folder ID (if you've shared a folder with the service account)
# Get the folder ID from the folder URL: https://drive.google.com/drive/folders/FOLDER_ID
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here

# Optional: Google Drive user email for domain-wide delegation (Google Workspace only)
# This allows the service account to impersonate a user and upload to their Drive
# Requires domain-wide delegation to be enabled in Google Cloud Console
GOOGLE_DRIVE_USER_EMAIL=user@yourdomain.com

# Optional: Google Drive Shared Drive ID (Google Workspace only)
# Use a Shared Drive instead of personal Drive
GOOGLE_DRIVE_SHARED_DRIVE_ID=your_shared_drive_id_here

# Optional: Make Drive files publicly accessible (default: false)
GOOGLE_DRIVE_PUBLIC_ACCESS=false
```

**Important Notes:**
- The `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` must include the entire key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Replace `\n` in the private key with actual newlines, or keep them as `\n` (the code handles both)
- Keep your `.env.local` file secure and never commit it to version control

## Step 8: Verify Setup

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Test the integration:
   - Add a new product with an image in the inventory management
   - Create a new bill
   - Check your Google Sheet to see if data is synced
   - Check your Google Drive folder to see if images are uploaded

## Troubleshooting

### Error: "Google Sheets credentials not configured"
- Make sure all environment variables are set correctly in `.env.local`
- Restart your development server after adding environment variables

### Error: "Permission denied" or "Insufficient permissions"
- Make sure the service account has access to the Google Sheet (if using existing sheet)
- Make sure the service account has access to the Google Drive folder
- Verify the service account email is correct

### Images not uploading - "Service Accounts do not have storage quota"

This is a common error. Service accounts cannot upload files directly to their own Drive. You have three options:

**Option 1: Share a folder with the service account (Easiest)**
1. Create a folder in your Google Drive (e.g., "Product Images")
2. Right-click the folder and select **Share**
3. Add your service account email (from `GOOGLE_SERVICE_ACCOUNT_EMAIL`)
4. Give it **Editor** access
5. Copy the folder ID from the URL: `https://drive.google.com/drive/folders/FOLDER_ID`
6. Add to `.env.local`: `GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here`

**Option 2: Use Domain-Wide Delegation (Google Workspace only)**
1. Enable domain-wide delegation in Google Cloud Console:
   - Go to your service account > **Show Domain-Wide Delegation**
   - Enable it and note the Client ID
2. In Google Admin Console:
   - Go to **Security** > **API Controls** > **Domain-wide Delegation**
   - Add your service account Client ID
   - Add scope: `https://www.googleapis.com/auth/drive`
3. Add to `.env.local`: `GOOGLE_DRIVE_USER_EMAIL=user@yourdomain.com`

**Option 3: Use a Shared Drive (Google Workspace only)**
1. Create a Shared Drive in Google Drive
2. Add your service account as a Manager
3. Get the Shared Drive ID from the URL
4. Add to `.env.local`: `GOOGLE_DRIVE_SHARED_DRIVE_ID=your_shared_drive_id_here`

### Other image upload issues
- Check that Google Drive API is enabled
- Verify the folder name matches in `GOOGLE_DRIVE_FOLDER_NAME`
- Check that the service account has Editor access to the folder

### Data not syncing to Sheets
- Check that Google Sheets API is enabled
- Verify the spreadsheet ID is correct (if using existing sheet)
- Check server logs for detailed error messages

## Manual Sync

You can manually sync all data to Google Sheets by calling the sync API:

```bash
curl -X POST http://localhost:3000/api/google/sync-sheets \
  -H "Content-Type: application/json" \
  -d '{"type": "all"}'
```

Or sync specific data:
- `{"type": "bills"}` - Sync only bills
- `{"type": "inventory"}` - Sync only inventory
- `{"type": "all"}` - Sync both bills and inventory

## Security Best Practices

1. **Never commit** your `.env.local` file to version control
2. **Rotate keys** periodically for security
3. **Limit permissions** - Only give the service account the minimum required permissions
4. **Use environment-specific credentials** - Use different service accounts for development and production

## Support

If you encounter any issues, check:
1. Server logs for detailed error messages
2. Google Cloud Console for API quotas and limits
3. Service account permissions in Google Drive and Sheets


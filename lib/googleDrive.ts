import { google } from 'googleapis';
import { Readable } from 'stream';

// Initialize Google Drive API
function getDriveClient(userEmail?: string) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  // If user email is provided, use domain-wide delegation to impersonate that user
  if (userEmail) {
    const jwtClient = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/drive'],
      subject: userEmail, // Impersonate this user
    });
    return google.drive({ version: 'v3', auth: jwtClient });
  }

  return google.drive({ version: 'v3', auth });
}

// Get or create folder in Google Drive
async function getOrCreateFolder(drive: any, folderName: string, parentFolderId?: string, useSharedDrive?: boolean) {
  try {
    // If a specific folder ID is provided via env, use it directly
    if (process.env.GOOGLE_DRIVE_FOLDER_ID) {
      return process.env.GOOGLE_DRIVE_FOLDER_ID;
    }

    // Search for existing folder
    let query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    if (parentFolderId) {
      query += ` and '${parentFolderId}' in parents`;
    } else if (useSharedDrive && process.env.GOOGLE_DRIVE_SHARED_DRIVE_ID) {
      // Search in shared drive
      query += ` and '${process.env.GOOGLE_DRIVE_SHARED_DRIVE_ID}' in parents`;
    } else {
      query += ` and 'root' in parents`;
    }

    const listParams: any = {
      q: query,
      fields: 'files(id, name)',
    };

    // If using shared drive, specify it
    if (useSharedDrive && process.env.GOOGLE_DRIVE_SHARED_DRIVE_ID) {
      listParams.driveId = process.env.GOOGLE_DRIVE_SHARED_DRIVE_ID;
      listParams.corpora = 'drive';
      listParams.supportsAllDrives = true;
      listParams.includeItemsFromAllDrives = true;
    }

    const response = await drive.files.list(listParams);

    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id!;
    }

    // Create folder if it doesn't exist
    const folderMetadata: any = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };

    if (parentFolderId) {
      folderMetadata.parents = [parentFolderId];
    } else if (useSharedDrive && process.env.GOOGLE_DRIVE_SHARED_DRIVE_ID) {
      folderMetadata.parents = [process.env.GOOGLE_DRIVE_SHARED_DRIVE_ID];
    }

    const createParams: any = {
      requestBody: folderMetadata,
      fields: 'id',
    };

    if (useSharedDrive && process.env.GOOGLE_DRIVE_SHARED_DRIVE_ID) {
      createParams.supportsAllDrives = true;
    }

    const folder = await drive.files.create(createParams);

    return folder.data.id!;
  } catch (error) {
    console.error('Error getting/creating folder:', error);
    throw error;
  }
}

// Upload image to Google Drive
export async function uploadImageToDrive(
  imageBuffer: Buffer,
  fileName: string,
  mimeType: string = 'image/jpeg'
): Promise<string | null> {
  try {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
      console.warn('Google Drive credentials not configured');
      return null;
    }

    // Try different methods based on configuration
    let drive: any;
    let folderId: string;
    let useSharedDrive = false;

    // Method 1: Use domain-wide delegation if user email is provided
    if (process.env.GOOGLE_DRIVE_USER_EMAIL) {
      drive = getDriveClient(process.env.GOOGLE_DRIVE_USER_EMAIL);
      folderId = await getOrCreateFolder(
        drive,
        process.env.GOOGLE_DRIVE_FOLDER_NAME || 'Product Images'
      );
    }
    // Method 2: Use Shared Drive if configured
    else if (process.env.GOOGLE_DRIVE_SHARED_DRIVE_ID) {
      drive = getDriveClient();
      useSharedDrive = true;
      folderId = await getOrCreateFolder(
        drive,
        process.env.GOOGLE_DRIVE_FOLDER_NAME || 'Product Images',
        undefined,
        true
      );
    }
    // Method 3: Use specific folder ID (must be shared with service account)
    else if (process.env.GOOGLE_DRIVE_FOLDER_ID) {
      drive = getDriveClient();
      folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    }
    // Method 4: Default (will likely fail, but try anyway)
    else {
      drive = getDriveClient();
      folderId = await getOrCreateFolder(
        drive,
        process.env.GOOGLE_DRIVE_FOLDER_NAME || 'Product Images'
      );
    }

    // Upload file
    const fileMetadata: any = {
      name: fileName,
      parents: [folderId],
    };

    // Convert Buffer to Stream for Google Drive API
    const stream = Readable.from(imageBuffer);

    const media = {
      mimeType,
      body: stream,
    };

    const createParams: any = {
      requestBody: fileMetadata,
      media,
      fields: 'id, webViewLink, webContentLink',
    };

    if (useSharedDrive) {
      createParams.supportsAllDrives = true;
    }

    const file = await drive.files.create(createParams);

    // Make the file publicly accessible (optional, for direct image URLs)
    if (process.env.GOOGLE_DRIVE_PUBLIC_ACCESS === 'true') {
      const permissionParams: any = {
        fileId: file.data.id!,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      };
      if (useSharedDrive) {
        permissionParams.supportsAllDrives = true;
      }
      await drive.permissions.create(permissionParams);
    }

    // Return the file ID or web view link
    return file.data.webViewLink || `https://drive.google.com/file/d/${file.data.id}/view`;
  } catch (error: any) {
    console.error('Error uploading image to Google Drive:', error);
    
    // Provide helpful error message
    if (error.code === 403 && error.message?.includes('Service Accounts do not have storage quota')) {
      const errorMessage = `
Google Drive Upload Error: Service accounts cannot upload files directly to their own Drive.

Solutions:
1. Use Domain-Wide Delegation (Recommended for Google Workspace):
   - Set GOOGLE_DRIVE_USER_EMAIL in .env.local to a user email
   - Enable domain-wide delegation in Google Cloud Console
   - See GOOGLE_SETUP.md for detailed instructions

2. Use a Shared Drive (Google Workspace only):
   - Set GOOGLE_DRIVE_SHARED_DRIVE_ID in .env.local
   - Share the drive with your service account

3. Share a folder with the service account:
   - Create a folder in your Google Drive
   - Share it with the service account email (Editor access)
   - Set GOOGLE_DRIVE_FOLDER_ID in .env.local to the folder ID
      `;
      throw new Error(errorMessage);
    }
    
    throw error;
  }
}

// Upload image from base64 string
export async function uploadImageFromBase64(
  base64String: string,
  fileName: string
): Promise<string | null> {
  try {
    // Remove data URL prefix if present
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Determine mime type from base64 string or default to jpeg
    let mimeType = 'image/jpeg';
    if (base64String.startsWith('data:image/png')) {
      mimeType = 'image/png';
    } else if (base64String.startsWith('data:image/jpeg') || base64String.startsWith('data:image/jpg')) {
      mimeType = 'image/jpeg';
    } else if (base64String.startsWith('data:image/gif')) {
      mimeType = 'image/gif';
    } else if (base64String.startsWith('data:image/webp')) {
      mimeType = 'image/webp';
    }

    return await uploadImageToDrive(imageBuffer, fileName, mimeType);
  } catch (error) {
    console.error('Error uploading image from base64:', error);
    throw error;
  }
}

// Delete image from Google Drive
export async function deleteImageFromDrive(fileId: string): Promise<void> {
  try {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
      console.warn('Google Drive credentials not configured');
      return;
    }

    const drive = getDriveClient();
    await drive.files.delete({
      fileId,
    });
  } catch (error) {
    console.error('Error deleting image from Google Drive:', error);
    throw error;
  }
}


import { google } from 'googleapis';

// Initialize Google Drive API
function getDriveClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  return google.drive({ version: 'v3', auth });
}

// Get or create folder in Google Drive
async function getOrCreateFolder(drive: any, folderName: string, parentFolderId?: string) {
  try {
    // Search for existing folder
    let query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    if (parentFolderId) {
      query += ` and '${parentFolderId}' in parents`;
    } else {
      query += ` and 'root' in parents`;
    }

    const response = await drive.files.list({
      q: query,
      fields: 'files(id, name)',
    });

    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id!;
    }

    // Create folder if it doesn't exist
    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      ...(parentFolderId && { parents: [parentFolderId] }),
    };

    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id',
    });

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

    const drive = getDriveClient();

    // Get or create "Product Images" folder
    const folderId = await getOrCreateFolder(
      drive,
      process.env.GOOGLE_DRIVE_FOLDER_NAME || 'Product Images'
    );

    // Upload file
    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };

    const media = {
      mimeType,
      body: imageBuffer,
    };

    const file = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id, webViewLink, webContentLink',
    });

    // Make the file publicly accessible (optional, for direct image URLs)
    if (process.env.GOOGLE_DRIVE_PUBLIC_ACCESS === 'true') {
      await drive.permissions.create({
        fileId: file.data.id!,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
    }

    // Return the file ID or web view link
    return file.data.webViewLink || `https://drive.google.com/file/d/${file.data.id}/view`;
  } catch (error) {
    console.error('Error uploading image to Google Drive:', error);
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


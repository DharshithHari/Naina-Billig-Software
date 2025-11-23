import { NextRequest, NextResponse } from 'next/server';
import { uploadImageFromBase64 } from '@/lib/googleDrive';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64, fileName } = body;

    if (!imageBase64 || !fileName) {
      return NextResponse.json(
        { success: false, error: 'Image data and file name are required' },
        { status: 400 }
      );
    }

    const imageUrl = await uploadImageFromBase64(imageBase64, fileName);

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Failed to upload image. Please check Google Drive configuration.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, imageUrl });
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}


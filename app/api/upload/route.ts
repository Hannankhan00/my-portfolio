import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import cloudinary from '@/lib/cloudinary';

const SESSION_TOKEN = 'admin_session';
const SESSION_VALUE = 'authenticated';

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_TOKEN)?.value === SESSION_VALUE;
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    return Response.json(
      {
        error:
          'Cloudinary is not configured yet. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.local',
      },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'portfolio-projects',
            resource_type: 'image',
          },
          (error, result) => {
            if (error || !result) {
              reject(error ?? new Error('Upload failed with no result'));
            } else {
              resolve({
                secure_url: result.secure_url,
                public_id: result.public_id,
              });
            }
          }
        );
        uploadStream.end(buffer);
      }
    );

    return Response.json({
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    });
  } catch (err: unknown) {
    console.error('Cloudinary upload error:', err);
    const message = err instanceof Error ? err.message : 'Upload failed';
    return Response.json({ error: message }, { status: 500 });
  }
}

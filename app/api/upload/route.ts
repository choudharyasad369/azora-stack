import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';
import { StorageService } from '@/services/storage.service';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const formData = await req.formData();

    const projectFile = formData.get('projectFile') as File | null;
    const thumbnail = formData.get('thumbnail') as File | null;

    if (!projectFile || !thumbnail) {
      return errorResponse('VALIDATION_ERROR', 'Both project file and thumbnail are required');
    }

    // Validate files
    const projectValidation = StorageService.validateProjectFile(projectFile);
    if (!projectValidation.valid) {
      return errorResponse('VALIDATION_ERROR', projectValidation.error!);
    }

    const thumbnailValidation = StorageService.validateThumbnail(thumbnail);
    if (!thumbnailValidation.valid) {
      return errorResponse('VALIDATION_ERROR', thumbnailValidation.error!);
    }

    // Generate unique project ID
    const projectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log('📤 Starting file upload...');
    console.log(`Project ID: ${projectId}`);
    console.log(`Project file: ${projectFile.name} (${(projectFile.size / 1024 / 1024).toFixed(2)} MB)`);
    console.log(`Thumbnail: ${thumbnail.name} (${(thumbnail.size / 1024).toFixed(2)} KB)`);

    // Convert files to buffers
    const projectBuffer = Buffer.from(await projectFile.arrayBuffer());
    const thumbnailBuffer = Buffer.from(await thumbnail.arrayBuffer());

    // Upload to Supabase and Cloudinary
    console.log('⬆️  Uploading files...');
    
    const [fileUrl, thumbnailUrl] = await Promise.all([
      StorageService.uploadProjectFile(
        user.userId,
        projectId,
        projectBuffer,
        projectFile.name
      ),
      StorageService.uploadThumbnail(
        user.userId,
        projectId,
        thumbnailBuffer,
        thumbnail.name
      ),
    ]);

    console.log('✅ Upload complete!');
    console.log(`File URL: ${fileUrl}`);
    console.log(`Thumbnail URL: ${thumbnailUrl}`);

    return successResponse({
      fileUrl,
      thumbnailUrl,
      projectId,
      fileSize: projectFile.size,
    }, 'Files uploaded successfully');

  } catch (error) {
    console.error('❌ Upload error:', error);
    return handleApiError(error);
  }
}

// Configure for large file uploads (up to 150MB)
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes
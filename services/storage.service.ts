import { createClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Configure Cloudinary (for images only)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class StorageService {
  /**
   * Upload project ZIP file to Supabase Storage
   * Supabase supports large files with proper configuration
   */
  static async uploadProjectFile(
    userId: string,
    projectId: string,
    fileBuffer: Buffer,
    fileName: string
  ): Promise<string> {
    try {
      const timestamp = Date.now();
      const filePath = `${userId}/${projectId}-${timestamp}.zip`;
      
      console.log(`📤 Uploading project file to Supabase...`);
      console.log(`   File: ${fileName}`);
      console.log(`   Size: ${(fileBuffer.length / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Path: ${filePath}`);

      const { data, error } = await supabase.storage
        .from('projects')
        .upload(filePath, fileBuffer, {
          contentType: 'application/zip',
          upsert: false,
        });

      if (error) {
        console.error('❌ Supabase upload error:', error);
        throw new Error(`Failed to upload to Supabase: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('projects')
        .getPublicUrl(filePath);

      console.log(`✅ Project file uploaded to Supabase!`);
      console.log(`   URL: ${urlData.publicUrl}`);

      return urlData.publicUrl;
    } catch (error: any) {
      console.error('❌ Error uploading project file:', error);
      throw new Error(`Failed to upload project file: ${error.message}`);
    }
  }

  /**
   * Upload thumbnail to Cloudinary (images only)
   */
  static async uploadThumbnail(
    userId: string,
    projectId: string,
    fileBuffer: Buffer,
    fileName: string
  ): Promise<string> {
    try {
      console.log(`📤 Uploading thumbnail to Cloudinary...`);
      
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `azora-stack/thumbnails/${userId}`,
            public_id: `${projectId}-${Date.now()}`,
            resource_type: 'image',
            transformation: [
              { width: 1200, height: 630, crop: 'fill', quality: 'auto' },
            ],
          },
          (error, result) => {
            if (error) {
              console.error('❌ Cloudinary thumbnail upload error:', error);
              reject(new Error(`Failed to upload thumbnail: ${error.message}`));
            } else {
              console.log(`✅ Thumbnail uploaded to Cloudinary!`);
              console.log(`   URL: ${result!.secure_url}`);
              resolve(result!.secure_url);
            }
          }
        );

        uploadStream.end(fileBuffer);
      });
    } catch (error: any) {
      console.error('❌ Error uploading thumbnail:', error);
      throw new Error(`Failed to upload thumbnail: ${error.message}`);
    }
  }

  /**
   * Generate signed download URL for Supabase file
   */
  static async generateSignedDownloadUrl(
    fileUrl: string,
    expiresIn: number = 24 * 60 * 60 // 24 hours in seconds
  ): Promise<string> {
    try {
      // Extract file path from Supabase URL
      const url = new URL(fileUrl);
      const pathParts = url.pathname.split('/projects/');
      if (pathParts.length < 2) {
        throw new Error('Invalid Supabase URL');
      }
      const filePath = pathParts[1];

      const { data, error } = await supabase.storage
        .from('projects')
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        throw new Error(`Failed to generate signed URL: ${error.message}`);
      }

      return data.signedUrl;
    } catch (error: any) {
      console.error('❌ Error generating signed URL:', error);
      throw new Error(`Failed to generate download URL: ${error.message}`);
    }
  }

  /**
   * Delete file from Supabase Storage
   */
  static async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const url = new URL(fileUrl);
      const pathParts = url.pathname.split('/projects/');
      if (pathParts.length < 2) {
        throw new Error('Invalid Supabase URL');
      }
      const filePath = pathParts[1];

      const { error } = await supabase.storage
        .from('projects')
        .remove([filePath]);

      if (error) {
        throw new Error(`Failed to delete file: ${error.message}`);
      }

      console.log(`✅ Deleted file: ${filePath}`);
    } catch (error: any) {
      console.error('❌ Error deleting file:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Delete thumbnail from Cloudinary
   */
  static async deleteThumbnail(thumbnailUrl: string): Promise<void> {
    try {
      // Extract public_id from Cloudinary URL
      const publicId = this.getPublicIdFromUrl(thumbnailUrl);
      
      if (!publicId) {
        throw new Error('Invalid Cloudinary URL');
      }

      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
      });
      
      if (result.result === 'ok') {
        console.log(`✅ Deleted thumbnail: ${publicId}`);
      } else {
        console.warn(`⚠️  Thumbnail deletion result: ${result.result}`);
      }
    } catch (error: any) {
      console.error('❌ Error deleting thumbnail:', error);
      throw new Error(`Failed to delete thumbnail: ${error.message}`);
    }
  }

  /**
   * Validate project file before upload
   */
  static validateProjectFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!file.name.endsWith('.zip')) {
      return { valid: false, error: 'Only ZIP files are allowed' };
    }

    // Check file size (150MB max)
    const maxSize = 150 * 1024 * 1024; // 150MB
    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 150MB limit. Please use a smaller file.' };
    }

    if (file.size === 0) {
      return { valid: false, error: 'File is empty' };
    }

    return { valid: true };
  }

  /**
   * Validate thumbnail before upload
   */
  static validateThumbnail(file: File): { valid: boolean; error?: string } {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Only JPG, PNG, and WebP images are allowed' };
    }

    // Check file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { valid: false, error: 'Image size exceeds 10MB limit' };
    }

    if (file.size === 0) {
      return { valid: false, error: 'Image file is empty' };
    }

    return { valid: true };
  }

  /**
   * Get public_id from Cloudinary URL
   */
  static getPublicIdFromUrl(url: string): string | null {
    try {
      // Extract public_id from Cloudinary URL
      // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/file.jpg
      const matches = url.match(/\/v\d+\/(.+)$/);
      if (matches && matches[1]) {
        // Remove file extension
        return matches[1].replace(/\.[^/.]+$/, '');
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if file exists in Supabase
   */
  static async fileExists(fileUrl: string): Promise<boolean> {
    try {
      const url = new URL(fileUrl);
      const pathParts = url.pathname.split('/projects/');
      if (pathParts.length < 2) return false;
      
      const filePath = pathParts[1];

      const { data, error } = await supabase.storage
        .from('projects')
        .list(filePath.split('/')[0]);

      return !error && data.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get public URL from Supabase
   */
  static getPublicUrl(fileUrl: string): string {
    return fileUrl;
  }
}

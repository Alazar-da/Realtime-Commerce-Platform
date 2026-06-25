// lib/services/uploadService.ts
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export interface UploadResponse {
  url: string;
  path: string;
}

export class UploadService {
  static async uploadImage(
    file: File,
    folder: string = 'products',
    userId?: string
  ): Promise<UploadResponse> {
    try {
      if (!file) throw new Error('No file provided');
      
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error(`File size exceeds 5MB limit`);
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('File type not allowed. Please use JPEG, PNG, WebP, or GIF.');
      }

      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const filePath = userId 
        ? `${folder}/${userId}/${fileName}`
        : `${folder}/${fileName}`;

      // Try to upload with bucket creation if needed
      const { data, error } = await supabase.storage
        .from(folder)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        // If bucket doesn't exist, create it
        if (error.message.includes('bucket not found')) {
          const { error: bucketError } = await supabase.storage.createBucket(folder, {
            public: true
          });
          
          if (bucketError) {
            throw new Error(`Failed to create storage bucket: ${bucketError.message}`);
          }
          
          // Retry upload
          const { data: retryData, error: retryError } = await supabase.storage
            .from(folder)
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });
            
          if (retryError) {
            throw new Error(retryError.message);
          }
          
          const { data: { publicUrl } } = supabase.storage
            .from(folder)
            .getPublicUrl(retryData.path);
            
          return {
            url: publicUrl,
            path: retryData.path
          };
        }
        throw new Error(error.message);
      }

      const { data: { publicUrl } } = supabase.storage
        .from(folder)
        .getPublicUrl(data.path);

      return {
        url: publicUrl,
        path: data.path
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  static async deleteImage(path: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from('products')
        .remove([path]);

      if (error) {
        throw new Error(`Failed to delete image: ${error.message}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  }
}
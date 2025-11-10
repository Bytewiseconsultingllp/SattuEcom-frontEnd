import axios from 'axios';
import api from '../axiosInstance';

/**
 * Upload Response Interface
 */
export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    public_id: string;
    width?: number;
    height?: number;
    format?: string;
  };
}

export interface MultipleUploadResponse {
  success: boolean;
  message: string;
  data: Array<{
    url: string;
    public_id: string;
    width?: number;
    height?: number;
    format?: string;
  }>;
}

/**
 * Convert file to base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Validate image file
 */
export const validateImageFile = (
  file: File,
  options: {
    maxSizeMB?: number;
    allowedFormats?: string[];
  } = {}
): { valid: boolean; error?: string } => {
  const { maxSizeMB = 10, allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'] } = options;

  // Check file type
  if (!allowedFormats.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file format. Allowed: ${allowedFormats.map(f => f.split('/')[1]).join(', ')}`,
    };
  }

  // Check file size
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > maxSizeMB) {
    return {
      valid: false,
      error: `File size ${fileSizeMB.toFixed(2)}MB exceeds maximum ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
};

/**
 * Upload single image
 */
export async function uploadImage(file: File, folder?: string): Promise<UploadResponse> {
  try {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Convert to base64
    const base64 = await fileToBase64(file);

    // Upload
    const response = await api.post('/upload/image', {
      image: base64,
      folder,
    });

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const serverMsg = error.response?.data?.message ?? error.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw error;
  }
}

/**
 * Upload multiple images
 */
export async function uploadMultipleImages(files: File[], folder?: string): Promise<MultipleUploadResponse> {
  try {
    // Validate all files
    for (let i = 0; i < files.length; i++) {
      const validation = validateImageFile(files[i]);
      if (!validation.valid) {
        throw new Error(`Image ${i + 1}: ${validation.error}`);
      }
    }

    // Convert all to base64
    const base64Promises = files.map(file => fileToBase64(file));
    const base64Images = await Promise.all(base64Promises);

    // Upload
    const response = await api.post('/upload/images', {
      images: base64Images,
      folder,
    });

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const serverMsg = error.response?.data?.message ?? error.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw error;
  }
}

/**
 * Upload product images
 */
export async function uploadProductImages(files: File[]): Promise<MultipleUploadResponse> {
  try {
    // Validate all files (max 5MB per image for products)
    for (let i = 0; i < files.length; i++) {
      const validation = validateImageFile(files[i], { maxSizeMB: 5 });
      if (!validation.valid) {
        throw new Error(`Image ${i + 1}: ${validation.error}`);
      }
    }

    // Convert all to base64
    const base64Promises = files.map(file => fileToBase64(file));
    const base64Images = await Promise.all(base64Promises);

    // Upload
    const response = await api.post('/upload/product-images', {
      images: base64Images,
    });

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const serverMsg = error.response?.data?.message ?? error.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw error;
  }
}

/**
 * Upload company logo
 */
export async function uploadCompanyLogo(file: File): Promise<UploadResponse> {
  try {
    // Validate file (max 2MB for logo)
    const validation = validateImageFile(file, { maxSizeMB: 2 });
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Convert to base64
    const base64 = await fileToBase64(file);

    // Upload
    const response = await api.post('/upload/company-logo', {
      image: base64,
    });

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const serverMsg = error.response?.data?.message ?? error.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw error;
  }
}

/**
 * Upload company signature
 */
export async function uploadCompanySignature(file: File): Promise<UploadResponse> {
  try {
    // Validate file (max 2MB for signature)
    const validation = validateImageFile(file, { maxSizeMB: 2 });
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Convert to base64
    const base64 = await fileToBase64(file);

    // Upload
    const response = await api.post('/upload/company-signature', {
      image: base64,
    });

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const serverMsg = error.response?.data?.message ?? error.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw error;
  }
}

/**
 * Upload review images
 */
export async function uploadReviewImages(files: File[]): Promise<MultipleUploadResponse> {
  try {
    // Limit to 5 images
    if (files.length > 5) {
      throw new Error('Maximum 5 images allowed per review');
    }

    // Validate all files (max 3MB per image for reviews)
    for (let i = 0; i < files.length; i++) {
      const validation = validateImageFile(files[i], { maxSizeMB: 3 });
      if (!validation.valid) {
        throw new Error(`Image ${i + 1}: ${validation.error}`);
      }
    }

    // Convert all to base64
    const base64Promises = files.map(file => fileToBase64(file));
    const base64Images = await Promise.all(base64Promises);

    // Upload
    const response = await api.post('/upload/review-images', {
      images: base64Images,
    });

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const serverMsg = error.response?.data?.message ?? error.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw error;
  }
}

/**
 * Delete image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.delete('/upload/image', {
      data: { public_id: publicId },
    });

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const serverMsg = error.response?.data?.message ?? error.message;
      throw new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg));
    }
    throw error;
  }
}

/**
 * Compress image before upload (client-side)
 */
export const compressImage = (file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
};

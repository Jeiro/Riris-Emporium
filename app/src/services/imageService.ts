import { supabase } from '../lib/supabase';

export const imageService = {
  uploadProductImage: async (file: File) => {
    try {
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${file.name}`;
      const filePath = `products/${fileName}`;

      console.log('Uploading file:', fileName, 'Size:', file.size, 'Type:', file.type);

      // Upload the file
      const { error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (error) {
        console.error('Upload error details:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      console.log('File uploaded successfully');

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      console.log('Public URL:', urlData.publicUrl);

      return {
        url: urlData.publicUrl,
        path: filePath
      };
    } catch (error) {
      console.error('Error in uploadProductImage:', error);
      throw error;
    }
  }
};

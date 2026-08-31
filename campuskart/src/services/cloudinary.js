/**
 * CampusKart Cloudinary Upload Service
 * Handles signed uploads to Cloudinary.
 */

import { apiService } from '../api/apiService.js';

export const cloudinaryService = {
  async upload(file, folder = 'listings') {
    const sign = await apiService.signUpload(folder);

    if (!sign || sign.signature === 'mock-signature') {
      throw new Error('Cloudinary not configured');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', sign.apiKey);
    formData.append('timestamp', sign.timestamp.toString());
    formData.append('signature', sign.signature);
    formData.append('folder', sign.folder);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`;

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return {
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
    };
  },
};

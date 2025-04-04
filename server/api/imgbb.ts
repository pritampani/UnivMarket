import { Router } from 'express';
import multer from 'multer';
import fetch from 'node-fetch';
import FormData from 'form-data';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

const router = Router();

// Set up multer for temporary file storage
const upload = multer({ 
  dest: 'temp/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Define ImgBB API response type
interface ImgBBResponse {
  success: boolean;
  data?: {
    url: string;
    delete_url: string;
    display_url: string;
    thumb?: {
      url: string;
    };
  };
  error?: {
    message: string;
  };
}

/**
 * Upload an image to ImgBB
 * POST /api/imgbb/upload
 * Required: image file in multipart form data
 * Returns: { success: boolean, data: { url: string } }
 */
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file provided' });
    }

    const imgbbApiKey = process.env.IMGBB_API_KEY;
    if (!imgbbApiKey) {
      return res.status(500).json({ success: false, error: 'ImgBB API key not configured' });
    }

    // Read the file
    const fileData = fs.readFileSync(req.file.path);
    
    // Create a form for the ImgBB API request
    const form = new FormData();
    form.append('key', imgbbApiKey);
    form.append('image', fileData, {
      filename: `${uuidv4()}_${path.basename(req.file.originalname)}`,
      contentType: req.file.mimetype,
    });

    // Call ImgBB API
    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: form,
    });

    const result = await response.json() as ImgBBResponse;

    // Clean up temp file
    fs.unlinkSync(req.file.path);

    if (!result.success) {
      return res.status(500).json({ 
        success: false, 
        error: result.error?.message || 'Failed to upload image to ImgBB' 
      });
    }

    // Return success with the image URL
    return res.json({
      success: true,
      data: {
        url: result.data?.url,
        delete_url: result.data?.delete_url,
        display_url: result.data?.display_url,
        thumbnail: result.data?.thumb?.url || null,
      }
    });
  } catch (error: any) {
    console.error('Error uploading to ImgBB:', error);
    
    // Clean up temp file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error'
    });
  }
});

export default router;
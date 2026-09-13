import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import logger from '../utils/logger';
import { catchAsync } from '../utils/catchAsync';
import { BadRequestError } from '../utils/AppError';
import { db } from '../config/database';
import { consultationPhotos } from '../db/schema/index';
import { verifyConsultationOwnershipREST } from '../middleware/verifyConsultationOwnershipREST';
import { photoAnalysisService } from '../services/photoAnalysisService';

const router = Router();

// Multer in-memory storage configuration with 8MB cap and image mime-type allowlist
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB cap
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestError(`Unsupported image type: ${file.mimetype}. Allowed types: image/jpeg, image/png, image/webp`));
    }
  }
}).single('photo');

/**
 * POST /api/consultation/:consultationId/photo
 * 
 * Handles patient photo upload, sharp resizing/EXIF stripping, Groq vision analysis,
 * secondary triage backstop, and server-side consent record persistence.
 */
router.post(
  '/:consultationId/photo',
  verifyConsultationOwnershipREST,
  (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, error: 'File size exceeds maximum limit of 8MB' });
          }
          return res.status(400).json({ success: false, error: `Upload error: ${err.message}` });
        }
        return res.status(400).json({ success: false, error: err.message || 'Invalid upload request' });
      }
      next();
    });
  },
  catchAsync(async (req: Request, res: Response) => {
    const rawId = req.params.consultationId;
    const consultationId = Array.isArray(rawId) ? rawId[0] : rawId;
    const { consentAcknowledged, caption, specialistType = 'general', language = 'en' } = req.body;

    // 1. Consent validation - must be explicitly acknowledged
    if (consentAcknowledged !== true && consentAcknowledged !== 'true') {
      return res.status(400).json({
        success: false,
        error: 'Consent must be acknowledged to upload and analyze photos.'
      });
    }

    // 2. Photo file presence
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        error: 'No photo file provided.'
      });
    }

    // 3. Server-generated consent timestamp (never trust client-supplied timestamp)
    const consentedAt = new Date();

    // 4. Sharp image processing: auto-rotate via EXIF, strip EXIF metadata, resize to 2048px max dimension
    let processedBuffer: Buffer;
    try {
      processedBuffer = await sharp(req.file.buffer)
        .rotate()
        .resize({ width: 2048, height: 2048, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
    } catch (sharpErr: any) {
      logger.error('Failed to process image with sharp', { error: sharpErr.message });
      return res.status(400).json({
        success: false,
        error: 'Invalid or corrupt image file.'
      });
    }

    const imageBase64 = processedBuffer.toString('base64');

    // 5. Invoke photo analysis service (Groq vision model + secondary triage safety net)
    const analysisResponse = await photoAnalysisService.getPhotoAnalysis({
      imageBase64,
      specialistType,
      language,
      caption: typeof caption === 'string' ? caption : undefined,
      userId: req.userId,
      consultationId
    });

    if (analysisResponse.success === false) {
      return res.status(503).json({
        success: false,
        error: analysisResponse.error
      });
    }

    // 6. Persist consultation photo record
    try {
      await db.insert(consultationPhotos).values({
        consultationId,
        imageData: imageBase64,
        mimeType: 'image/jpeg',
        caption: typeof caption === 'string' && caption.trim() ? caption.trim() : null,
        analysisResult: analysisResponse.analysis,
        consentedAt,
      });
    } catch (dbErr: any) {
      logger.error('Failed to persist consultation photo record', { error: dbErr.message, consultationId });
      return res.status(500).json({
        success: false,
        error: 'Failed to record consultation photo in medical record.'
      });
    }

    return res.json({
      success: true,
      analysis: analysisResponse.analysis,
      triageResult: analysisResponse.triageResult,
      consentedAt: consentedAt.toISOString()
    });
  })
);

export default router;

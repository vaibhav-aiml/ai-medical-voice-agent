import { Router, Request, Response } from 'express';
import { EMRExportService } from '../services/emrExportService';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Export a completed consultation clinical session
router.get('/export/:consultationId', requireAuth, catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const consultationId = req.params.consultationId as string;
  const format = (req.query.format as string || 'structured').toLowerCase();

  logger.info('Handling EMR export request', { consultationId, format });

  if (!consultationId) {
    throw new AppError('Consultation ID parameter is required', 400);
  }

  switch (format) {
    case 'structured': {
      const data = await EMRExportService.exportStructuredJSON(userId, consultationId);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=emr_report_${consultationId}.json`);
      return res.json(data);
    }

    case 'fhir-json': {
      const data = await EMRExportService.exportFHIRJSON(userId, consultationId);
      res.setHeader('Content-Type', 'application/fhir+json');
      res.setHeader('Content-Disposition', `attachment; filename=fhir_resource_${consultationId}.json`);
      return res.json(data);
    }

    case 'fhir-bundle': {
      const data = await EMRExportService.exportFHIRBundle(userId, consultationId);
      res.setHeader('Content-Type', 'application/fhir+json');
      res.setHeader('Content-Disposition', `attachment; filename=fhir_bundle_${consultationId}.json`);
      return res.json(data);
    }

    case 'hl7': {
      const data = await EMRExportService.exportHL7(userId, consultationId);
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename=hl7_oru_${consultationId}.txt`);
      return res.send(data);
    }

    case 'pdf': {
      const pdfBuffer = await EMRExportService.exportPDF(userId, consultationId);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=clinical_summary_${consultationId}.pdf`);
      res.setHeader('Content-Length', pdfBuffer.length);
      return res.send(pdfBuffer);
    }

    default:
      throw new AppError(`Format '${format}' not supported. Choose structured, fhir-json, fhir-bundle, hl7, or pdf.`, 400);
  }
}));

export default router;

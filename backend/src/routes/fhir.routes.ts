import { Router, Request, Response } from 'express';
import { FHIRService } from '../services/fhirService';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Retrieve connection status
router.get('/connection-status', requireAuth, catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const connection = await FHIRService.getConnection(userId);
  if (!connection) {
    return res.json({ connected: false });
  }
  res.json({
    connected: true,
    provider: connection.provider,
    fhirServerUrl: connection.fhirServerUrl,
    patientId: connection.patientId,
    tokenExpiresAt: connection.tokenExpiresAt
  });
}));

// Connect endpoint: begins the SMART on FHIR OAuth flow
router.post('/connect', requireAuth, catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { provider, fhirServerUrl, clientId, redirectUri, scope } = req.body;

  if (!provider || !fhirServerUrl || !clientId || !redirectUri) {
    throw new AppError('Missing required SMART configuration parameters', 400);
  }

  logger.info('Initiating SMART on FHIR connection redirect generation', { userId, provider, fhirServerUrl });

  try {
    const smartConfig = await FHIRService.discoverEndpoints(fhirServerUrl);
    
    // Construct the OAuth2 Authorization URL
    const authUrl = new URL(smartConfig.authorization_endpoint);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('scope', scope || 'launch/patient patient/*.read patient/*.write openid fhirUser');
    authUrl.searchParams.append('aud', fhirServerUrl);
    // Encode userId/provider/fhirServerUrl/clientId in state to decode in callback
    const stateObj = { userId, provider, fhirServerUrl, clientId };
    authUrl.searchParams.append('state', Buffer.from(JSON.stringify(stateObj)).toString('base64'));

    res.json({ success: true, authorizationUrl: authUrl.toString() });
  } catch (error: any) {
    logger.error('SMART on FHIR discovery failed', { error: error.message });
    throw new AppError(`Failed to connect to EHR server: ${error.message}`, 500);
  }
}));

// Callback endpoint: handles redirect from SMART on FHIR provider
router.get('/callback', catchAsync(async (req: Request, res: Response) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    logger.error('SMART on FHIR authorization error returned', { error, error_description });
    return res.status(400).send(`EHR Authorization Failed: ${error_description || error}`);
  }

  if (!code || !state) {
    return res.status(400).send('Missing authorization code or state validation parameters');
  }

  try {
    // Decode state
    const stateObj = JSON.parse(Buffer.from(state as string, 'base64').toString('utf8'));
    const { userId, provider, fhirServerUrl, clientId } = stateObj;

    // Use a standard redirect URI configured on the EHR matching this endpoint
    const redirectUri = `${req.protocol}://${req.get('host')}/api/fhir/callback`;

    // Swap code for access tokens
    const connection = await FHIRService.exchangeAuthorizationCode(
      userId,
      provider,
      fhirServerUrl,
      code as string,
      redirectUri,
      clientId
    );

    logger.info('Successfully established SMART on FHIR EHR connection', { userId, patientId: connection.patientId });

    // Send a message back to frontend or render simple redirect
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.send(`
      <html>
        <head>
          <title>EHR Connection Successful</title>
          <script>
            window.opener.postMessage({ type: 'EHR_CONNECTED', success: true }, '*');
            window.close();
          </script>
        </head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #10b981;">EHR Connected Successfully!</h2>
          <p>You can close this window now.</p>
        </body>
      </html>
    `);
  } catch (err: any) {
    logger.error('Failed to handle SMART on FHIR redirect callback', { error: err.message });
    res.status(500).send(`SMART Token Exchange Failed: ${err.message}`);
  }
}));

// Fetch patient info
router.get('/patient', requireAuth, catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const data = await FHIRService.getPatient(userId);
  res.json({ success: true, data });
}));

// Create a Patient resource
router.post('/patient', requireAuth, catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const data = await FHIRService.createPatient(userId, req.body);
  res.json({ success: true, data });
}));

// Update a Patient resource
router.put('/patient', requireAuth, catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const data = await FHIRService.updatePatient(userId, req.body);
  res.json({ success: true, data });
}));

// Fetch aggregated clinical details (Medications, Allergies, Vitals, Conditions, Appointments, Diagnostic Reports)
router.get('/clinical-data', requireAuth, catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const data = await FHIRService.getClinicalData(userId);
  res.json({ success: true, data });
}));

// Sync consultation documents to connected EHR
router.post('/sync/:consultationId', requireAuth, catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { consultationId } = req.params;
  const result = await FHIRService.syncConsultationToFHIR(userId, consultationId as string);
  res.json({ success: true, message: 'Consultation successfully synced to EHR', data: result });
}));

export default router;

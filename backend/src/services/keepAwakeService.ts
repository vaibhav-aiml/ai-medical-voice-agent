import axios from 'axios';
import logger from '../utils/logger';

let intervalId: NodeJS.Timeout | null = null;
export function startKeepAwake() {
  
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction && process.env.FORCE_KEEP_AWAKE !== 'true') {
    logger.info('Keep-awake service skipped (disabled in non-production environments)');
    return;
  }

  const port = process.env.PORT || '3000';
  const defaultUrl = `http://localhost:${port}/health`;
  const url = process.env.KEEP_AWAKE_URL || defaultUrl;
  const intervalStr = process.env.KEEP_AWAKE_INTERVAL || '840000';
  const interval = parseInt(intervalStr, 10);

  if (isNaN(interval) || interval <= 0) {
    logger.warn('Keep-awake service disabled due to invalid interval value', { intervalStr });
    return;
  }

  logger.info(`Starting keep-awake service targeting: ${url} every ${interval}ms`);
  if (intervalId) {
    clearInterval(intervalId);
  }

  intervalId = setInterval(async () => {
    try {
      logger.info(`Sending keep-awake ping to: ${url}`);
      const response = await axios.get(url, { 
        timeout: 10000,
        headers: { 'User-Agent': 'MedicalVoiceAgent-KeepAwake/1.0' }
      });
      logger.info(`Keep-awake ping successful! Status: ${response.status}`);
    } catch (error: any) {
      logger.error('Keep-awake self-ping failed', { error: error.message });
    }
  }, interval);
}
export function stopKeepAwake() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    logger.info('Keep-awake service stopped.');
  }
}
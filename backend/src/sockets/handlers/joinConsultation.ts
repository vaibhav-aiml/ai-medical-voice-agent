import { Socket } from 'socket.io';
import logger from '../../utils/logger';
import { socketRateLimiter } from '../../utils/socketRateLimiter';
import { verifyConsultationOwnership } from '../helpers/verification';

export function registerJoinConsultationHandler(socket: Socket) {
  socket.on('join-consultation', async (consultationId: string) => {
    const allowed = socketRateLimiter.consume(socket.data.userId || 'dev-user-123', socket.id, 'join-consultation');
    if (!allowed) {
      socket.emit('rate-limit-exceeded', { event: 'join-consultation', message: 'Too many requests. Please try again later.' });
      return;
    }

    const authorized = await verifyConsultationOwnership(socket, consultationId);
    if (!authorized) {
      logger.warn('Unauthorized join-consultation attempt blocked', { socketId: socket.id, consultationId });
      socket.emit('error-event', { message: 'Unauthorized: Access denied' });
      return;
    }
    socket.join(`consultation_${consultationId}`);
    logger.info(`Client joined consultation channel`, { socketId: socket.id, consultationId });
  });
}

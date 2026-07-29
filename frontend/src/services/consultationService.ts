import { apiClient } from './apiClient';
import cacheService from './cacheService';
import offlineQueue from './offlineQueue';
import logger from './logger';
import { BACKEND_URL } from '../config/api';

export interface ConsultationData {
  id: string;
  userId: string;
  specialistType: string;
  specialistName: string;
  status: string;
  symptoms: string;
  notes: string;
  duration: number;
  startedAt: Date;
  endedAt?: Date;
}

const CACHE_TTL = 30 * 60 * 1000; 

function consultationsCacheKey(userId: string): string {
  return `consultations_${userId}`;
}
export const consultationService = {
  async getUserConsultations(userId: string): Promise<ConsultationData[]> {
    try {
      
      const response = await apiClient.get(`/consultations/user/${userId}`);
      const data = response.data;
      if (Array.isArray(data) && data.length > 0) {
        cacheService.set(consultationsCacheKey(userId), data, CACHE_TTL);
      }
      return data;
    } catch (error) {
      logger.warn('consultation_fetch_failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown',
      });
      
      return consultationService.getCachedConsultations(userId);
    }
  },
  getCachedConsultations(userId: string): ConsultationData[] {
    const cached = cacheService.get<ConsultationData[]>(consultationsCacheKey(userId));
    if (cached) {
      logger.info('consultations_from_cache', { userId, count: cached.length });
    }
    return cached ?? [];
  },
  async saveConsultation(data: ConsultationData): Promise<any> {
    try {
      const response = await apiClient.post('/consultations/save', data);
      consultationService._updateLocalCache(data.userId, (list) => {
        const idx = list.findIndex((c: any) => c.id === data.id);
        if (idx >= 0) {
          list[idx] = data;
        } else {
          list.unshift(data);
        }
        return list;
      });

      return response.data;
    } catch (error) {
      logger.error('consultation_save_failed', {
        id: data.id,
        error: error instanceof Error ? error.message : 'Unknown',
      });
      consultationService._updateLocalCache(data.userId, (list) => {
        const idx = list.findIndex((c: any) => c.id === data.id);
        if (idx >= 0) {
          list[idx] = data;
        } else {
          list.unshift(data);
        }
        return list;
      });
      offlineQueue.enqueue({
        method: 'POST',
        url: `${BACKEND_URL}/api/consultations/save`,
        data,
      });

      throw error;
    }
  },
  async getConsultation(id: string): Promise<ConsultationData | null> {
    try {
      const response = await apiClient.get(`/consultations/${id}`);
      return response.data;
    } catch (error) {
      logger.error('consultation_get_failed', { id });
      return null;
    }
  },
  async deleteConsultation(id: string, userId: string): Promise<any> {
    try {
      const response = await apiClient.delete(`/consultations/${id}`);
      
      consultationService._updateLocalCache(userId, (list) =>
        list.filter((c: any) => c.id !== id)
      );
      return response.data;
    } catch (error) {
      logger.error('consultation_delete_failed', { id });
      throw error;
    }
  },
  async getVoiceSession(consultationId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/voice/session/${consultationId}`);
      return response.data;
    } catch (error) {
      logger.error('voice_session_fetch_failed', { consultationId });
      return null;
    }
  },
  async startConsultation(userId: string, specialistType: string, email?: string, name?: string): Promise<any> {
    try {
      const response = await apiClient.postIdempotent('/consultations/start', {
        userId,
        specialistType,
        email,
        name,
      });
      return response.data;
    } catch (error) {
      logger.error('consultation_start_failed', {
        userId,
        specialistType,
        error: error instanceof Error ? error.message : 'Unknown',
      });
      throw error;
    }
  },
  _updateLocalCache(userId: string, updater: (list: any[]) => any[]): void {
    try {
      const existing = consultationService.getCachedConsultations(userId);
      const updated = updater([...existing]);
      cacheService.set(consultationsCacheKey(userId), updated, CACHE_TTL);
    } catch {
      
    }
  },
};
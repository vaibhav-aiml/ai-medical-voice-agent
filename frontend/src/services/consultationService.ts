import axios from 'axios';
import { API_URL } from '../config/api';

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

/**
 * Frontend consultation service.
 * Wraps all API calls to /api/consultations endpoints.
 * Uses localStorage as a write-through cache:
 *   - Reads from API first, falls back to localStorage
 *   - Writes to both API and localStorage
 */
export const consultationService = {
  /**
   * Save a consultation to the backend DB and localStorage cache.
   */
  async saveConsultation(data: ConsultationData): Promise<any> {
    try {
      const response = await axios.post(`${API_URL}/consultations/save`, data);
      // Write-through cache
      consultationService._updateLocalCache(data.userId, (list) => {
        const idx = list.findIndex((c: any) => c.id === data.id);
        if (idx >= 0) {
          list[idx] = data;
        } else {
          list.push(data);
        }
        return list;
      });
      return response.data;
    } catch (error) {
      // Still save to localStorage on API failure
      consultationService._updateLocalCache(data.userId, (list) => {
        const idx = list.findIndex((c: any) => c.id === data.id);
        if (idx >= 0) {
          list[idx] = data;
        } else {
          list.push(data);
        }
        return list;
      });
      console.error('Error saving consultation to API, saved to localStorage:', error);
      throw error;
    }
  },

  /**
   * Get user's consultations. Tries API first, falls back to localStorage.
   */
  async getUserConsultations(userId: string): Promise<ConsultationData[]> {
    try {
      const response = await axios.get(`${API_URL}/consultations/user/${userId}`);
      const data = response.data;
      // Update local cache with fresh data from API
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem(`consultations_${userId}`, JSON.stringify(data));
      }
      return data;
    } catch (error) {
      console.error('Error fetching from API, falling back to localStorage:', error);
      // Fall back to localStorage
      return consultationService._getFromLocalCache(userId);
    }
  },

  /**
   * Get a single consultation by ID.
   */
  async getConsultation(id: string): Promise<ConsultationData | null> {
    try {
      const response = await axios.get(`${API_URL}/consultations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching consultation:', error);
      return null;
    }
  },

  /**
   * Delete a consultation.
   */
  async deleteConsultation(id: string, userId: string): Promise<any> {
    try {
      const response = await axios.delete(`${API_URL}/consultations/${id}`);
      // Remove from cache
      consultationService._updateLocalCache(userId, (list) =>
        list.filter((c: any) => c.id !== id)
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting consultation:', error);
      throw error;
    }
  },

  /**
   * Get voice session dialogue transcript for a consultation.
   */
  async getVoiceSession(consultationId: string): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}/voice/session/${consultationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching voice session transcript:', error);
      return null;
    }
  },

  // ---- Private helpers for localStorage cache ----

  _getFromLocalCache(userId: string): ConsultationData[] {
    try {
      const saved = localStorage.getItem(`consultations_${userId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  _updateLocalCache(userId: string, updater: (list: any[]) => any[]): void {
    try {
      const existing = consultationService._getFromLocalCache(userId);
      const updated = updater(existing);
      localStorage.setItem(`consultations_${userId}`, JSON.stringify(updated));
    } catch {
      // localStorage failure is non-critical
    }
  },
};

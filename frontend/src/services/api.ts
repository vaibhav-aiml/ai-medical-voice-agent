import { apiClient } from './apiClient';

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

export const api = {
  // Save consultation to database
  async saveConsultation(data: ConsultationData) {
    try {
      const response = await apiClient.post('/consultations/save', data);
      return response.data;
    } catch (error) {
      console.error('Error saving consultation:', error);
      throw error;
    }
  },

  // Get user's consultations from database (deduplicated + auto-retry)
  async getUserConsultations(userId: string) {
    try {
      const response = await apiClient.get(`/consultations/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching consultations:', error);
      return [];
    }
  },

  // Get single consultation by ID
  async getConsultation(id: string) {
    try {
      const response = await apiClient.get(`/consultations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching consultation:', error);
      return null;
    }
  },

  // Delete consultation
  async deleteConsultation(id: string) {
    try {
      const response = await apiClient.delete(`/consultations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting consultation:', error);
      throw error;
    }
  }
};
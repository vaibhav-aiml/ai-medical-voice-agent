export interface AnalyticsData {
  totalPatients: number;
  totalConsultations: number;
  averageRating: number;
  patientSatisfaction: number;
  consultationTrends: {
    daily: { date: string; count: number }[];
    weekly: { week: string; count: number }[];
    monthly: { month: string; count: number }[];
  };
  commonSymptoms: { symptom: string; count: number; percentage: number }[];
  specialistDistribution: { specialist: string; count: number; percentage: number }[];
  patientDemographics: {
    ageGroups: { group: string; count: number; percentage: number }[];
    genderDistribution: { gender: string; count: number; percentage: number }[];
  };
  recentConsultations: {
    id: string;
    patientName: string;
    specialistType: string;
    date: Date;
    symptoms: string;
    duration: number;
    rating?: number;
  }[];
  peakHours: { hour: number; count: number }[];
  topDoctors: { name: string; consultations: number; rating: number }[];
}

class AnalyticsService {
  
  generateAnalytics(consultations: any[], ratings?: any): AnalyticsData {
    // Calculate trends
    const consultationTrends = this.calculateTrends(consultations);
    
    // Extract common symptoms
    const commonSymptoms = this.extractCommonSymptoms(consultations);
    
    // Specialist distribution
    const specialistDistribution = this.getSpecialistDistribution(consultations);
    
    // Patient demographics
    const patientDemographics = this.getPatientDemographics(consultations);
    
    // Recent consultations
    const recentConsultations = this.getRecentConsultations(consultations);
    
    // Peak hours
    const peakHours = this.getPeakHours(consultations);
    
    // Top doctors (specialists)
    const topDoctors = this.getTopDoctors(consultations, ratings);
    
    // Calculate average rating
    let avgRating = 0;
    if (ratings) {
      const ratingValues = Object.values(ratings) as any[];
      if (ratingValues.length > 0) {
        avgRating = ratingValues.reduce((sum, r) => sum + r.rating, 0) / ratingValues.length;
      }
    }
    
    return {
      totalPatients: this.getUniquePatientCount(consultations),
      totalConsultations: consultations.length,
      averageRating: avgRating,
      patientSatisfaction: avgRating * 20, // Convert 5-star to percentage
      consultationTrends,
      commonSymptoms,
      specialistDistribution,
      patientDemographics,
      recentConsultations,
      peakHours,
      topDoctors,
    };
  }
  
  private getUniquePatientCount(consultations: any[]): number {
    const uniquePatients = new Set(consultations.map(c => c.userId || c.patientId));
    return uniquePatients.size;
  }
  
  private calculateTrends(consultations: any[]): AnalyticsData['consultationTrends'] {
    const dailyMap = new Map<string, number>();
    const weeklyMap = new Map<string, number>();
    const monthlyMap = new Map<string, number>();
    
    const now = new Date();
    const last30Days = new Date(now);
    last30Days.setDate(now.getDate() - 30);
    
    consultations.forEach(consultation => {
      const date = new Date(consultation.startedAt || consultation.date);
      if (date < last30Days) return;
      
      // Daily
      const dayKey = date.toISOString().split('T')[0];
      dailyMap.set(dayKey, (dailyMap.get(dayKey) || 0) + 1);
      
      // Weekly
      const weekYear = this.getWeekNumber(date);
      const weekKey = `${date.getFullYear()}-W${weekYear}`;
      weeklyMap.set(weekKey, (weeklyMap.get(weekKey) || 0) + 1);
      
      // Monthly
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + 1);
    });
    
    return {
      daily: Array.from(dailyMap.entries()).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date)),
      weekly: Array.from(weeklyMap.entries()).map(([week, count]) => ({ week, count })).slice(-12),
      monthly: Array.from(monthlyMap.entries()).map(([month, count]) => ({ month, count })).slice(-6),
    };
  }
  
  private getWeekNumber(date: Date): number {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  }
  
  private extractCommonSymptoms(consultations: any[]): { symptom: string; count: number; percentage: number }[] {
    const symptomCount = new Map<string, number>();
    const symptomKeywords = [
      'headache', 'fever', 'cough', 'pain', 'fatigue', 'nausea', 
      'dizziness', 'shortness of breath', 'chest pain', 'sore throat',
      'vomiting', 'diarrhea', 'rash', 'swelling', 'back pain',
      'joint pain', 'cold', 'flu', 'migraine', 'stomach ache'
    ];
    
    consultations.forEach(consultation => {
      const symptoms = (consultation.symptoms || '').toLowerCase();
      for (const keyword of symptomKeywords) {
        if (symptoms.includes(keyword)) {
          symptomCount.set(keyword, (symptomCount.get(keyword) || 0) + 1);
        }
      }
    });
    
    const total = Array.from(symptomCount.values()).reduce((a, b) => a + b, 0) || 1;
    
    return Array.from(symptomCount.entries())
      .map(([symptom, count]) => ({ symptom, count, percentage: (count / total) * 100 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }
  
  private getSpecialistDistribution(consultations: any[]): { specialist: string; count: number; percentage: number }[] {
    const specialistCount = new Map<string, number>();
    
    consultations.forEach(consultation => {
      const specialist = consultation.specialistType || 'general';
      specialistCount.set(specialist, (specialistCount.get(specialist) || 0) + 1);
    });
    
    const total = consultations.length || 1;
    
    return Array.from(specialistCount.entries())
      .map(([specialist, count]) => ({ specialist, count, percentage: (count / total) * 100 }))
      .sort((a, b) => b.count - a.count);
  }
  
  private getPatientDemographics(consultations: any[]): AnalyticsData['patientDemographics'] {
    const ageGroups = [
      { range: '0-18', min: 0, max: 18, count: 0 },
      { range: '19-30', min: 19, max: 30, count: 0 },
      { range: '31-45', min: 31, max: 45, count: 0 },
      { range: '46-60', min: 46, max: 60, count: 0 },
      { range: '60+', min: 61, max: 200, count: 0 },
    ];
    
    const genderCount = new Map<string, number>();
    const uniquePatients = new Map<string, { age?: number; gender?: string }>();
    
    consultations.forEach(consultation => {
      const patientId = consultation.userId || consultation.patientId;
      if (!uniquePatients.has(patientId)) {
        uniquePatients.set(patientId, {
          age: consultation.patientAge,
          gender: consultation.patientGender,
        });
      }
    });
    
    for (const patient of uniquePatients.values()) {
      if (patient.age) {
        const group = ageGroups.find(g => patient.age! >= g.min && patient.age! <= g.max);
        if (group) group.count++;
      }
      if (patient.gender) {
        genderCount.set(patient.gender, (genderCount.get(patient.gender) || 0) + 1);
      }
    }
    
    const totalPatients = uniquePatients.size || 1;
    
    return {
      ageGroups: ageGroups.map(g => ({ group: g.range, count: g.count, percentage: (g.count / totalPatients) * 100 })),
      genderDistribution: Array.from(genderCount.entries()).map(([gender, count]) => ({ gender, count, percentage: (count / totalPatients) * 100 })),
    };
  }
  
  private getRecentConsultations(consultations: any[], limit: number = 10): AnalyticsData['recentConsultations'] {
    return consultations
      .sort((a, b) => new Date(b.startedAt || b.date).getTime() - new Date(a.startedAt || a.date).getTime())
      .slice(0, limit)
      .map(c => ({
        id: c.id,
        patientName: c.patientName || 'Anonymous',
        specialistType: c.specialistType || 'general',
        date: c.startedAt || c.date,
        symptoms: (c.symptoms || '').substring(0, 100),
        duration: c.duration || 0,
        rating: c.rating,
      }));
  }
  
  private getPeakHours(consultations: any[]): { hour: number; count: number }[] {
    const hourCount = new Array(24).fill(0);
    
    consultations.forEach(consultation => {
      const date = new Date(consultation.startedAt || consultation.date);
      const hour = date.getHours();
      hourCount[hour]++;
    });
    
    return hourCount.map((count, hour) => ({ hour, count })).filter(h => h.count > 0);
  }
  
  private getTopDoctors(consultations: any[], ratings?: any): { name: string; consultations: number; rating: number }[] {
    const doctorStats = new Map<string, { consultations: number; totalRating: number; count: number }>();
    
    consultations.forEach(consultation => {
      const doctorName = consultation.specialistName || `${consultation.specialistType} Specialist`;
      const stats = doctorStats.get(doctorName) || { consultations: 0, totalRating: 0, count: 0 };
      stats.consultations++;
      if (ratings && ratings[consultation.id]) {
        stats.totalRating += ratings[consultation.id].rating;
        stats.count++;
      }
      doctorStats.set(doctorName, stats);
    });
    
    return Array.from(doctorStats.entries())
      .map(([name, stats]) => ({
        name,
        consultations: stats.consultations,
        rating: stats.count > 0 ? stats.totalRating / stats.count : 0,
      }))
      .sort((a, b) => b.consultations - a.consultations)
      .slice(0, 5);
  }
}

export const analyticsService = new AnalyticsService();
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock Clerk express middleware to inject controlled test identities
vi.mock('../../src/middleware/auth', () => ({
  requireAuth: (req: any, res: any, next: any) => {
    const headerUser = req.headers['x-test-user-id'];
    if (headerUser === 'unauthenticated') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    const testUserId = headerUser || 'test_owner_123';
    req.auth = { userId: testUserId };
    req.userId = testUserId;
    next();
  },
  optionalAuth: (req: any, res: any, next: any) => {
    next();
  }
}));

import clinicRouter from '../../src/routes/clinic.routes';
import { requireAuth } from '../../src/middleware/auth';

describe('Clinic Routes Integration & RBAC Tests', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/clinic', requireAuth, clinicRouter);
  });

  it('should create a clinic with ownerId set from authenticated user', async () => {
    const res = await request(app)
      .post('/api/clinic/create')
      .set('x-test-user-id', 'owner_user_1')
      .send({
        name: 'Apollo Heart Clinic',
        subdomain: 'apolloheart',
        primaryColor: '#3b82f6',
        secondaryColor: '#10b981',
        accentColor: '#8b5cf6',
        theme: 'light',
        contactEmail: 'contact@apollo.com',
        contactPhone: '9876543210',
        address: '123 Health Ave',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        subscriptionTier: 'pro'
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.ownerId).toBe('owner_user_1');
  });

  it('should allow owner to add, update, and delete doctors', async () => {
    // 1. Create clinic
    const createRes = await request(app)
      .post('/api/clinic/create')
      .set('x-test-user-id', 'doc_owner_2')
      .send({
        name: 'City Care Clinic',
        subdomain: 'citycare',
        primaryColor: '#3b82f6',
        secondaryColor: '#10b981',
        accentColor: '#8b5cf6',
        theme: 'light',
        contactEmail: 'city@care.com',
        contactPhone: '9876543210',
        address: 'MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
        subscriptionTier: 'basic'
      })
      .expect(200);

    const clinicId = createRes.body.data.id;

    // 2. Add doctor
    const addDocRes = await request(app)
      .post(`/api/clinic/${clinicId}/doctors`)
      .set('x-test-user-id', 'doc_owner_2')
      .send({
        userId: 'user_doc_101',
        name: 'Dr. Ramesh Sharma',
        specialization: 'Cardiologist',
        qualifications: ['MBBS', 'MD'],
        experience: 12,
        consultationFee: 800,
        isAvailable: true
      })
      .expect(200);

    expect(addDocRes.body.success).toBe(true);
    const doctorId = addDocRes.body.data.id;

    // 3. Update doctor
    const updateDocRes = await request(app)
      .put(`/api/clinic/${clinicId}/doctors/${doctorId}`)
      .set('x-test-user-id', 'doc_owner_2')
      .send({
        consultationFee: 1000,
        experience: 13
      })
      .expect(200);

    expect(updateDocRes.body.success).toBe(true);
    expect(updateDocRes.body.data.consultationFee).toBe(1000);
    expect(updateDocRes.body.data.experience).toBe(13);

    // 4. Delete doctor
    const deleteDocRes = await request(app)
      .delete(`/api/clinic/${clinicId}/doctors/${doctorId}`)
      .set('x-test-user-id', 'doc_owner_2')
      .expect(200);

    expect(deleteDocRes.body.success).toBe(true);

    // Verify doctor is no longer in clinic
    const getDocsRes = await request(app)
      .get(`/api/clinic/${clinicId}/doctors`)
      .set('x-test-user-id', 'doc_owner_2')
      .expect(200);

    expect(getDocsRes.body.data.find((d: any) => d.id === doctorId)).toBeUndefined();
  });

  it('should enforce multi-tenant RBAC (reject unauthorized user with 403)', async () => {
    // 1. Create clinic by owner_alpha
    const createRes = await request(app)
      .post('/api/clinic/create')
      .set('x-test-user-id', 'owner_alpha')
      .send({
        name: 'Alpha Clinic',
        subdomain: 'alphaclinic',
        primaryColor: '#3b82f6',
        secondaryColor: '#10b981',
        accentColor: '#8b5cf6',
        theme: 'light',
        contactEmail: 'alpha@clinic.com',
        contactPhone: '9876543210',
        address: 'Alpha St',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        subscriptionTier: 'pro'
      })
      .expect(200);

    const clinicId = createRes.body.data.id;

    // 2. Malicious user attempts to add doctor to Alpha Clinic
    const maliciousAdd = await request(app)
      .post(`/api/clinic/${clinicId}/doctors`)
      .set('x-test-user-id', 'attacker_beta')
      .send({
        userId: 'attacker_doc',
        name: 'Dr. Fake',
        specialization: 'None',
        qualifications: [],
        experience: 0,
        consultationFee: 0,
        isAvailable: false
      })
      .expect(403);

    expect(maliciousAdd.body.success).toBe(false);
    expect(maliciousAdd.body.error).toContain('Forbidden');
  });

  it('should perform non-destructive idempotent upsert on doctors sync', async () => {
    // 1. Create clinic
    const createRes = await request(app)
      .post('/api/clinic/create')
      .set('x-test-user-id', 'sync_owner_3')
      .send({
        name: 'Sync Medical',
        subdomain: 'syncmed',
        primaryColor: '#3b82f6',
        secondaryColor: '#10b981',
        accentColor: '#8b5cf6',
        theme: 'light',
        contactEmail: 'sync@med.com',
        contactPhone: '9876543210',
        address: 'Tech Park',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500081',
        subscriptionTier: 'enterprise'
      })
      .expect(200);

    const clinicId = createRes.body.data.id;

    // 2. Add Doctor 1
    const doc1Res = await request(app)
      .post(`/api/clinic/${clinicId}/doctors`)
      .set('x-test-user-id', 'sync_owner_3')
      .send({
        userId: 'doc_user_1',
        name: 'Dr. One',
        specialization: 'General',
        qualifications: ['MBBS'],
        experience: 5,
        consultationFee: 500,
        isAvailable: true
      })
      .expect(200);

    const doc1Id = doc1Res.body.data.id;

    // 3. Sync from an offline device that only knows Doctor 2
    // It should add Doctor 2 AND PRESERVE Doctor 1 (no wipe-out)
    const syncRes = await request(app)
      .post(`/api/clinic/${clinicId}/doctors/sync`)
      .set('x-test-user-id', 'sync_owner_3')
      .send({
        doctors: [
          {
            id: 'doc_new_2',
            name: 'Dr. Two',
            specialization: 'Pediatrics',
            qualifications: ['MBBS', 'DCH'],
            experience: 8,
            consultationFee: 700,
            isAvailable: true
          }
        ]
      })
      .expect(200);

    expect(syncRes.body.success).toBe(true);

    // Verify both Doctor 1 and Doctor 2 exist
    const getDocsRes = await request(app)
      .get(`/api/clinic/${clinicId}/doctors`)
      .set('x-test-user-id', 'sync_owner_3')
      .expect(200);

    const doctorIds = getDocsRes.body.data.map((d: any) => d.id);
    expect(doctorIds).toContain(doc1Id);
    expect(doctorIds).toContain('doc_new_2');
  });

  it('should update appointment status via PUT and PATCH endpoints', async () => {
    // 1. Create clinic and appointment
    const createRes = await request(app)
      .post('/api/clinic/create')
      .set('x-test-user-id', 'apt_owner_4')
      .send({
        name: 'Appointment Care',
        subdomain: 'aptcare',
        primaryColor: '#3b82f6',
        secondaryColor: '#10b981',
        accentColor: '#8b5cf6',
        theme: 'light',
        contactEmail: 'apt@care.com',
        contactPhone: '9876543210',
        address: 'Apt Road',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001',
        subscriptionTier: 'pro'
      })
      .expect(200);

    const clinicId = createRes.body.data.id;

    const aptRes = await request(app)
      .post(`/api/clinic/${clinicId}/appointments`)
      .set('x-test-user-id', 'apt_owner_4')
      .send({
        doctorId: 'doc_99',
        patientId: 'patient_88',
        date: new Date().toISOString(),
        time: '10:00 AM',
        duration: 30,
        status: 'pending',
        type: 'consultation'
      })
      .expect(200);

    const aptId = aptRes.body.data.id;

    // 2. Update status via PUT /:clinicId/appointments/:id
    const putRes = await request(app)
      .put(`/api/clinic/${clinicId}/appointments/${aptId}`)
      .set('x-test-user-id', 'apt_owner_4')
      .send({ status: 'confirmed' })
      .expect(200);

    expect(putRes.body.success).toBe(true);

    // 3. Update status via PATCH /appointments/:appointmentId/status
    const patchRes = await request(app)
      .patch(`/api/clinic/appointments/${aptId}/status`)
      .set('x-test-user-id', 'apt_owner_4')
      .send({ status: 'completed' })
      .expect(200);

    expect(patchRes.body.success).toBe(true);
  });

  it('should return 404 for non-existent clinic on mutation', async () => {
    const res = await request(app)
      .put('/api/clinic/non_existent_clinic_123/doctors/doc_1')
      .set('x-test-user-id', 'any_user')
      .send({ consultationFee: 500 })
      .expect(404);

    expect(res.body.error).toBe('Clinic not found');
  });

  describe('Remediated Clinic Route RBAC & Tenant Isolation Tests', () => {
    let testClinicId: string;
    let testAppointmentId: string;
    const ownerUserId = 'clinic_owner_verified';
    const attackerUserId = 'malicious_cross_tenant_user';

    beforeEach(async () => {
      // Create a clinic owned by ownerUserId
      const createRes = await request(app)
        .post('/api/clinic/create')
        .set('x-test-user-id', ownerUserId)
        .send({
          name: 'Secure MultiTenant Clinic',
          subdomain: `secure-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          primaryColor: '#3b82f6',
          secondaryColor: '#10b981',
          accentColor: '#8b5cf6',
          theme: 'light',
          contactEmail: 'secure@clinic.com',
          contactPhone: '9876543210',
          address: 'Secure Road',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560001',
          subscriptionTier: 'pro'
        })
        .expect(200);

      testClinicId = createRes.body.data.id;

      // Add a patient
      await request(app)
        .post(`/api/clinic/${testClinicId}/patients`)
        .set('x-test-user-id', ownerUserId)
        .send({
          name: 'Jane Doe',
          phone: '9876543210',
          age: 30,
          gender: 'female'
        })
        .expect(200);

      // Add an appointment
      const aptRes = await request(app)
        .post(`/api/clinic/${testClinicId}/appointments`)
        .set('x-test-user-id', ownerUserId)
        .send({
          doctorId: 'doc_1',
          patientId: 'patient_1',
          date: new Date().toISOString(),
          time: '11:00 AM',
          duration: 30,
          status: 'pending',
          type: 'consultation'
        })
        .expect(200);

      testAppointmentId = aptRes.body.data.id;

      // Configure settings and branding
      await request(app)
        .put(`/api/clinic/${testClinicId}/settings`)
        .set('x-test-user-id', ownerUserId)
        .send({ timezone: 'Asia/Kolkata' })
        .expect(200);

      await request(app)
        .put(`/api/clinic/${testClinicId}/branding`)
        .set('x-test-user-id', ownerUserId)
        .send({ primaryColor: '#3b82f6' })
        .expect(200);
    });

    it('1. GET /:clinicId/patients: rejects non-owner with 403, allows owner with 200', async () => {
      // Attacker gets 403
      const attackerRes = await request(app)
        .get(`/api/clinic/${testClinicId}/patients`)
        .set('x-test-user-id', attackerUserId)
        .expect(403);

      expect(attackerRes.body.success).toBe(false);
      expect(attackerRes.body.error).toContain('Forbidden');

      // Unauthenticated gets 401
      await request(app)
        .get(`/api/clinic/${testClinicId}/patients`)
        .set('x-test-user-id', 'unauthenticated')
        .expect(401);

      // Owner gets 200 and PHI data
      const ownerRes = await request(app)
        .get(`/api/clinic/${testClinicId}/patients`)
        .set('x-test-user-id', ownerUserId)
        .expect(200);

      expect(ownerRes.body.success).toBe(true);
      expect(Array.isArray(ownerRes.body.data)).toBe(true);
      expect(ownerRes.body.data.length).toBeGreaterThan(0);
      expect(ownerRes.body.data[0].name).toBe('Jane Doe');
    });

    it('2. GET /:clinicId/appointments: rejects non-owner with 403, allows owner with 200', async () => {
      const attackerRes = await request(app)
        .get(`/api/clinic/${testClinicId}/appointments`)
        .set('x-test-user-id', attackerUserId)
        .expect(403);

      expect(attackerRes.body.success).toBe(false);

      const ownerRes = await request(app)
        .get(`/api/clinic/${testClinicId}/appointments`)
        .set('x-test-user-id', ownerUserId)
        .expect(200);

      expect(ownerRes.body.success).toBe(true);
      expect(Array.isArray(ownerRes.body.data)).toBe(true);
      expect(ownerRes.body.data.length).toBeGreaterThan(0);
    });

    it('3. POST /:clinicId/appointments: rejects non-owner with 403, allows owner with 200', async () => {
      const attackerRes = await request(app)
        .post(`/api/clinic/${testClinicId}/appointments`)
        .set('x-test-user-id', attackerUserId)
        .send({
          doctorId: 'doc_1',
          patientId: 'patient_2',
          date: new Date().toISOString(),
          time: '02:00 PM',
          duration: 15,
          status: 'pending',
          type: 'followup'
        })
        .expect(403);

      expect(attackerRes.body.success).toBe(false);

      const ownerRes = await request(app)
        .post(`/api/clinic/${testClinicId}/appointments`)
        .set('x-test-user-id', ownerUserId)
        .send({
          doctorId: 'doc_1',
          patientId: 'patient_2',
          date: new Date().toISOString(),
          time: '02:00 PM',
          duration: 15,
          status: 'pending',
          type: 'followup'
        })
        .expect(200);

      expect(ownerRes.body.success).toBe(true);
      expect(ownerRes.body.data.id).toBeDefined();
    });

    it('4. GET /:clinicId/doctors: rejects non-owner with 403, allows owner with 200', async () => {
      const attackerRes = await request(app)
        .get(`/api/clinic/${testClinicId}/doctors`)
        .set('x-test-user-id', attackerUserId)
        .expect(403);

      expect(attackerRes.body.success).toBe(false);

      const ownerRes = await request(app)
        .get(`/api/clinic/${testClinicId}/doctors`)
        .set('x-test-user-id', ownerUserId)
        .expect(200);

      expect(ownerRes.body.success).toBe(true);
    });

    it('5. GET /:clinicId/settings: rejects non-owner with 403, allows owner with 200', async () => {
      const attackerRes = await request(app)
        .get(`/api/clinic/${testClinicId}/settings`)
        .set('x-test-user-id', attackerUserId)
        .expect(403);

      expect(attackerRes.body.success).toBe(false);

      const ownerRes = await request(app)
        .get(`/api/clinic/${testClinicId}/settings`)
        .set('x-test-user-id', ownerUserId)
        .expect(200);

      expect(ownerRes.body.success).toBe(true);
      expect(ownerRes.body.data.timezone).toBe('Asia/Kolkata');
    });

    it('6. GET /:clinicId/branding: rejects non-owner with 403, allows owner with 200', async () => {
      const attackerRes = await request(app)
        .get(`/api/clinic/${testClinicId}/branding`)
        .set('x-test-user-id', attackerUserId)
        .expect(403);

      expect(attackerRes.body.success).toBe(false);

      const ownerRes = await request(app)
        .get(`/api/clinic/${testClinicId}/branding`)
        .set('x-test-user-id', ownerUserId)
        .expect(200);

      expect(ownerRes.body.success).toBe(true);
      expect(ownerRes.body.data.primaryColor).toBe('#3b82f6');
    });

    it('7. GET /:clinicId/stats: rejects non-owner with 403, allows owner with 200', async () => {
      const attackerRes = await request(app)
        .get(`/api/clinic/${testClinicId}/stats`)
        .set('x-test-user-id', attackerUserId)
        .expect(403);

      expect(attackerRes.body.success).toBe(false);

      const ownerRes = await request(app)
        .get(`/api/clinic/${testClinicId}/stats`)
        .set('x-test-user-id', ownerUserId)
        .expect(200);

      expect(ownerRes.body.success).toBe(true);
      expect(ownerRes.body.data.totalAppointments).toBeGreaterThan(0);
    });

    it('8. PATCH /appointments/:appointmentId/status: checks 404 before 403, rejects non-owner with 403, allows owner with 200', async () => {
      // Bogus appointment ID returns 404 (does not leak ownership or return 403)
      const notFoundRes = await request(app)
        .patch('/api/clinic/appointments/bogus_appointment_id_999/status')
        .set('x-test-user-id', attackerUserId)
        .send({ status: 'completed' })
        .expect(404);

      expect(notFoundRes.body.success).toBe(false);
      expect(notFoundRes.body.error).toBe('Appointment not found');

      // Valid appointment ID but attacker user -> 403
      const attackerRes = await request(app)
        .patch(`/api/clinic/appointments/${testAppointmentId}/status`)
        .set('x-test-user-id', attackerUserId)
        .send({ status: 'completed' })
        .expect(403);

      expect(attackerRes.body.success).toBe(false);
      expect(attackerRes.body.error).toContain('Forbidden');

      // Valid appointment ID and owner user -> 200
      const ownerRes = await request(app)
        .patch(`/api/clinic/appointments/${testAppointmentId}/status`)
        .set('x-test-user-id', ownerUserId)
        .send({ status: 'completed' })
        .expect(200);

      expect(ownerRes.body.success).toBe(true);
    });
  });
});

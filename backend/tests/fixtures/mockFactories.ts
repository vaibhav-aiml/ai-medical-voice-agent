export interface MockUser {
  id: string;
  clerkId: string;
  email: string;
  fullName: string;
}

export interface MockConsultation {
  id: string;
  userId: string;
  doctorSpecialist: string;
  status: string;
  symptoms: string;
}

export function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
  const id = `user-${Math.random().toString(36).substring(2, 9)}`;
  return {
    id,
    clerkId: `clerk_${id}`,
    email: `test-${id}@example.com`,
    fullName: 'Test Patient',
    ...overrides
  };
}

export function createMockConsultation(overrides: Partial<MockConsultation> = {}): MockConsultation {
  const id = `consult-${Math.random().toString(36).substring(2, 9)}`;
  return {
    id,
    userId: 'user-default-id',
    doctorSpecialist: 'General Physician',
    status: 'active',
    symptoms: 'Mild fever and dry cough',
    ...overrides
  };
}

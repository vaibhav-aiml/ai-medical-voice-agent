import { describe, it, expect } from 'vitest';
import { getSystemPrompt, getFallbackResponse } from '../../src/sockets/helpers/prompts';

describe('Prompts & Clinical Telemedicine Protocols', () => {
  it('should generate specific clinical guidelines in system prompts', () => {
    const generalPrompt = getSystemPrompt('general');
    expect(generalPrompt).toContain('CLINICAL CONSULTATION RULES');
    expect(generalPrompt).toContain('HIGHLY SPECIFIC AND MEANINGFUL');
    expect(generalPrompt).toContain('VOICE AND SPEECH FORMATTING INSTRUCTION');

    const orthoPrompt = getSystemPrompt('orthopedic');
    expect(orthoPrompt).toContain('Orthopedic and Sports Medicine Specialist AI');
    expect(orthoPrompt).toContain('Ibuprofen 400 to 600 milligrams');
  });

  it('should generate meaningful targeted fallback for lifting/workout injuries', () => {
    const response = getFallbackResponse(
      'should i go for some medicines as i have done heavy deadlifts i think that is why i am having pain',
      'general'
    );
    expect(response).toContain('lumbar muscle strain or minor joint irritation');
    expect(response).toContain('ibuprofen 400 milligrams taken with food');
    expect(response).toContain('pain radiating down your leg');
    expect(response).not.toContain('cough');
    expect(response).not.toContain('guaifenesin');
  });

  it('should generate structured medication fallback for general pain and fever', () => {
    const response = getFallbackResponse('what medicine should i take for my fever and headache', 'general');
    expect(response).toContain('Option one is acetaminophen');
    expect(response).toContain('Option two is ibuprofen');
    expect(response).toContain('do not take both medications together');
  });
});

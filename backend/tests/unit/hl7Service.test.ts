import { describe, it, expect } from 'vitest';
import { HL7Service } from '../../src/services/hl7Service';

describe('HL7Service Unit Tests', () => {
  const sampleADT = 
    'MSH|^~\\&|SENDING_APP|SENDING_FAC|RECEIVING_APP|RECEIVING_FAC|20260714180000||ADT^A08|MSG_CTRL_001|P|2.4\r' +
    'PID|1||PAT_123||DOE^JOHN||19800520|M|||||john.doe@example.com\r' +
    'PV1|1|O|CLINIC||||||||||||||||VISIT_999';

  describe('parse', () => {
    it('should correctly parse segments and fields', () => {
      const parsed = HL7Service.parse(sampleADT);
      expect(parsed.segments.length).toBe(3);
      
      const msh = parsed.segments[0];
      expect(msh.name).toBe('MSH');
      expect(msh.fields[0]).toBe('|');
      expect(msh.fields[1]).toBe('^~\\&');
      
      const pid = parsed.segments[1];
      expect(pid.name).toBe('PID');
      expect(pid.fields[2]).toBe('PAT_123'); // PID-3
      expect(pid.fields[4]).toBe('DOE^JOHN');  // PID-5
      expect(pid.fields[12]).toBe('john.doe@example.com'); // PID-13
    });
  });

  describe('generate', () => {
    it('should generate a valid raw HL7 pipe-delimited string matching parse input', () => {
      const parsed = HL7Service.parse(sampleADT);
      const generated = HL7Service.generate(parsed);
      expect(generated).toContain('MSH|^~\\&|SENDING_APP|SENDING_FAC|RECEIVING_APP|RECEIVING_FAC|20260714180000||ADT^A08|MSG_CTRL_001|P|2.4');
      expect(generated).toContain('PID|1||PAT_123||DOE^JOHN||19800520|M|||||john.doe@example.com');
      expect(generated).toContain('PV1|1|O|CLINIC||||||||||||||||VISIT_999');
    });
  });

  describe('validate', () => {
    it('should return valid true for properly formatted MSH headers', () => {
      const parsed = HL7Service.parse(sampleADT);
      const result = HL7Service.validate(parsed);
      expect(result.valid).toBe(true);
    });

    it('should return false when MSH is missing', () => {
      const invalidHL7 = 'PID|1||PAT_123';
      const parsed = HL7Service.parse(invalidHL7);
      const result = HL7Service.validate(parsed);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Missing MSH segment at start of message');
    });

    it('should return false when Message Control ID is missing', () => {
      const invalidHL7 = 'MSH|^~\\&|SEND_APP|SEND_FAC|REC_APP|REC_FAC|2026||ADT^A08||P|2.4';
      const parsed = HL7Service.parse(invalidHL7);
      const result = HL7Service.validate(parsed);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('MSH-10 Message Control ID is missing');
    });
  });

  describe('generateACK', () => {
    it('should generate AA ACK successfully with matching control ID', () => {
      const parsed = HL7Service.parse(sampleADT);
      const msh = parsed.segments[0];
      const ack = HL7Service.generateACK(msh, 'AA', 'Reconciled successfully');

      expect(ack).toContain('MSH|^~\\&');
      expect(ack).toContain('ACK');
      expect(ack).toContain('MSA|AA|MSG_CTRL_001|Reconciled successfully');
    });

    it('should append ERR segment for AE failure codes', () => {
      const parsed = HL7Service.parse(sampleADT);
      const msh = parsed.segments[0];
      const ack = HL7Service.generateACK(msh, 'AE', 'Internal database failure');

      expect(ack).toContain('MSA|AE|MSG_CTRL_001|Internal database failure');
      expect(ack).toContain('ERR|||100|E|||Internal database failure');
    });
  });

  describe('generateORU', () => {
    it('should generate structured ORU messages containing observation fields', () => {
      const patient = {
        id: 'clerk-user-id',
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        gender: 'F',
        birthDate: '1990-10-15'
      };

      const consultation = {
        id: 'consult-777',
        symptoms: 'Cough and Sore Throat',
        notes: 'Advised rest and warm tea',
        startedAt: new Date()
      };

      const oru = HL7Service.generateORU(patient, consultation, 'Acute Pharyngitis');
      expect(oru).toContain('ORU^R01');
      expect(oru).toContain('PID|1||clerk-user-id||Doe^Jane||19901015|F|||||jane.doe@example.com');
      expect(oru).toContain('PV1|1|O|CLINIC||||||||||||||||consult-777');
      expect(oru).toContain('OBR|1|consult-777|EHR_consult-777|75325-1^Symptom history^LN');
      expect(oru).toContain('OBX|1|TX|SYMPTOMS^Patient Reported Symptoms||Cough and Sore Throat||||||F');
      expect(oru).toContain('OBX|2|TX|DIAGNOSIS^Clinical Assessment Diagnosis||Acute Pharyngitis||||||F');
    });
  });
});

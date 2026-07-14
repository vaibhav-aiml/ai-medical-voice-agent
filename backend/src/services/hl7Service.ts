import logger from '../utils/logger';

export interface HL7Segment {
  name: string;
  fields: string[];
}

export interface HL7MessageJSON {
  segments: HL7Segment[];
}

export class HL7Service {
  private static FIELD_DELIM = '|';
  private static COMP_DELIM = '^';
  private static SEG_DELIM = '\r';

  /**
   * Parse a raw HL7 message string into structured segments
   */
  static parse(raw: string): HL7MessageJSON {
    // Standardize segment delimiters (support \n and \r\n as fallbacks)
    const cleaned = raw.replace(/\r?\n/g, '\r');
    const lines = cleaned.split('\r').filter(line => line.trim().length > 0);
    const segments: HL7Segment[] = [];

    for (const line of lines) {
      const parts = line.split(this.FIELD_DELIM);
      const name = parts[0];
      
      let fields: string[];
      if (name === 'MSH') {
        // MSH is special: the first field delimiter is parts[1] (usually '^~\&'), which is index 1
        // So fields start with field delimiter and the remaining splits.
        fields = [this.FIELD_DELIM, ...parts.slice(1)];
      } else {
        fields = parts.slice(1);
      }
      
      segments.push({ name, fields });
    }

    return { segments };
  }

  /**
   * Generates a raw HL7 message string from segments
   */
  static generate(msg: HL7MessageJSON): string {
    const lines = msg.segments.map(seg => {
      if (seg.name === 'MSH') {
        // MSH-1 is the delimiter itself, so MSH fields are MSH|^~\&|...
        // seg.fields[0] is '|', seg.fields[1] is '^~\&'
        return 'MSH' + this.FIELD_DELIM + seg.fields.slice(1).join(this.FIELD_DELIM);
      }
      return [seg.name, ...seg.fields].join(this.FIELD_DELIM);
    });

    return lines.join(this.SEG_DELIM) + this.SEG_DELIM;
  }

  /**
   * Validates incoming HL7 message structures
   */
  static validate(msg: HL7MessageJSON): { valid: boolean; error?: string } {
    if (msg.segments.length === 0) {
      return { valid: false, error: 'Empty HL7 message' };
    }

    const msh = msg.segments[0];
    if (msh.name !== 'MSH') {
      return { valid: false, error: 'Missing MSH segment at start of message' };
    }

    // MSH fields:
    // fields[0] is '|'
    // fields[1] is '^~\&'
    // fields[8] is Message Type (e.g. ADT^A08 or ORU^R01)
    // fields[9] is Message Control ID
    const messageType = msh.fields[8] || '';
    const messageControlId = msh.fields[9] || '';

    if (!messageType) {
      return { valid: false, error: 'MSH-9 Message Type is missing' };
    }

    if (!messageControlId) {
      return { valid: false, error: 'MSH-10 Message Control ID is missing' };
    }

    return { valid: true };
  }

  /**
   * Helper to retrieve value from a specific field index (1-based, matching HL7 specs)
   */
  static getFieldValue(seg: HL7Segment, fieldIndex: number): string {
    if (seg.name === 'MSH') {
      // In MSH, fields[0] is '|', fields[1] is '^~\&' (MSH-2)
      // MSH-3 is fields[2]
      return seg.fields[fieldIndex - 1] || '';
    }
    // For other segments, fields[0] is field index 1
    return seg.fields[fieldIndex - 1] || '';
  }

  /**
   * Helper to retrieve value from a specific component index (1-based)
   */
  static getComponentValue(fieldVal: string, compIndex: number): string {
    const parts = fieldVal.split(this.COMP_DELIM);
    return parts[compIndex - 1] || '';
  }

  /**
   * Helper to build a field containing multiple components
   */
  static buildField(...components: string[]): string {
    return components.join(this.COMP_DELIM);
  }

  /**
   * Generates a standard HL7 ACK message
   */
  static generateACK(receivedMsh: HL7Segment, code: 'AA' | 'AE' | 'AR', errorMessage?: string): string {
    const controlId = this.getFieldValue(receivedMsh, 10);
    const sendingApp = this.getFieldValue(receivedMsh, 3);
    const sendingFacility = this.getFieldValue(receivedMsh, 4);
    const receivingApp = this.getFieldValue(receivedMsh, 5);
    const receivingFacility = this.getFieldValue(receivedMsh, 6);
    const version = this.getFieldValue(receivedMsh, 12) || '2.4';

    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').substring(0, 14);

    const ackMsh: HL7Segment = {
      name: 'MSH',
      fields: [
        '|',
        '^~\\&',
        receivingApp,
        receivingFacility,
        sendingApp,
        sendingFacility,
        timestamp,
        '',
        'ACK',
        `ACK_${Date.now()}`,
        'P',
        version
      ]
    };

    const msa: HL7Segment = {
      name: 'MSA',
      fields: [
        code,
        controlId,
        errorMessage || 'Message accepted successfully'
      ]
    };

    const segments = [ackMsh, msa];

    if (errorMessage && (code === 'AE' || code === 'AR')) {
      const err: HL7Segment = {
        name: 'ERR',
        fields: [
          '',
          '',
          '100', // Segment error
          'E',   // Error severity
          '',
          '',
          errorMessage
        ]
      };
      segments.push(err);
    }

    return this.generate({ segments });
  }

  /**
   * Generate an ORU^R01 Observation Result message for a completed consultation
   */
  static generateORU(
    patient: { id: string; name: string; email: string; gender?: string; birthDate?: string },
    consultation: { id: string; symptoms: string; notes: string; startedAt: Date },
    diagnosis: string
  ): string {
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').substring(0, 14);
    const controlId = `CTRL_${Date.now()}`;

    // 1. MSH
    const msh: HL7Segment = {
      name: 'MSH',
      fields: [
        '|',
        '^~\\&',
        'MediVoiceAI',
        'ClinicPlatform',
        'EHRSystem',
        'HospitalCenter',
        timestamp,
        '',
        'ORU^R01',
        controlId,
        'P',
        '2.4'
      ]
    };

    // 2. PID
    const nameParts = patient.name.split(' ');
    const familyName = nameParts[nameParts.length - 1] || 'Patient';
    const givenName = nameParts.slice(0, -1).join(' ') || 'MediVoice';

    const pid: HL7Segment = {
      name: 'PID',
      fields: [
        '1',
        '',
        patient.id, // PID-3 External patient identifier
        '',
        this.buildField(familyName, givenName), // PID-5 Name
        '',
        patient.birthDate ? patient.birthDate.replace(/-/g, '') : '19800101', // PID-7 DOB
        patient.gender ? patient.gender.toUpperCase().substring(0, 1) : 'U', // PID-8 Gender
        '',
        '',
        '', // PID-11 Address
        '',
        patient.email // PID-13 Email
      ]
    };

    // 3. PV1
    const pv1: HL7Segment = {
      name: 'PV1',
      fields: [
        '1',
        'O', // PV1-2 Outpatient
        'CLINIC',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        consultation.id // PV1-19 Visit number
      ]
    };

    // 4. OBR (Observation Request)
    const obr: HL7Segment = {
      name: 'OBR',
      fields: [
        '1',
        consultation.id,
        `EHR_${consultation.id}`,
        this.buildField('75325-1', 'Symptom history', 'LN'), // LOINC Code
        '',
        '',
        timestamp
      ]
    };

    // 5. OBX 1 - Symptoms
    const obxSymptoms: HL7Segment = {
      name: 'OBX',
      fields: [
        '1',
        'TX', // Value type text
        this.buildField('SYMPTOMS', 'Patient Reported Symptoms'),
        '',
        consultation.symptoms || 'None reported',
        '',
        '',
        '',
        '',
        '',
        'F' // Result status Final
      ]
    };

    // 6. OBX 2 - Diagnosis Assessment
    const obxDiagnosis: HL7Segment = {
      name: 'OBX',
      fields: [
        '2',
        'TX',
        this.buildField('DIAGNOSIS', 'Clinical Assessment Diagnosis'),
        '',
        diagnosis || 'Under medical evaluation',
        '',
        '',
        '',
        '',
        '',
        'F'
      ]
    };

    // 7. OBX 3 - Progress Notes
    const obxNotes: HL7Segment = {
      name: 'OBX',
      fields: [
        '3',
        'TX',
        this.buildField('NOTES', 'AI Clinical Consultation Notes'),
        '',
        consultation.notes || 'No notes saved.',
        '',
        '',
        '',
        '',
        '',
        'F'
      ]
    };

    return this.generate({
      segments: [msh, pid, pv1, obr, obxSymptoms, obxDiagnosis, obxNotes]
    });
  }
}

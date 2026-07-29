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
  static parse(raw: string): HL7MessageJSON {
    
    const cleaned = raw.replace(/\r?\n/g, '\r');
    const lines = cleaned.split('\r').filter(line => line.trim().length > 0);
    const segments: HL7Segment[] = [];

    for (const line of lines) {
      const parts = line.split(this.FIELD_DELIM);
      const name = parts[0];
      
      let fields: string[];
      if (name === 'MSH') {
        fields = [this.FIELD_DELIM, ...parts.slice(1)];
      } else {
        fields = parts.slice(1);
      }
      
      segments.push({ name, fields });
    }

    return { segments };
  }
  static generate(msg: HL7MessageJSON): string {
    const lines = msg.segments.map(seg => {
      if (seg.name === 'MSH') {
        return 'MSH' + this.FIELD_DELIM + seg.fields.slice(1).join(this.FIELD_DELIM);
      }
      return [seg.name, ...seg.fields].join(this.FIELD_DELIM);
    });

    return lines.join(this.SEG_DELIM) + this.SEG_DELIM;
  }
  static validate(msg: HL7MessageJSON): { valid: boolean; error?: string } {
    if (msg.segments.length === 0) {
      return { valid: false, error: 'Empty HL7 message' };
    }

    const msh = msg.segments[0];
    if (msh.name !== 'MSH') {
      return { valid: false, error: 'Missing MSH segment at start of message' };
    }
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
  static getFieldValue(seg: HL7Segment, fieldIndex: number): string {
    if (seg.name === 'MSH') {
      return seg.fields[fieldIndex - 1] || '';
    }
    
    return seg.fields[fieldIndex - 1] || '';
  }
  static getComponentValue(fieldVal: string, compIndex: number): string {
    const parts = fieldVal.split(this.COMP_DELIM);
    return parts[compIndex - 1] || '';
  }
  static buildField(...components: string[]): string {
    return components.join(this.COMP_DELIM);
  }
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
          '100', 
          'E',   
          '',
          '',
          errorMessage
        ]
      };
      segments.push(err);
    }

    return this.generate({ segments });
  }
  static generateORU(
    patient: { id: string; name: string; email: string; gender?: string; birthDate?: string },
    consultation: { id: string; symptoms: string; notes: string; startedAt: Date },
    diagnosis: string
  ): string {
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').substring(0, 14);
    const controlId = `CTRL_${Date.now()}`;
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
    const nameParts = patient.name.split(' ');
    const familyName = nameParts[nameParts.length - 1] || 'Patient';
    const givenName = nameParts.slice(0, -1).join(' ') || 'MediVoice';

    const pid: HL7Segment = {
      name: 'PID',
      fields: [
        '1',
        '',
        patient.id, 
        '',
        this.buildField(familyName, givenName), 
        '',
        patient.birthDate ? patient.birthDate.replace(/-/g, '') : '19800101', 
        patient.gender ? patient.gender.toUpperCase().substring(0, 1) : 'U', 
        '',
        '',
        '', 
        '',
        patient.email 
      ]
    };
    const pv1: HL7Segment = {
      name: 'PV1',
      fields: [
        '1',
        'O', 
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
        consultation.id 
      ]
    };
    const obr: HL7Segment = {
      name: 'OBR',
      fields: [
        '1',
        consultation.id,
        `EHR_${consultation.id}`,
        this.buildField('75325-1', 'Symptom history', 'LN'), 
        '',
        '',
        timestamp
      ]
    };
    const obxSymptoms: HL7Segment = {
      name: 'OBX',
      fields: [
        '1',
        'TX', 
        this.buildField('SYMPTOMS', 'Patient Reported Symptoms'),
        '',
        consultation.symptoms || 'None reported',
        '',
        '',
        '',
        '',
        '',
        'F' 
      ]
    };
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
interface EmailTemplateData {
  patientName: string;
  consultationId: string;
  specialistType: string;
  specialistName: string;
  date: Date;
  symptoms: string;
  diagnosis: string;
  recommendations: string[];
  medications: Array<{ name: string; dosage: string; frequency: string; duration: string }>;
}

export const generateEmailHTML = (data: EmailTemplateData): string => {
  const { patientName, consultationId, specialistType, specialistName, date, symptoms, diagnosis, recommendations, medications } = data;

  // Format medications list
  const medicationsHtml = medications.map(med => `
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;">${med.name}</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${med.dosage}</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${med.frequency}</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${med.duration}</td>
     </tr>
  `).join('');

  // Format recommendations list
  const recommendationsHtml = recommendations.map(rec => `<li>${rec}</li>`).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Medical Report - MediVoice AI</title>
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .header p {
          margin: 5px 0 0;
          opacity: 0.9;
        }
        .content {
          padding: 30px;
        }
        .section {
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }
        .section h3 {
          color: #667eea;
          margin-bottom: 15px;
          font-size: 18px;
        }
        .info-grid {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 10px;
          margin: 10px 0;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e9ecef;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .label {
          font-weight: 600;
          color: #555;
        }
        .value {
          color: #333;
        }
        .symptoms-box, .diagnosis-box {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 10px;
          margin: 10px 0;
          border-left: 4px solid #667eea;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        th {
          background: #667eea;
          color: white;
          padding: 10px;
          text-align: left;
          font-weight: 600;
        }
        td {
          padding: 10px;
          border-bottom: 1px solid #eee;
        }
        ul {
          margin: 10px 0;
          padding-left: 20px;
        }
        li {
          margin: 8px 0;
        }
        .footer {
          background: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #999;
        }
        .disclaimer {
          background: #fff3cd;
          padding: 12px;
          border-radius: 8px;
          margin-top: 20px;
          font-size: 11px;
          color: #856404;
          text-align: center;
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          margin-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏥 MediVoice AI</h1>
          <p>AI-Powered Medical Consultation Report</p>
        </div>
        
        <div class="content">
          <h2>Dear ${patientName},</h2>
          <p>Thank you for using <strong>MediVoice AI</strong>. Please find your medical consultation report below.</p>
          
          <div class="section">
            <h3>📋 Consultation Summary</h3>
            <div class="info-grid">
              <div class="info-row">
                <span class="label">Consultation ID:</span>
                <span class="value">${consultationId}</span>
              </div>
              <div class="info-row">
                <span class="label">Specialist:</span>
                <span class="value">${specialistName} (${specialistType})</span>
              </div>
              <div class="info-row">
                <span class="label">Date & Time:</span>
                <span class="value">${new Date(date).toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div class="section">
            <h3>🩺 Your Symptoms</h3>
            <div class="symptoms-box">
              <p>${symptoms}</p>
            </div>
          </div>
          
          <div class="section">
            <h3>📝 Diagnosis & Assessment</h3>
            <div class="diagnosis-box">
              <p>${diagnosis}</p>
            </div>
          </div>
          
          <div class="section">
            <h3>💊 Prescribed Medications</h3>
            <table>
              <thead>
                <tr><th>Medication</th><th>Dosage</th><th>Frequency</th><th>Duration</th></tr>
              </thead>
              <tbody>
                ${medicationsHtml || '<td><td colspan="4">No medications prescribed</td></tr>'}
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <h3>📋 Recommendations</h3>
            <ul>
              ${recommendationsHtml || '<li>Follow up with your healthcare provider</li>'}
            </ul>
          </div>
          
          <div class="disclaimer">
            ⚠️ <strong>Disclaimer:</strong> This is an AI-generated medical report. MediVoice AI is an informational tool, not a medical device. Always consult a qualified healthcare provider for medical advice, diagnosis, or treatment.
          </div>
        </div>
        
        <div class="footer">
          <p><strong>MediVoice AI</strong> - Your Personal AI Medical Assistant</p>
          <p>This email was sent to you as part of your medical consultation.</p>
          <p>© ${new Date().getFullYear()} MediVoice AI. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

console.log('📧 Email Service Initialized');
console.log('  User:', SMTP_USER);
console.log('  Pass:', SMTP_PASS ? '✅ Set' : '❌ Missing');

// Create transporter with correct configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Verification Failed:', error.message);
  } else {
    console.log('✅ SMTP Ready! Emails will be sent from:', SMTP_USER);
  }
});

export const sendTestEmail = async (to: string) => {
  console.log(`📧 Sending test email to: ${to}`);
  
  const mailOptions = {
    from: `"MediVoice AI" <${SMTP_USER}>`,
    to: to,
    subject: '✅ MediVoice AI - Test Email',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; text-align: center; }
          .content { padding: 20px; }
          .footer { background: #f0f0f0; padding: 10px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 MediVoice AI</h1>
          </div>
          <div class="content">
            <h2>Test Email</h2>
            <p>This is a test email from <strong>MediVoice AI</strong>.</p>
            <p>Your email configuration is working correctly!</p>
            <p>You can now receive medical reports via email.</p>
          </div>
          <div class="footer">
            <p>MediVoice AI - Your Personal AI Medical Assistant</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('  Message ID:', info.messageId);
    console.log('  Sent to:', to);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Failed to send email:', error.message);
    throw error;
  }
};

export const sendMedicalReportEmail = async (data: any) => {
  const { to, patientName, consultationId, specialistName, symptoms, diagnosis, recommendations } = data;
  
  console.log(`📧 Sending medical report to: ${to}`);
  
  const mailOptions = {
    from: `"MediVoice AI" <${SMTP_USER}>`,
    to: to,
    subject: `🏥 Your Medical Report - ${consultationId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; text-align: center; }
          .content { padding: 20px; }
          .section { margin-bottom: 20px; }
          .footer { background: #f0f0f0; padding: 10px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 MediVoice AI</h1>
            <h2>Medical Consultation Report</h2>
          </div>
          <div class="content">
            <h3>Dear ${patientName},</h3>
            <p>Thank you for using MediVoice AI. Here is your medical consultation report.</p>
            
            <div class="section">
              <strong>Consultation ID:</strong> ${consultationId}<br>
              <strong>Specialist:</strong> ${specialistName}<br>
              <strong>Date:</strong> ${new Date().toLocaleString()}
            </div>
            
            <div class="section">
              <h3>🩺 Symptoms</h3>
              <p>${symptoms}</p>
            </div>
            
            <div class="section">
              <h3>📝 Diagnosis</h3>
              <p>${diagnosis}</p>
            </div>
            
            <div class="section">
              <h3>📋 Recommendations</h3>
              <ul>
                ${recommendations.map((r: string) => `<li>${r}</li>`).join('')}
              </ul>
            </div>
            
            <p><em>⚠️ This is an AI-generated report. Please consult a qualified healthcare provider for medical advice.</em></p>
          </div>
          <div class="footer">
            <p>MediVoice AI - Your Personal AI Medical Assistant</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Medical report sent successfully!');
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Failed to send medical report:', error.message);
    throw error;
  }
};
import nodemailer from 'nodemailer';

// Use EMAIL_USER/EMAIL_PASS (same credentials as reminderService)
const EMAIL_USER = process.env.EMAIL_USER || process.env.SMTP_USER;
const EMAIL_PASS = process.env.EMAIL_PASS || process.env.SMTP_PASS;

console.log('📧 Email Service Initialized');
console.log('  User:', EMAIL_USER);
console.log('  Pass:', EMAIL_PASS ? '✅ Set' : '❌ Missing');

// Create transporter using Gmail service (recommended over manual host/port)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Verify connection on startup (non-fatal — server starts regardless)
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Verification Failed:', error.message);
    console.log('💡 Tip: Make sure you are using a valid Gmail App Password.');
    console.log('   Go to https://myaccount.google.com/apppasswords to generate one.');
  } else {
    console.log('✅ SMTP Ready! Emails will be sent from:', EMAIL_USER);
  }
});

export const sendTestEmail = async (to: string) => {
  console.log(`📧 Sending test email to: ${to}`);
  
  const mailOptions = {
    from: `"MediVoice AI" <${EMAIL_USER}>`,
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
    from: `"MediVoice AI" <${EMAIL_USER}>`,
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
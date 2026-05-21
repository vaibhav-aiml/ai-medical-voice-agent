// WhatsApp message templates
export const WhatsAppTemplates = {
  // Consultation Summary Template
  consultationSummary: (patientName: string, specialistName: string, symptoms: string, date: Date, reportUrl: string) => {
    return `🏥 *MediVoice AI - Consultation Summary*

Hello *${patientName}*,

Thank you for using MediVoice AI. Here's your consultation summary:

📋 *Consultation Details:*
• Specialist: ${specialistName}
• Date: ${new Date(date).toLocaleString()}
• Symptoms: ${symptoms.substring(0, 150)}${symptoms.length > 150 ? '...' : ''}

📎 *View Full Report:* ${reportUrl}

💡 *Next Steps:*
• Download your complete medical report
• Book a follow-up appointment if needed
• Share report with your doctor

_This is an AI-generated summary. For medical emergencies, please contact emergency services._

Stay healthy! 🌟
`;
  },

  // Appointment Reminder Template
  appointmentReminder: (patientName: string, specialistName: string, date: Date, time: string, consultationLink: string) => {
    return `🔔 *MediVoice AI - Appointment Reminder*

Hello *${patientName}*,

This is a reminder for your upcoming consultation:

👨‍⚕️ *Specialist:* ${specialistName}
📅 *Date:* ${new Date(date).toLocaleDateString()}
⏰ *Time:* ${time}

🔗 *Join Consultation:* ${consultationLink}

Please join 5 minutes before your scheduled time.

*Tips for a better consultation:*
• Find a quiet place
• Ensure good internet connection
• Have your symptoms ready
• Use headphones for better audio

Need to reschedule? Visit your dashboard.

Thank you for choosing MediVoice AI! 🌟
`;
  },

  // Report Ready Template
  reportReady: (patientName: string, consultationId: string, reportUrl: string) => {
    return `📄 *MediVoice AI - Your Report is Ready*

Hello *${patientName}*,

Your medical report for consultation #${consultationId} is now ready.

📎 *Download Report:* ${reportUrl}

You can:
✅ Download as PDF
✅ Share with your doctor
✅ Save for your records
✅ Book a follow-up appointment

*Need help understanding your report?* 
Start a new consultation or reply to this message.

Thank you for trusting MediVoice AI! 🏥
`;
  },

  // Prescription Ready Template
  prescriptionReady: (patientName: string, medication: string, pharmacyLink: string) => {
    return `💊 *MediVoice AI - Prescription Ready*

Hello *${patientName}*,

Your prescription has been generated:

📋 *Prescribed Medication:* ${medication}

🔄 *Order Medicine:* ${pharmacyLink}

*Important:*
• Take medication as prescribed
• Complete the full course
• Consult doctor if side effects occur

Stay healthy! 🌟
`;
  },
};

// WhatsApp sharing function
export const shareOnWhatsApp = (message: string, phoneNumber?: string) => {
  // Remove spaces from phone number if provided
  const formattedNumber = phoneNumber ? phoneNumber.replace(/\s/g, '') : '';
  
  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // Create WhatsApp URL
  let whatsappUrl;
  if (formattedNumber) {
    whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
  } else {
    whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
  }
  
  // Open WhatsApp in new tab
  window.open(whatsappUrl, '_blank');
};

// Send consultation summary via WhatsApp
export const sendConsultationSummary = (
  patientName: string,
  specialistName: string,
  symptoms: string,
  date: Date,
  reportUrl: string,
  phoneNumber?: string
) => {
  const message = WhatsAppTemplates.consultationSummary(patientName, specialistName, symptoms, date, reportUrl);
  shareOnWhatsApp(message, phoneNumber);
};

// Send appointment reminder via WhatsApp
export const sendAppointmentReminder = (
  patientName: string,
  specialistName: string,
  date: Date,
  time: string,
  consultationLink: string,
  phoneNumber?: string
) => {
  const message = WhatsAppTemplates.appointmentReminder(patientName, specialistName, date, time, consultationLink);
  shareOnWhatsApp(message, phoneNumber);
};

// Send report ready notification via WhatsApp
export const sendReportReadyNotification = (
  patientName: string,
  consultationId: string,
  reportUrl: string,
  phoneNumber?: string
) => {
  const message = WhatsAppTemplates.reportReady(patientName, consultationId, reportUrl);
  shareOnWhatsApp(message, phoneNumber);
};
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.medivoice.ai',
  appName: 'MediVoice AI',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: false,
    allowNavigation: [
      '*.clerk.accounts.dev',
      'helping-tiger-13.clerk.accounts.dev',
      '*.clerk.com',
      'clerk.com',
      'accounts.google.com',
      '*.google.com',
      '*.google.co.in',
      '*.googleapis.com',
      'github.com',
      '*.github.com',
      'api.github.com',
      'ai-medical-voice-agent-ygc5.onrender.com',
    ],
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;

import { Capacitor, registerPlugin } from '@capacitor/core';

interface SpeechRecognitionPluginInterface {
  isAvailable(): Promise<{ available: boolean }>;
  startListening(options: { language?: string; partialResults?: boolean }): Promise<{ started: boolean }>;
  stopListening(): Promise<{ stopped: boolean }>;
  addListener(eventName: string, listenerFunc: (data: any) => void): Promise<{ remove: () => Promise<void> }>;
  removeAllListeners(): Promise<void>;
}

const NativeSpeechRecognition = registerPlugin<SpeechRecognitionPluginInterface>('SpeechRecognition');

/**
 * Adapter that provides the standard Web Speech API (webkitSpeechRecognition)
 * interface on top of native Android SpeechRecognizer.
 */
export class NativeSpeechRecognitionAdapter {
  continuous: boolean = true;
  interimResults: boolean = true;
  lang: string = 'en-US';

  onstart: (() => void) | null = null;
  onresult: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  onend: (() => void) | null = null;

  private isStarted: boolean = false;
  private listeners: Array<() => Promise<void>> = [];

  async start(): Promise<void> {
    if (this.isStarted) return;
    this.isStarted = true;

    try {
      await this.cleanupListeners();

      const readySub = await NativeSpeechRecognition.addListener('ready', () => {
        if (this.onstart) this.onstart();
      });
      this.listeners.push(() => readySub.remove());

      const partialSub = await NativeSpeechRecognition.addListener('partialResult', (data: { transcript: string }) => {
        if (this.onresult && data.transcript) {
          const fakeResult = [{ transcript: data.transcript, confidence: 0.8 }];
          (fakeResult as any).isFinal = false;
          const fakeEvent = {
            resultIndex: 0,
            results: [fakeResult],
          };
          this.onresult(fakeEvent);
        }
      });
      this.listeners.push(() => partialSub.remove());

      const resultSub = await NativeSpeechRecognition.addListener('result', (data: { transcript: string }) => {
        if (this.onresult && data.transcript) {
          const fakeResult = [{ transcript: data.transcript, confidence: 1.0 }];
          (fakeResult as any).isFinal = true;
          const fakeEvent = {
            resultIndex: 0,
            results: [fakeResult],
          };
          this.onresult(fakeEvent);
        }
      });
      this.listeners.push(() => resultSub.remove());

      const errorSub = await NativeSpeechRecognition.addListener('error', (data: { error: string; errorCode: number }) => {
        if (this.onerror) {
          this.onerror({ error: data.error });
        }
      });
      this.listeners.push(() => errorSub.remove());

      const endSub = await NativeSpeechRecognition.addListener('end', () => {
        this.isStarted = false;
        if (this.onend) this.onend();
      });
      this.listeners.push(() => endSub.remove());

      await NativeSpeechRecognition.startListening({
        language: this.lang,
        partialResults: this.interimResults,
      });
    } catch (err: any) {
      this.isStarted = false;
      if (this.onerror) {
        this.onerror({ error: err.message || 'native_start_failed' });
      }
      if (this.onend) this.onend();
    }
  }

  async stop(): Promise<void> {
    if (!this.isStarted) return;
    this.isStarted = false;
    try {
      await NativeSpeechRecognition.stopListening();
    } catch (e) {
      console.warn('Native speech stop error:', e);
    }
  }

  async abort(): Promise<void> {
    await this.stop();
  }

  private async cleanupListeners() {
    for (const remove of this.listeners) {
      try {
        await remove();
      } catch (ignored) {}
    }
    this.listeners = [];
  }
}

/**
 * Checks whether speech recognition is available in the current environment
 * (either natively on mobile via Capacitor or in browser via Web Speech API).
 */
export function isSpeechRecognitionSupported(): boolean {
  if (Capacitor.isNativePlatform()) {
    return true;
  }
  return typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
}

/**
 * Factory that returns an instance of speech recognition:
 * - On native mobile (Android): returns NativeSpeechRecognitionAdapter
 * - On web browsers: returns native browser SpeechRecognition / webkitSpeechRecognition
 * - If unsupported: returns null
 */
export function createSpeechRecognition(): any {
  if (Capacitor.isNativePlatform()) {
    return new NativeSpeechRecognitionAdapter();
  }

  if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    const SpeechRecognitionClass = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    return new SpeechRecognitionClass();
  }

  return null;
}

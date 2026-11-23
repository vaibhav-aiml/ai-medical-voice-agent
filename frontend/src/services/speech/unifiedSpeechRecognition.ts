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
  lang: string = 'en-IN';

  onstart: (() => void) | null = null;
  onresult: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  onend: (() => void) | null = null;

  private isStarted: boolean = false;
  private finalSegments: string[] = [];
  private listeners: Array<() => Promise<void>> = [];

  async start(): Promise<void> {
    if (this.isStarted) return;
    this.isStarted = true;
    this.finalSegments = [];

    try {
      await this.cleanupListeners();

      const readySub = await NativeSpeechRecognition.addListener('ready', () => {
        if (this.onstart) this.onstart();
      });
      this.listeners.push(() => readySub.remove());

      const partialSub = await NativeSpeechRecognition.addListener('partialResult', (data: { transcript: string }) => {
        const interim = (data.transcript || '').trim();
        if (!interim && this.finalSegments.length === 0) return;

        const results: any[] = this.finalSegments.map(seg => {
          const item = [{ transcript: seg, confidence: 1.0 }];
          (item as any).isFinal = true;
          return item;
        });

        if (interim) {
          const item = [{ transcript: interim, confidence: 0.8 }];
          (item as any).isFinal = false;
          results.push(item);
        }

        if (this.onresult && results.length > 0) {
          this.onresult({
            resultIndex: 0,
            results,
          });
        }
      });
      this.listeners.push(() => partialSub.remove());

      const resultSub = await NativeSpeechRecognition.addListener('result', (data: { transcript: string }) => {
        const finalText = (data.transcript || '').trim();
        if (finalText) {
          this.finalSegments.push(finalText);
        }

        const results: any[] = this.finalSegments.map(seg => {
          const item = [{ transcript: seg, confidence: 1.0 }];
          (item as any).isFinal = true;
          return item;
        });

        if (this.onresult && results.length > 0) {
          this.onresult({
            resultIndex: 0,
            results,
          });
        }

        // If continuous dictation is requested and user has not stopped, auto-restart next utterance
        if (this.continuous && this.isStarted) {
          setTimeout(() => {
            if (this.isStarted) {
              NativeSpeechRecognition.startListening({
                language: this.lang,
                partialResults: this.interimResults,
              }).catch(err => {
                console.warn('Native speech continuous listen restart:', err);
              });
            }
          }, 150);
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
        if (!this.continuous || !this.isStarted) {
          this.isStarted = false;
          if (this.onend) this.onend();
        }
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
    if (this.onend) this.onend();
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

import { describe, it, expect } from 'vitest';

// Simulated Biquad transfer function amplitude calculator
function computeFilterGain(frequency: number, type: 'highpass' | 'lowpass', cutoff: number): number {
  if (type === 'highpass') {
    // Amplitude = f / sqrt(f^2 + fc^2)
    return frequency / Math.sqrt(frequency * frequency + cutoff * cutoff);
  } else {
    // Amplitude = fc / sqrt(f^2 + fc^2)
    return cutoff / Math.sqrt(frequency * frequency + cutoff * cutoff);
  }
}

describe('Background Noise Cancellation DSP Filter Tests', () => {
  const HP_CUTOFF = 100; // 100Hz Low-cut
  const LP_CUTOFF = 3000; // 3kHz High-cut

  it('should suppress low-frequency environmental AC hums (e.g. 50Hz)', () => {
    const frequency = 50;
    const hpGain = computeFilterGain(frequency, 'highpass', HP_CUTOFF);
    
    // Gain at 50Hz should be less than 0.5 (heavy attenuation)
    expect(hpGain).toBeLessThan(0.5);
  });

  it('should suppress high-frequency static hiss (e.g. 8000Hz)', () => {
    const frequency = 8000;
    const lpGain = computeFilterGain(frequency, 'lowpass', LP_CUTOFF);
    
    // Gain at 8000Hz should be less than 0.4 (heavy attenuation)
    expect(lpGain).toBeLessThan(0.4);
  });

  it('should preserve standard human clinical vocal range signals (e.g. 1000Hz)', () => {
    const frequency = 1000;
    const hpGain = computeFilterGain(frequency, 'highpass', HP_CUTOFF);
    const lpGain = computeFilterGain(frequency, 'lowpass', LP_CUTOFF);
    
    const combinedGain = hpGain * lpGain;

    // Both filters should let standard speech pass through with minimal loss (>0.9)
    expect(hpGain).toBeGreaterThan(0.95);
    expect(lpGain).toBeGreaterThan(0.9);
    expect(combinedGain).toBeGreaterThan(0.9);
  });
});

import { describe, it, expect } from 'vitest';
import { WeddingAudioSynthesizer, AUDIO_PRESETS } from '../../apps/web/lib/audio';

describe('Wedding Audio Synthesizer', () => {
  it('provides rich presets for traditional Indian wedding instruments', () => {
    expect(AUDIO_PRESETS.length).toBe(3);
    const presetIds = AUDIO_PRESETS.map(p => p.id);
    expect(presetIds).toContain('shehnai');
    expect(presetIds).toContain('sitar');
    expect(presetIds).toContain('flute');
  });

  it('safely handles SSR or headless environments without throwing', () => {
    const synth = new WeddingAudioSynthesizer();
    expect(synth.isAudioPlaying()).toBe(false);

    // In Node.js / SSR environment, window is undefined
    expect(() => synth.start('shehnai')).not.toThrow();
    expect(() => synth.stop()).not.toThrow();
  });
});

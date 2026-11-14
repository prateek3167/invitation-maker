import { describe, it, expect } from 'vitest';
import {
  generateInvitationCopy,
  type InvitationPromptOptions,
} from '../../packages/editor-core/ai-assistant';

describe('AI Wedding Content & Shloka Assistant', () => {
  it('generates culturally authentic Hindi wedding copy with Vedic shlokas', () => {
    const options: InvitationPromptOptions = {
      ceremony: 'vivah',
      tone: 'royal',
      voice: 'bride_parents',
      language: 'hindi',
      brideName: 'Aarushi',
      groomName: 'Siddharth',
      familySurname: 'Kapoor',
    };

    const results = generateInvitationCopy(options);
    expect(results.length).toBeGreaterThan(0);

    const first = results[0];
    expect(first.heading).toContain('श्री गणेशाय नमः');
    expect(first.title).toContain('Aarushi');
    expect(first.title).toContain('Siddharth');
    expect(first.message).toContain('सुपुत्री Aarushi');
    expect(first.rhymeOrQuote).toContain('मङ्गलं भगवान् विष्णुर्मङ्गलं');
    expect(first.hashtag).toBe('#AarushiWedsSiddharth');
    expect(first.recommendedFont).toContain('Rozha One');
  });

  it('adjusts invitation voice for groom parents', () => {
    const options: InvitationPromptOptions = {
      ceremony: 'vivah',
      tone: 'royal',
      voice: 'groom_parents',
      language: 'hindi',
      brideName: 'Pooja',
      groomName: 'Rohan',
    };

    const results = generateInvitationCopy(options);
    expect(results[0].message).toContain('सुपुत्र Rohan');
  });

  it('generates vibrant Haldi & Mehndi copy with rhyming folk verses', () => {
    const haldi = generateInvitationCopy({
      ceremony: 'haldi',
      tone: 'traditional',
      voice: 'couple',
      language: 'hindi',
      brideName: 'Meera',
      groomName: 'Kabir',
    });
    expect(haldi[0].heading).toContain('हल्दी उत्सव');
    expect(haldi[0].rhymeOrQuote).toContain('हल्दी रचेगी');
    expect(haldi[0].hashtag).toContain('#HaldiHaiMeeraKi');

    const mehndi = generateInvitationCopy({
      ceremony: 'mehndi',
      tone: 'playful',
      voice: 'couple',
      language: 'hindi',
      brideName: 'Meera',
      groomName: 'Kabir',
    });
    expect(mehndi[0].heading).toContain('मेहँदी');
    expect(mehndi[0].rhymeOrQuote).toContain('मेहंदी है रचने वाली');
  });

  it('generates elegant English royal wedding wording', () => {
    const enResults = generateInvitationCopy({
      ceremony: 'vivah',
      tone: 'royal',
      voice: 'couple',
      language: 'english',
      brideName: 'Ananya',
      groomName: 'Vikram',
    });

    expect(enResults.length).toBeGreaterThan(0);
    const royal = enResults[0];
    expect(royal.title).toBe('Ananya & Vikram');
    expect(royal.message).toContain('Together with our families');
    expect(royal.rhymeOrQuote).toContain('Two souls, one sacred journey');
    expect(royal.recommendedFont).toContain('Cinzel');
  });

  it('generates lively Sangeet and Reception celebrations in English', () => {
    const sangeet = generateInvitationCopy({
      ceremony: 'sangeet',
      tone: 'playful',
      voice: 'couple',
      language: 'english',
      brideName: 'Tara',
      groomName: 'Dhruv',
    });
    expect(sangeet[0].heading).toContain('SANGEET');
    expect(sangeet[0].message).toContain('dance');

    const reception = generateInvitationCopy({
      ceremony: 'reception',
      tone: 'formal',
      voice: 'couple',
      language: 'english',
      brideName: 'Tara',
      groomName: 'Dhruv',
    });
    expect(reception[0].heading).toContain('RECEPTION');
    expect(reception[0].subtitle).toContain('Dinner');
  });

  it('generates playful Hinglish celebrations', () => {
    const hinglish = generateInvitationCopy({
      ceremony: 'vivah',
      tone: 'playful',
      voice: 'couple',
      language: 'hinglish',
      brideName: 'Simran',
      groomName: 'Raj',
    });

    expect(hinglish[0].title).toBe('Simran Weds Raj');
    expect(hinglish[0].message).toContain('saat pheras');
    expect(hinglish[0].rhymeOrQuote).toContain('naach gaana');
  });
});

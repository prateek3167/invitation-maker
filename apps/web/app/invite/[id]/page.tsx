'use client';
import { useEffect, useState, use, useRef } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Music,
  Sparkles,
} from 'lucide-react';
import type { Invitation } from '../../../../../packages/editor-core/document';
import InvitationPreview from '../../../components/invitation-preview';
import { eventStart } from '../../../../../packages/editor-core/calendar';
import { loadDraft } from '../../../lib/storage';
import {
  generateGoogleCalendarUrl,
  generateGoogleMapsUrl,
} from '../../../lib/share';
import { WeddingAudioSynthesizer, AUDIO_PRESETS, type AudioPreset } from '../../../lib/audio';

export default function GuestInvitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [doc, setDoc] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCardIdx, setActiveCardIdx] = useState(0);

  // Countdown State
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 14,
    hours: 8,
    minutes: 30,
    seconds: 0,
  });

  // Traditional Celebration Audio Synthesizer State
  const synthRef = useRef<WeddingAudioSynthesizer | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioPreset, setAudioPreset] = useState<AudioPreset>('shehnai');
  const [showAudioMenu, setShowAudioMenu] = useState(false);

  useEffect(() => {
    synthRef.current = new WeddingAudioSynthesizer();
    return () => {
      synthRef.current?.stop();
    };
  }, []);

  const toggleAudio = () => {
    if (!synthRef.current) return;
    if (isPlayingAudio) {
      synthRef.current.stop();
      setIsPlayingAudio(false);
    } else {
      synthRef.current.start(audioPreset);
      setIsPlayingAudio(true);
    }
  };

  const handleSelectPreset = (p: AudioPreset) => {
    setAudioPreset(p);
    setShowAudioMenu(false);
    if (synthRef.current && isPlayingAudio) {
      synthRef.current.start(p);
    }
  };

  // Device preview only; unknown draft IDs never receive fabricated wedding details.
  useEffect(() => {
    async function load() {
      try {
        const found = await loadDraft(id);
        setDoc(found || null);
      } catch (err) {
        console.error('Failed to load invitation:', err);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id]);

  // Derive the countdown from the same date/time used by calendar exports.
  useEffect(() => {
    const tick = () => {
      let seconds = 0;
      try { if (doc) seconds = Math.max(0, Math.floor((eventStart(doc).getTime() - Date.now()) / 1000)); } catch { /* No guessed countdown. */ }
      setTimeLeft({ days: Math.floor(seconds / 86400), hours: Math.floor(seconds / 3600) % 24, minutes: Math.floor(seconds / 60) % 60, seconds: seconds % 60 });
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [doc]);

  if (loading) {
    return (
      <div className="invite-loading-screen">
        <div className="invite-spinner" />
        <p>Loading Wedding Invitation…</p>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="invite-error-screen">
        <h2>Invitation Not Found</h2>
        <p>No saved draft is available in this browser. This is a device preview, not a public invitation link.</p>
        <Link href="/" className="button">
          Return Home
        </Link>
      </div>
    );
  }

  // Cards in suite or single card
  const cards = doc.suiteCards && doc.suiteCards.length > 0 ? doc.suiteCards : [doc];
  const activeCard = cards[activeCardIdx] || doc;

  const mapsUrl = generateGoogleMapsUrl(doc.fields.venue);
  let calendarUrl: string | undefined;
  try { calendarUrl = generateGoogleCalendarUrl(doc); } catch { /* Keep invalid dates editable. */ }

  return (
    <div className="guest-invite-page">
      <p role="status">Device preview only. This draft is not published and online RSVPs are unavailable. Manage guests manually in the editor.</p>
      {/* Top Auspicious Header Banner */}
      <header className="invite-top-banner">
        <span className="auspicious-tag">॥ श्री गणेशाय नमः ॥</span>
        <h1>{doc.fields.host && doc.fields.partner ? `${doc.fields.host} & ${doc.fields.partner}` : doc.title}</h1>
        <p className="invite-subtitle">Auspicious Wedding Celebration</p>
      </header>

      <main className="invite-main-container">
        {/* Card Flipper / Carousel */}
        <section className="invite-card-showcase" aria-label="Invitation card preview">
          <div className="invite-card-frame">
            <InvitationPreview document={activeCard} className="invite-card-img" />
          </div>

          {cards.length > 1 && (
            <div className="suite-carousel-controls">
              <button
                type="button"
                className="carousel-nav-btn"
                disabled={activeCardIdx === 0}
                onClick={() => setActiveCardIdx(prev => Math.max(0, prev - 1))}
                aria-label="Previous card"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="suite-dots-indicator">
                {cards.map((c, idx) => (
                  <button
                    key={c.id || idx}
                    type="button"
                    className={`suite-dot ${activeCardIdx === idx ? 'active' : ''}`}
                    onClick={() => setActiveCardIdx(idx)}
                    title={c.eventTag || `Card ${idx + 1}`}
                  >
                    <span>{idx + 1}</span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="carousel-nav-btn"
                disabled={activeCardIdx === cards.length - 1}
                onClick={() => setActiveCardIdx(prev => Math.min(cards.length - 1, prev + 1))}
                aria-label="Next card"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          {cards.length > 1 && (
            <p className="suite-current-label">
              Card {activeCardIdx + 1} of {cards.length} · {activeCard.eventTag || activeCard.fields.heading}
            </p>
          )}
        </section>

        {/* Live Wedding Countdown Timer */}
        <section className="invite-countdown-section">
          <div className="countdown-eyebrow">
            <Sparkles size={14} />
            <span>Counting Down to the Sacred Vows</span>
          </div>
          <div className="countdown-clock">
            <div className="countdown-unit">
              <strong>{timeLeft.days}</strong>
              <span>Days</span>
            </div>
            <span className="unit-sep">:</span>
            <div className="countdown-unit">
              <strong>{String(timeLeft.hours).padStart(2, '0')}</strong>
              <span>Hours</span>
            </div>
            <span className="unit-sep">:</span>
            <div className="countdown-unit">
              <strong>{String(timeLeft.minutes).padStart(2, '0')}</strong>
              <span>Mins</span>
            </div>
            <span className="unit-sep">:</span>
            <div className="countdown-unit">
              <strong>{String(timeLeft.seconds).padStart(2, '0')}</strong>
              <span>Secs</span>
            </div>
          </div>
        </section>

        {/* Essential Event Details & Quick Actions */}
        <section className="invite-details-card">
          <div className="detail-item">
            <Calendar size={20} className="detail-icon" />
            <div>
              <strong>Wedding Date</strong>
              <span>{doc.fields.date}</span>
            </div>
          </div>

          <div className="detail-item">
            <Clock size={20} className="detail-icon" />
            <div>
              <strong>Muhurat &amp; Timing</strong>
              <span>{doc.fields.time || '7:00 PM onwards'}</span>
            </div>
          </div>

          <div className="detail-item">
            <MapPin size={20} className="detail-icon" />
            <div>
              <strong>Ceremony Venue</strong>
              <span>{doc.fields.venue}</span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="invite-quick-actions">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="button secondary"
            >
              <MapPin size={16} />
              <span>Open in Google Maps</span>
              <ExternalLink size={12} />
            </a>

            <a
              href={calendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="button secondary"
            >
              <Calendar size={16} />
              <span>Add to Calendar</span>
              <ExternalLink size={12} />
            </a>


          </div>
        </section>


      </main>

      {/* Footer */}
      <footer className="invite-page-footer">
        <p>Created with love on Invitation Maker</p>
        <Link href="/" className="text-button">
          Create Your Own Wedding Invitation Suite →
        </Link>
      </footer>

      {/* Floating Traditional Celebration Music Player */}
      <div
        className="floating-audio-widget"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '8px',
        }}
      >
        {/* Preset Selector Popover */}
        {showAudioMenu && (
          <div
            style={{
              background: '#fff',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              borderRadius: '12px',
              padding: '8px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
              width: '240px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#8b181b',
                padding: '4px 8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Select Auspicious Music (संगीत)
            </span>
            {AUDIO_PRESETS.map(preset => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: audioPreset === preset.id ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Music size={13} color={audioPreset === preset.id ? '#8b181b' : '#666'} />
                  <strong style={{ fontSize: '0.82rem', color: '#222' }}>{preset.name}</strong>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#666', marginTop: '2px' }}>
                  {preset.hindiName}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Main Floating Trigger Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(212, 175, 55, 0.5)',
            boxShadow: '0 4px 20px rgba(84, 18, 18, 0.18)',
            padding: '6px 12px',
            borderRadius: '40px',
            gap: '8px',
          }}
        >
          <button
            type="button"
            onClick={toggleAudio}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              background: isPlayingAudio ? '#8b181b' : '#f4ede4',
              color: isPlayingAudio ? '#fff' : '#666',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            title={isPlayingAudio ? 'Mute celebratory music' : 'Play traditional wedding music'}
          >
            {isPlayingAudio ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          <button
            type="button"
            onClick={() => setShowAudioMenu(prev => !prev)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: '0 4px',
            }}
            title="Change traditional music track"
          >
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#333' }}>
              {isPlayingAudio ? (
                <span style={{ color: '#8b181b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#16a34a',
                    }}
                  />
                  {AUDIO_PRESETS.find(p => p.id === audioPreset)?.hindiName || 'संगीत'}
                </span>
              ) : (
                'Play Celebration Music'
              )}
            </span>
            <span style={{ fontSize: '0.68rem', color: '#777' }}>
              {isPlayingAudio ? 'Tap to change track' : 'Mangal Shehnai & Sitar'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

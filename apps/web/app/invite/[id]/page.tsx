'use client';
import { useEffect, useState, use, useRef } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ExternalLink,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Volume2,
  VolumeX,
  Music,
} from 'lucide-react';
import type { Invitation } from '../../../../../packages/editor-core/document';
import { renderSvg } from '../../../../../packages/template-engine/render';
import { loadDraft, saveDraft } from '../../../lib/storage';
import {
  generateWhatsAppShareUrl,
  generateGoogleCalendarUrl,
  generateGoogleMapsUrl,
} from '../../../lib/share';
import type { RsvpResponse, DietaryPreference, AttendanceStatus } from '../../../../../packages/editor-core/rsvp';
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

  // RSVP Form State
  const [guestName, setGuestName] = useState('');
  const [contact, setContact] = useState('');
  const [attending, setAttending] = useState<AttendanceStatus>('attending');
  const [guestCount, setGuestCount] = useState(2);
  const [selectedCeremonies, setSelectedCeremonies] = useState<string[]>(['haldi', 'sangeet', 'shaadi']);
  const [dietary, setDietary] = useState<DietaryPreference>('vegetarian');
  const [blessing, setBlessing] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  // Load document from local storage or create fallback demo document
  useEffect(() => {
    async function load() {
      try {
        const found = await loadDraft(id);
        if (found) {
          setDoc(found);
        } else {
          // Demo fallback document so any /invite/demo link opens beautifully
          const fallbackDoc: Invitation = {
            schemaVersion: 1,
            id,
            templateId: '1',
            title: 'Aarav & Meera Wedding Celebration',
            revision: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            fields: {
              host: 'Aarav',
              partner: 'Meera',
              heading: '॥ श्री गणेशाय नमः ॥',
              date: 'Saturday, November 28, 2026',
              time: '7:00 PM Onwards',
              venue: 'The Grand Palace Resort & Convention Center, New Delhi',
              message: 'Together with their families, cordially invite you to celebrate the auspicious wedding ceremony.',
            },
            palette: ['#541212', '#fff8ee', '#d4af37'],
            font: 'serif',
            format: 'portrait',
            photo: null,
            rsvpSettings: {
              enabled: true,
              allowPlusOnes: true,
              maxPartySize: 6,
              collectDietary: true,
              collectCeremonies: true,
              welcomeMessage: 'We would be honored by your gracious presence and blessings on our special day!',
            },
          };
          setDoc(fallbackDoc);
        }
      } catch (err) {
        console.error('Failed to load invitation:', err);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id]);

  // Live Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
        <p>The invitation link might be expired or incorrect.</p>
        <Link href="/" className="button">
          Return Home
        </Link>
      </div>
    );
  }

  // Cards in suite or single card
  const cards = doc.suiteCards && doc.suiteCards.length > 0 ? doc.suiteCards : [doc];
  const activeCard = cards[activeCardIdx] || doc;

  // Render SVG of current card
  const cardSvg = renderSvg(activeCard);
  const cardSvgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(cardSvg)}`;

  const mapsUrl = generateGoogleMapsUrl(doc.fields.venue);
  const calendarUrl = generateGoogleCalendarUrl(doc);
  const whatsAppUrl = generateWhatsAppShareUrl(doc);

  // Handle Ceremony Checkbox
  const toggleCeremony = (ceremonyId: string) => {
    setSelectedCeremonies(prev =>
      prev.includes(ceremonyId) ? prev.filter(c => c !== ceremonyId) : [...prev, ceremonyId]
    );
  };

  // Submit RSVP
  const handleSubmitRsvp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    setSubmitting(true);

    try {
      const response: RsvpResponse = {
        id: `guest_${Date.now()}`,
        guestName: guestName.trim(),
        phoneOrEmail: contact.trim() || 'Digital Guest',
        attending,
        guestCount: attending === 'attending' ? Number(guestCount) : 0,
        ceremonies: selectedCeremonies,
        dietary,
        notes: blessing.trim(),
        submittedAt: new Date().toISOString(),
      };

      const updatedResponses = [...(doc.rsvpResponses || []), response];
      const updatedDoc: Invitation = {
        ...doc,
        rsvpResponses: updatedResponses,
      };

      await saveDraft(updatedDoc);
      setDoc(updatedDoc);
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit RSVP:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="guest-invite-page">
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
            <img
              src={cardSvgDataUrl}
              alt={activeCard.title || 'Wedding Card'}
              className="invite-card-img"
            />
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

            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="button secondary"
            >
              <MessageCircle size={16} />
              <span>Forward on WhatsApp</span>
            </a>
          </div>
        </section>

        {/* Interactive RSVP Form */}
        <section className="invite-rsvp-section" id="rsvp">
          <div className="rsvp-header">
            <h2>RSVP &amp; Blessings</h2>
            <p>
              {doc.rsvpSettings?.welcomeMessage ||
                'We would be delighted to have you join us for our celebration. Kindly let us know if you can attend.'}
            </p>
          </div>

          {submitted ? (
            <div className="rsvp-confirmation-card">
              <div className="confirm-icon">
                <CheckCircle2 size={40} />
              </div>
              <h3>Thank You, {guestName}!</h3>
              <p>
                {attending === 'attending'
                  ? 'Your RSVP has been joyfully received! We look forward to celebrating with you and your family.'
                  : 'Thank you for letting us know. Your warm blessings mean the world to us!'}
              </p>
              <div className="confirm-actions">
                <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="button sm">
                  <Calendar size={14} /> Add to Calendar
                </a>
                <button
                  type="button"
                  className="button secondary sm"
                  onClick={() => setSubmitted(false)}
                >
                  Edit Response
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitRsvp} className="rsvp-form">
              {/* Attendance Selection */}
              <div className="attendance-radio-group">
                <button
                  type="button"
                  className={`radio-card ${attending === 'attending' ? 'selected' : ''}`}
                  onClick={() => setAttending('attending')}
                >
                  <CheckCircle2 size={20} />
                  <strong>Joyfully Attend</strong>
                  <span>उपस्थित होंगे</span>
                </button>

                <button
                  type="button"
                  className={`radio-card ${attending === 'declined' ? 'selected' : ''}`}
                  onClick={() => setAttending('declined')}
                >
                  <XCircle size={20} />
                  <strong>Regretfully Decline</strong>
                  <span>नहीं आ सकेंगे</span>
                </button>

                <button
                  type="button"
                  className={`radio-card ${attending === 'tentative' ? 'selected' : ''}`}
                  onClick={() => setAttending('tentative')}
                >
                  <HelpCircle size={20} />
                  <strong>Tentative</strong>
                  <span>संभावित</span>
                </button>
              </div>

              {/* Guest Details */}
              <div className="form-fields-grid">
                <label className="field">
                  Your Full Name / Family Name *
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand &amp; Sunita Verma"
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                  />
                </label>

                <label className="field">
                  Phone Number or Email *
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={contact}
                    onChange={e => setContact(e.target.value)}
                  />
                </label>
              </div>

              {attending === 'attending' && (
                <>
                  <div className="form-fields-grid">
                    <label className="field">
                      Number of Guests Attending
                      <select
                        value={guestCount}
                        onChange={e => setGuestCount(Number(e.target.value))}
                      >
                        <option value={1}>1 Guest (Just Me)</option>
                        <option value={2}>2 Guests (Couple)</option>
                        <option value={3}>3 Guests (Family)</option>
                        <option value={4}>4 Guests (Family)</option>
                        <option value={5}>5 Guests (Family)</option>
                        <option value={6}>6+ Guests</option>
                      </select>
                    </label>

                    <label className="field">
                      Catering / Dietary Preference
                      <select
                        value={dietary}
                        onChange={e => setDietary(e.target.value as DietaryPreference)}
                      >
                        <option value="vegetarian">Pure Vegetarian (शुद्ध शाकाहारी)</option>
                        <option value="jain">Jain Catering (जैन - बिना कंदमूल)</option>
                        <option value="swaminarayan">Swaminarayan (स्वामीनारायण)</option>
                        <option value="non_vegetarian">Non-Vegetarian</option>
                        <option value="none">No Special Preference</option>
                      </select>
                    </label>
                  </div>

                  {/* Ceremonies Checkboxes */}
                  <div className="ceremonies-checkbox-wrap">
                    <label className="checkbox-heading">Which events will you be attending?</label>
                    <div className="ceremonies-pills-row">
                      {[
                        { id: 'haldi', label: '💛 Shubh Haldi' },
                        { id: 'mehndi', label: '🌿 Shubh Mehndi' },
                        { id: 'sangeet', label: '🎶 Sangeet Night' },
                        { id: 'shaadi', label: '👑 Shubh Vivah' },
                        { id: 'reception', label: '✨ Reception' },
                      ].map(c => (
                        <button
                          key={c.id}
                          type="button"
                          className={`ceremony-pill ${selectedCeremonies.includes(c.id) ? 'active' : ''}`}
                          onClick={() => toggleCeremony(c.id)}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <label className="field">
                Blessings &amp; Message to the Couple
                <textarea
                  rows={3}
                  placeholder="Share your warm wishes and blessings for the bride &amp; groom…"
                  value={blessing}
                  onChange={e => setBlessing(e.target.value)}
                />
              </label>

              <button type="submit" className="button full submit-rsvp-btn" disabled={submitting}>
                {submitting ? 'Submitting RSVP…' : 'Submit RSVP · स्वीकृति भेजें'}
              </button>
            </form>
          )}
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

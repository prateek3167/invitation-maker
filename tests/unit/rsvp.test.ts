import { describe, it, expect } from 'vitest';
import {
  calculateRsvpStats,
  exportRsvpToCsv,
  generateSampleRsvpResponses,
  type RsvpResponse,
} from '../../packages/editor-core/rsvp';
import { generateQrCodeSvg, generateQrCodeDataUrl } from '../../apps/web/lib/qrcode';
import {
  formatWhatsAppMessage,
  generateWhatsAppShareUrl,
  generateGoogleCalendarUrl,
  generateGoogleMapsUrl,
  getGuestInviteUrl,
} from '../../apps/web/lib/share';
import type { Invitation } from '../../packages/editor-core/document';

describe('RSVP & Guest Management Engine', () => {
  it('correctly aggregates RSVP metrics, dietary counts, and ceremony attendance', () => {
    const responses: RsvpResponse[] = [
      {
        id: '1',
        guestName: 'Aarav Sharma',
        phoneOrEmail: '+91 98200 11111',
        attending: 'attending',
        guestCount: 4,
        ceremonies: ['haldi', 'shaadi'],
        dietary: 'vegetarian',
        submittedAt: '2026-11-14T10:00:00Z',
      },
      {
        id: '2',
        guestName: 'Priya Jain',
        phoneOrEmail: 'priya@example.com',
        attending: 'attending',
        guestCount: 2,
        ceremonies: ['sangeet', 'shaadi'],
        dietary: 'jain',
        submittedAt: '2026-11-14T11:00:00Z',
      },
      {
        id: '3',
        guestName: 'Rohan Gupta',
        phoneOrEmail: 'rohan@example.com',
        attending: 'declined',
        guestCount: 0,
        ceremonies: [],
        dietary: 'none',
        submittedAt: '2026-11-14T12:00:00Z',
      },
      {
        id: '4',
        guestName: 'Meera Patel',
        phoneOrEmail: '+91 98300 22222',
        attending: 'tentative',
        guestCount: 1,
        ceremonies: ['shaadi'],
        dietary: 'swaminarayan',
        submittedAt: '2026-11-14T13:00:00Z',
      },
    ];

    const stats = calculateRsvpStats(responses);
    expect(stats.totalResponses).toBe(4);
    expect(stats.attendingParties).toBe(2);
    expect(stats.declinedParties).toBe(1);
    expect(stats.tentativeParties).toBe(1);
    expect(stats.totalGuestsAttending).toBe(6); // 4 + 2

    // Dietary
    expect(stats.dietaryBreakdown.vegetarian).toBe(4);
    expect(stats.dietaryBreakdown.jain).toBe(2);

    // Ceremonies
    expect(stats.ceremonyAttendance.haldi).toBe(4);
    expect(stats.ceremonyAttendance.sangeet).toBe(2);
    expect(stats.ceremonyAttendance.shaadi).toBe(6); // 4 + 2
  });

  it('exports RFC-4180 CSV with spreadsheet formula injection protection', () => {
    const maliciousGuest: RsvpResponse = {
      id: 'bad_1',
      guestName: '=cmd|/C calc!A0', // Potential CSV formula execution
      phoneOrEmail: '+91 99999 99999',
      attending: 'attending',
      guestCount: 2,
      ceremonies: ['shaadi'],
      dietary: 'vegetarian',
      notes: '+SUM(1+1)',
      submittedAt: '2026-11-14T10:00:00Z',
    };

    const csv = exportRsvpToCsv([maliciousGuest], 'Test Wedding');
    expect(csv).toContain('Guest Name');
    expect(csv).toContain('Dietary Preference');

    // Verify sanitization prepends single quote ' to prevent formula execution in Excel/Sheets
    expect(csv).toContain("\"'=cmd|/C calc!A0\"");
    expect(csv).toContain("\"'+SUM(1+1)\"");
  });

  it('generates sample Indian wedding RSVP records', () => {
    const samples = generateSampleRsvpResponses();
    expect(samples.length).toBeGreaterThanOrEqual(4);
    const stats = calculateRsvpStats(samples);
    expect(stats.totalGuestsAttending).toBeGreaterThan(5);
    expect(stats.dietaryBreakdown.jain).toBeGreaterThan(0);
  });
});

describe('QR Code Generation Engine', () => {
  it('generates scalable vector SVG QR codes with crisp edges and valid modules', () => {
    const testUrl = 'https://invitationmaker.com/invite/sample-wedding-123';
    const svg = generateQrCodeSvg(testUrl, {
      size: 240,
      color: '#541212',
      includeCenterBadge: true,
      centerBadgeText: 'RSVP',
    });

    expect(svg).toContain('<svg');
    expect(svg).toContain('viewBox');
    expect(svg).toContain('#541212');
    expect(svg).toContain('RSVP');
    expect(svg).toContain('shape-rendering="crispEdges"');
  });

  it('generates valid base64 data URLs for canvas integration', () => {
    const testUrl = 'http://localhost:3000/invite/test-card';
    const dataUrl = generateQrCodeDataUrl(testUrl);
    expect(dataUrl.startsWith('data:image/svg+xml')).toBe(true);
    expect(dataUrl).toContain('viewBox');
  });
});

describe('Sharing & Calendar Deep-Links', () => {
  const mockDoc: Invitation = {
    schemaVersion: 1,
    id: 'test-invitation-123',
    templateId: '1',
    title: 'Aarav & Meera Wedding',
    revision: 1,
    createdAt: '2026-11-14T10:00:00Z',
    updatedAt: '2026-11-14T10:00:00Z',
    fields: {
      host: 'Aarav',
      partner: 'Meera',
      heading: '॥ श्री गणेशाय नमः ॥',
      date: 'Saturday, November 28, 2026',
      time: '7:00 PM Onwards',
      venue: 'The Grand Palace, New Delhi',
      message: 'Cordially invite you to celebrate our wedding.',
    },
    palette: ['#541212', '#fff8ee', '#d4af37'],
    font: 'serif',
    format: 'portrait',
    photo: null,
  };

  it('formats an auspicious WhatsApp invitation message with deep-link', () => {
    const inviteUrl = getGuestInviteUrl(mockDoc, 'http://localhost:3000');
    expect(inviteUrl).toBe('http://localhost:3000/invite/test-invitation-123');

    const msg = formatWhatsAppMessage(mockDoc, inviteUrl);
    expect(msg).toContain('॥ श्री गणेशाय नमः ॥');
    expect(msg).toContain('Aarav & Meera');
    expect(msg).toContain('The Grand Palace, New Delhi');
    expect(msg).toContain(inviteUrl);

    const waUrl = generateWhatsAppShareUrl(mockDoc, 'http://localhost:3000');
    expect(waUrl.startsWith('https://api.whatsapp.com/send?text=')).toBe(true);
    expect(waUrl).toContain(encodeURIComponent('Aarav & Meera'));
  });

  it('generates Google Maps and Google Calendar event URLs', () => {
    const mapsUrl = generateGoogleMapsUrl('The Grand Palace, New Delhi');
    expect(mapsUrl).toBe('https://www.google.com/maps/search/?api=1&query=The%20Grand%20Palace%2C%20New%20Delhi');

    const calUrl = generateGoogleCalendarUrl(mockDoc, 'http://localhost:3000');
    expect(calUrl.startsWith('https://calendar.google.com/calendar/render?action=TEMPLATE')).toBe(true);
    expect(calUrl).toContain(encodeURIComponent('Wedding: Aarav & Meera'));
  });
});

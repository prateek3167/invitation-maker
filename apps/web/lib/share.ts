/**
 * Wedding Invitation Sharing & Calendar Integration
 * 1-Click WhatsApp share intent, Google Calendar, and Google Maps deep-links.
 */

import type { Invitation } from '../../../packages/editor-core/document';

export interface ShareOptions {
  baseUrl?: string;
  customNote?: string;
}

/**
 * Returns the public guest invitation URL for a given document.
 */
export function getGuestInviteUrl(doc: Invitation, origin?: string): string {
  const base = origin || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  const slug = doc.shareSlug || doc.id;
  return `${base}/invite/${slug}`;
}

/**
 * Formats an auspicious wedding message for WhatsApp sharing.
 */
export function formatWhatsAppMessage(doc: Invitation, inviteUrl: string): string {
  const bride = doc.fields.host || 'Bride';
  const groom = doc.fields.partner || 'Groom';
  const couple = bride && groom ? `${bride} & ${groom}` : doc.title || 'Wedding Celebration';
  const heading = doc.fields.heading || '॥ श्री गणेशाय नमः ॥';
  const date = doc.fields.date || 'Save the Date';
  const time = doc.fields.time ? `\n⏰ Time: ${doc.fields.time}` : '';
  const venue = doc.fields.venue || 'Wedding Venue';

  return `✨ ${heading} ✨

You are cordially invited to celebrate the joyous wedding of:
💍 *${couple}* 💍

📅 Date: ${date}${time}
📍 Venue: ${venue}

💌 *View Interactive Invitation & RSVP Online:*
${inviteUrl}

Seeking your blessings and warm presence! 🙏
— With Best Compliments From Family & Friends`;
}

/**
 * Generates direct WhatsApp share intent URL.
 */
export function generateWhatsAppShareUrl(doc: Invitation, origin?: string): string {
  const inviteUrl = getGuestInviteUrl(doc, origin);
  const text = formatWhatsAppMessage(doc, inviteUrl);
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

/**
 * Generates Google Maps search URL for the venue.
 */
export function generateGoogleMapsUrl(venue: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue)}`;
}

/**
 * Generates 1-click Google Calendar add event URL.
 */
export function generateGoogleCalendarUrl(doc: Invitation, origin?: string): string {
  const inviteUrl = getGuestInviteUrl(doc, origin);
  const title = `Wedding: ${doc.fields.host || 'Bride'} & ${doc.fields.partner || 'Groom'}`;
  const details = `${doc.fields.message || 'Wedding Celebration'}\n\nInvitation & RSVP: ${inviteUrl}`;
  const location = doc.fields.venue || '';

  // Approximate next weekend or current year date if not strictly parseable
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate() + 7).padStart(2, '0');
  const dates = `${year}${month}${day}T133000Z/${year}${month}${day}T183000Z`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dates}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
}

/**
 * Generates standard .ics iCalendar file content for download.
 */
export function generateIcsCalendarFile(doc: Invitation, origin?: string): string {
  const inviteUrl = getGuestInviteUrl(doc, origin);
  const title = `Wedding: ${doc.fields.host || 'Bride'} & ${doc.fields.partner || 'Groom'}`;
  const description = `${doc.fields.message || 'Wedding Celebration'}\\n\\nInvitation & RSVP: ${inviteUrl}`;
  const location = (doc.fields.venue || '').replace(/,/g, '\\,');

  const now = new Date();
  const stamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Invitation Maker//Indian Wedding Suite//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:wedding-${doc.id}@invitationmaker.com`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${stamp}`,
    `DTEND:${stamp}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    `URL:${inviteUrl}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

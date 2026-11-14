/**
 * Wedding Invitation Sharing & Calendar Integration
 * 1-Click WhatsApp share intent, Google Calendar, and Google Maps deep-links.
 */

import type { Invitation } from '../../../packages/editor-core/document';
import { eventStart, calendarStamp, calendarEscape, foldCalendarLine } from '../../../packages/editor-core/calendar';

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

  const start = eventStart(doc);
  const dates = `${calendarStamp(start)}/${calendarStamp(new Date(start.getTime() + 3 * 60 * 60_000))}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dates}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
}

/**
 * Generates standard .ics iCalendar file content for download.
 */
export function generateIcsCalendarFile(doc: Invitation, origin?: string): string {
  const inviteUrl = getGuestInviteUrl(doc, origin);
  const title = `Wedding: ${doc.fields.host || 'Bride'} & ${doc.fields.partner || 'Groom'}`;
  const description = `${doc.fields.message || 'Wedding Celebration'}\n\nInvitation & RSVP: ${inviteUrl}`;
  const location = doc.fields.venue || '';

  const now = new Date();
  const stamp = calendarStamp(now);
  const start = eventStart(doc);

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Invitation Maker//Indian Wedding Suite//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:wedding-${doc.id.replace(/[^a-z0-9-]/gi, "")}@invitationmaker.local`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${calendarStamp(start)}`,
    `DTEND:${calendarStamp(new Date(start.getTime() + 3 * 60 * 60_000))}`,
    `SUMMARY:${calendarEscape(title)}`,
    `DESCRIPTION:${calendarEscape(description)}`,
    `LOCATION:${calendarEscape(location)}`,
    `URL:${inviteUrl}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].map(foldCalendarLine).join('\r\n') + '\r\n';
}

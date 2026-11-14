import type { Invitation } from './document';

/** Calendar input supports ISO and English month names; event times are Asia/Kolkata. */
export function eventStart(document: Invitation): Date {
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const input = document.fields.date.trim().replace(/^(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s*/i, '');
  let year: number, month: number, day: number;
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
  const english = /^(?:(\d{1,2})\s+([a-z]+)|([a-z]+)\s+(\d{1,2})),?\s+(\d{4})$/i.exec(input);
  if (iso) [, year, month, day] = iso.map(Number);
  else if (english) { year = Number(english[5]); month = months.indexOf((english[2] || english[3]).toLowerCase()) + 1; day = Number(english[1] || english[4]); }
  else throw new Error('Use an ISO date (YYYY-MM-DD) or an English date such as 28 November 2026 for the calendar.');
  const test = new Date(Date.UTC(year, month - 1, day));
  if (year < 1900 || year > 2200 || month < 1 || test.getUTCFullYear() !== year || test.getUTCMonth() !== month - 1 || test.getUTCDate() !== day) throw new Error('Enter a valid calendar date.');
  const time = /^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?(?=$|\s|[·–-])/i.exec(document.fields.time.trim());
  if (!time) throw new Error('Enter an event time such as 7:00 PM (Asia/Kolkata) for the calendar.');
  let hour = Number(time[1]);
  const minute = Number(time[2]);
  if (minute > 59 || hour > (time[3] ? 12 : 23) || (time[3] && hour === 0)) throw new Error('Enter a valid event time.');
  if (time[3]) hour = hour % 12 + (time[3].toUpperCase() === 'PM' ? 12 : 0);
  return new Date(Date.UTC(year, month - 1, day, hour, minute) - 330 * 60_000);
}

export const calendarStamp = (date: Date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
export const calendarEscape = (value: string) => value.replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');

/** RFC 5545 lines are limited to 75 UTF-8 octets, including continuation space. */
export function foldCalendarLine(line: string): string {
  let result = '', size = 0;
  const encoder = new TextEncoder();
  for (const character of line) {
    const bytes = encoder.encode(character).length;
    if (size + bytes > 75) { result += '\r\n '; size = 1; }
    result += character; size += bytes;
  }
  return result;
}

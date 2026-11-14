/**
 * Interactive RSVP & Guest Management Data Model
 * Tracks guest attendance, ceremony-specific RSVPs, dietary needs, and stats.
 */

export interface RsvpSettings {
  enabled: boolean;
  deadline?: string;
  allowPlusOnes: boolean;
  maxPartySize: number;
  collectDietary: boolean;
  collectCeremonies: boolean;
  welcomeMessage?: string;
}

export type AttendanceStatus = 'attending' | 'declined' | 'tentative';

export type DietaryPreference = 'vegetarian' | 'jain' | 'swaminarayan' | 'non_vegetarian' | 'vegan' | 'none';

export interface RsvpResponse {
  id: string;
  guestName: string;
  phoneOrEmail: string;
  attending: AttendanceStatus;
  guestCount: number; // total party size
  ceremonies: string[]; // e.g. ['haldi', 'sangeet', 'shaadi']
  dietary: DietaryPreference;
  notes?: string;
  submittedAt: string;
}

export interface RsvpStats {
  totalResponses: number;
  attendingParties: number;
  declinedParties: number;
  tentativeParties: number;
  totalGuestsAttending: number;
  dietaryBreakdown: Record<DietaryPreference, number>;
  ceremonyAttendance: Record<string, number>;
}

export const DEFAULT_RSVP_SETTINGS: RsvpSettings = {
  enabled: true,
  allowPlusOnes: true,
  maxPartySize: 6,
  collectDietary: true,
  collectCeremonies: true,
  welcomeMessage: 'We eagerly look forward to celebrating with you! Please let us know your plans below.',
};

/**
 * Calculates aggregate RSVP metrics for the host dashboard.
 */
export function calculateRsvpStats(responses: RsvpResponse[] = []): RsvpStats {
  const stats: RsvpStats = {
    totalResponses: responses.length,
    attendingParties: 0,
    declinedParties: 0,
    tentativeParties: 0,
    totalGuestsAttending: 0,
    dietaryBreakdown: {
      vegetarian: 0,
      jain: 0,
      swaminarayan: 0,
      non_vegetarian: 0,
      vegan: 0,
      none: 0,
    },
    ceremonyAttendance: {},
  };

  for (const r of responses) {
    if (r.attending === 'attending') {
      stats.attendingParties += 1;
      const count = Math.max(1, r.guestCount || 1);
      stats.totalGuestsAttending += count;

      // Dietary
      const diet = r.dietary || 'none';
      stats.dietaryBreakdown[diet] = (stats.dietaryBreakdown[diet] || 0) + count;

      // Ceremonies
      if (Array.isArray(r.ceremonies)) {
        for (const c of r.ceremonies) {
          stats.ceremonyAttendance[c] = (stats.ceremonyAttendance[c] || 0) + count;
        }
      }
    } else if (r.attending === 'declined') {
      stats.declinedParties += 1;
    } else {
      stats.tentativeParties += 1;
    }
  }

  return stats;
}

/**
 * Generates an RFC-4180 compliant CSV of the guest list with formula injection prevention.
 */
export function exportRsvpToCsv(responses: RsvpResponse[] = [], _title: string = 'Wedding'): string {
  // Prevent CSV Formula Injection by prepending single quote if field starts with [=, +, -, @, \t, \r]
  const sanitize = (val: string | number | undefined | null): string => {
    if (val === undefined || val === null) return '""';
    let str = String(val).trim();
    if (/^[=+\-@\t\r]/.test(str)) {
      str = `'${str}`;
    }
    return `"${str.replace(/"/g, '""')}"`;
  };

  const headers = [
    'Guest Name',
    'Contact (Phone/Email)',
    'Status',
    'Total Attending',
    'Dietary Preference',
    'Ceremonies Attending',
    'Blessings / Notes',
    'Response Date',
  ];

  const rows = responses.map(r => [
    sanitize(r.guestName),
    sanitize(r.phoneOrEmail),
    sanitize(r.attending === 'attending' ? 'Attending' : r.attending === 'declined' ? 'Declined' : 'Tentative'),
    sanitize(r.attending === 'attending' ? r.guestCount : 0),
    sanitize(r.dietary ? r.dietary.replace('_', ' ') : 'None'),
    sanitize(r.ceremonies && r.ceremonies.length > 0 ? r.ceremonies.join(', ') : 'All Events'),
    sanitize(r.notes || ''),
    sanitize(r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : ''),
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
}

/**
 * Realistic dummy RSVP data for Indian wedding demonstrations.
 */
export function generateSampleRsvpResponses(): RsvpResponse[] {
  return [
    {
      id: 'rsvp_1',
      guestName: 'Rajesh & Sunita Sharma',
      phoneOrEmail: '+91 98201 12345',
      attending: 'attending',
      guestCount: 4,
      ceremonies: ['haldi', 'sangeet', 'shaadi'],
      dietary: 'vegetarian',
      notes: 'Hearty congratulations to the couple! Very excited to join.',
      submittedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'rsvp_2',
      guestName: 'Kailash Chand Jain & Family',
      phoneOrEmail: 'kailash.jain@example.com',
      attending: 'attending',
      guestCount: 5,
      ceremonies: ['sangeet', 'shaadi'],
      dietary: 'jain',
      notes: 'Sadar Jai Jinendra. Best wishes to both families.',
      submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'rsvp_3',
      guestName: 'Vikram & Priya Singhania',
      phoneOrEmail: '+91 98110 54321',
      attending: 'attending',
      guestCount: 2,
      ceremonies: ['mehndi', 'sangeet', 'shaadi'],
      dietary: 'vegetarian',
      notes: 'Cannot wait for the Sangeet dance night!',
      submittedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'rsvp_4',
      guestName: 'Anand Mehta',
      phoneOrEmail: 'anand.mehta@example.com',
      attending: 'declined',
      guestCount: 0,
      ceremonies: [],
      dietary: 'none',
      notes: 'Traveling overseas for a prior commitment. Sending lots of love & blessings.',
      submittedAt: new Date(Date.now() - 43200000).toISOString(),
    },
    {
      id: 'rsvp_5',
      guestName: 'Rameshwar Dayal Gupta & Family',
      phoneOrEmail: '+91 94140 98765',
      attending: 'attending',
      guestCount: 3,
      ceremonies: ['haldi', 'shaadi'],
      dietary: 'swaminarayan',
      notes: 'Shubh Vivah ki dheron shubhkaamnayein!',
      submittedAt: new Date(Date.now() - 21600000).toISOString(),
    },
  ];
}

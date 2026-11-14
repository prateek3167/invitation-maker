'use client';
import { useEffect, useRef, useState } from 'react';
import {
  Users,
  CheckCircle2,
  XCircle,
  Share2,
  Download,
  Plus,
  Trash2,
  Utensils,
  Sparkles,
  Settings,
  Search,
  X,
} from 'lucide-react';
import type { Invitation } from '../../../../packages/editor-core/document';
import type { CanvasElement } from '../../../../packages/editor-core/canvas';
import {
  calculateRsvpStats,
  exportRsvpToCsv,
  generateSampleRsvpResponses,
  DEFAULT_RSVP_SETTINGS,
  type RsvpResponse,
  type RsvpSettings,
  type AttendanceStatus,
  type DietaryPreference,
} from '../../../../packages/editor-core/rsvp';
import {
  getGuestInviteUrl,
  generateGoogleCalendarUrl,
} from '../../lib/share';

interface GuestManagerProps {
  document: Invitation;
  elements?: CanvasElement[];
  onUpdateDocument: (patch: Partial<Invitation>) => void;
  onUpdateElements?: (elements: CanvasElement[]) => void;
  onClose: () => void;
}

export default function GuestManager({
  document: doc,
  onUpdateDocument,
  onClose,
}: GuestManagerProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { const node = dialog.current; node?.showModal(); return () => node?.close(); }, []);
  const [activeTab, setActiveTab] = useState<'guests' | 'share' | 'settings'>('guests');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New guest state for offline entry
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestContact, setNewGuestContact] = useState('');
  const [newGuestStatus, setNewGuestStatus] = useState<AttendanceStatus>('attending');
  const [newGuestCount, setNewGuestCount] = useState(2);
  const [newGuestDietary, setNewGuestDietary] = useState<DietaryPreference>('vegetarian');
  const [newGuestNotes, setNewGuestNotes] = useState('');

  const rsvpSettings: RsvpSettings = doc.rsvpSettings || DEFAULT_RSVP_SETTINGS;
  const responses: RsvpResponse[] = doc.rsvpResponses || [];
  const stats = calculateRsvpStats(responses);

  const inviteUrl = getGuestInviteUrl(doc);
  let calendarUrl: string | undefined;
  try { calendarUrl = generateGoogleCalendarUrl(doc); } catch { /* Invalid dates stay editable. */ }

  // Handle adding offline guest
  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim()) return;

    const newResponse: RsvpResponse = {
      id: `rsvp_${Date.now()}`,
      guestName: newGuestName.trim(),
      phoneOrEmail: newGuestContact.trim() || 'Offline RSVP',
      attending: newGuestStatus,
      guestCount: newGuestStatus === 'attending' ? Number(newGuestCount) : 0,
      ceremonies: ['haldi', 'sangeet', 'shaadi'],
      dietary: newGuestDietary,
      notes: newGuestNotes.trim(),
      submittedAt: new Date().toISOString(),
    };

    onUpdateDocument({
      rsvpResponses: [newResponse, ...responses],
    });

    setNewGuestName('');
    setNewGuestContact('');
    setNewGuestNotes('');
    setShowAddModal(false);
  };

  // Delete guest
  const handleDeleteGuest = (id: string) => {
    onUpdateDocument({
      rsvpResponses: responses.filter(r => r.id !== id),
    });
  };

  // Populate sample demo responses if empty
  const handleLoadSamples = () => {
    onUpdateDocument({
      rsvpResponses: generateSampleRsvpResponses(),
    });
  };

  // Export CSV
  const handleExportCsv = () => {
    const csv = exportRsvpToCsv(responses, doc.title || 'Wedding');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(doc.title || 'wedding').replace(/\s+/g, '_')}_guest_list.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredResponses = responses.filter(r => {
    const matchesSearch =
      r.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phoneOrEmail.toLowerCase().includes(searchQuery.toLowerCase());
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && r.attending === statusFilter;
  });

  return (
    <dialog ref={dialog} className="guest-manager-overlay" aria-label="Guest manager" onCancel={event => { event.preventDefault(); event.stopPropagation(); onClose(); }} style={{ margin: 0, border: 0, width: '100vw', height: '100dvh', maxWidth: 'none', maxHeight: 'none' }}>
      <div className="guest-manager-dialog">
        {/* Header */}
        <div className="guest-manager-header">
          <div className="header-title-box">
            <div className="header-icon-badge">
              <Users size={20} />
            </div>
            <div>
              <h2>Guest Management &amp; RSVP</h2>
              <p>Manage manual guest entries, dietary choices and ceremony attendance</p>
            </div>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Top Summary Stat Cards */}
        <div className="guest-stats-strip">
          <div className="stat-card">
            <div className="stat-icon-wrap attending">
              <CheckCircle2 size={18} />
            </div>
            <div className="stat-content">
              <strong>{stats.totalGuestsAttending}</strong>
              <span>Confirmed Guests</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap responses">
              <Users size={18} />
            </div>
            <div className="stat-content">
              <strong>{stats.totalResponses}</strong>
              <span>Total Parties</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap declined">
              <XCircle size={18} />
            </div>
            <div className="stat-content">
              <strong>{stats.declinedParties}</strong>
              <span>Declined</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap dietary">
              <Utensils size={18} />
            </div>
            <div className="stat-content">
              <strong>{stats.dietaryBreakdown.jain + stats.dietaryBreakdown.vegetarian}</strong>
              <span>Veg / Jain Meals</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="guest-manager-tabs">
          <button
            type="button"
            className={activeTab === 'guests' ? 'active' : ''}
            onClick={() => setActiveTab('guests')}
          >
            <Users size={15} />
            <span>Guest List ({responses.length})</span>
          </button>
          <button
            type="button"
            className={activeTab === 'share' ? 'active' : ''}
            onClick={() => setActiveTab('share')}
          >
            <Share2 size={15} />
            <span>Device preview &amp; calendar</span>
          </button>
          <button
            type="button"
            className={activeTab === 'settings' ? 'active' : ''}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={15} />
            <span>RSVP Settings</span>
          </button>
        </div>

        {/* TAB 1: GUEST LIST */}
        {activeTab === 'guests' && (
          <div className="guest-tab-content">
            <div className="guest-actions-bar">
              <div className="search-wrap">
                <Search size={14} />
                <input
                  type="text"
                  aria-label="Search guests" placeholder="Search guests by name or contact…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="filter-select-wrap">
                <select aria-label="Guest attendance filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="all">All Responses</option>
                  <option value="attending">Attending</option>
                  <option value="declined">Declined</option>
                  <option value="tentative">Tentative</option>
                </select>
              </div>

              <button
                type="button"
                className="button secondary sm"
                onClick={handleExportCsv}
                disabled={responses.length === 0}
              >
                <Download size={14} /> Export CSV
              </button>

              <button
                type="button"
                className="button sm"
                onClick={() => setShowAddModal(true)}
              >
                <Plus size={14} /> Add Guest
              </button>
            </div>

            {/* Guest Table or Empty State */}
            {responses.length === 0 ? (
              <div className="guest-empty-box">
                <Users size={36} />
                <h3>No RSVPs Received Yet</h3>
                <p>Record guests manually or load clearly marked sample entries to test the dashboard.</p>
                <button type="button" className="button secondary" onClick={handleLoadSamples}>
                  <Sparkles size={14} /> Load 5 Sample Indian Wedding RSVPs
                </button>
              </div>
            ) : filteredResponses.length === 0 ? (
              <div className="guest-empty-box">
                <Search size={28} />
                <p>No guests match your search criteria.</p>
              </div>
            ) : (
              <div className="guest-table-wrapper">
                <table className="guest-table">
                  <thead>
                    <tr>
                      <th>Guest Name</th>
                      <th>Contact</th>
                      <th>Status</th>
                      <th>Party Size</th>
                      <th>Dietary</th>
                      <th>Ceremonies</th>
                      <th>Notes</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResponses.map(r => (
                      <tr key={r.id}>
                        <td>
                          <strong>{r.guestName}</strong>
                        </td>
                        <td>
                          <span className="contact-text">{r.phoneOrEmail}</span>
                        </td>
                        <td>
                          <span className={`status-pill ${r.attending}`}>
                            {r.attending === 'attending' && '✓ Attending'}
                            {r.attending === 'declined' && '✗ Declined'}
                            {r.attending === 'tentative' && '? Tentative'}
                          </span>
                        </td>
                        <td>
                          <strong>{r.attending === 'attending' ? `${r.guestCount} guests` : '—'}</strong>
                        </td>
                        <td>
                          <span className="dietary-badge">
                            {r.dietary ? r.dietary.replace('_', ' ') : 'None'}
                          </span>
                        </td>
                        <td>
                          <div className="ceremony-tag-list">
                            {r.ceremonies && r.ceremonies.length > 0 ? (
                              r.ceremonies.map(c => (
                                <span key={c} className="ceremony-tag">
                                  {c}
                                </span>
                              ))
                            ) : (
                              <span className="ceremony-tag">All</span>
                            )}
                          </div>
                        </td>
                        <td className="notes-cell" title={r.notes || ''}>
                          {r.notes || '—'}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="del-guest-btn"
                            onClick={() => handleDeleteGuest(r.id)}
                            title="Remove response"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'share' && (
          <div className="guest-tab-content">
            <h3>Device preview and calendar</h3>
            <p role="status">Online publishing and guest RSVP delivery are not connected. Invitations remain private drafts. This preview works only in the browser where the draft is saved; do not send its address to guests.</p>
            <a href={inviteUrl} target="_blank" rel="noopener noreferrer" className="button secondary">Open device preview</a>
            {calendarUrl ? <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="button secondary">Add to Google Calendar (India time)</a> : <p>Enter an English or ISO date and a time such as 7:00 PM to enable the calendar.</p>}
            <p>Guest entries and CSV exports are managed manually. Online RSVP collection requires a future publishing service.</p>
          </div>
        )}

        {/* TAB 3: RSVP SETTINGS */}
        {activeTab === 'settings' && (
          <div className="guest-tab-content rsvp-settings-grid">
            <label className="settings-toggle-row">
              <div>
                <strong>Enable Online RSVP Collection</strong>
                <span>Allow guests to RSVP directly through their digital invitation</span>
              </div>
              <input
                type="checkbox"
                checked={rsvpSettings.enabled}
                onChange={e =>
                  onUpdateDocument({
                    rsvpSettings: { ...rsvpSettings, enabled: e.target.checked },
                  })
                }
              />
            </label>

            <label className="settings-toggle-row">
              <div>
                <strong>Collect Dietary Preferences</strong>
                <span>Ask guests if they require Pure Vegetarian, Jain, or Swaminarayan catering</span>
              </div>
              <input
                type="checkbox"
                checked={rsvpSettings.collectDietary}
                onChange={e =>
                  onUpdateDocument({
                    rsvpSettings: { ...rsvpSettings, collectDietary: e.target.checked },
                  })
                }
              />
            </label>

            <label className="settings-toggle-row">
              <div>
                <strong>Collect Ceremony Attendance</strong>
                <span>Allow guests to check individual events (Haldi, Mehndi, Sangeet, Shaadi)</span>
              </div>
              <input
                type="checkbox"
                checked={rsvpSettings.collectCeremonies}
                onChange={e =>
                  onUpdateDocument({
                    rsvpSettings: { ...rsvpSettings, collectCeremonies: e.target.checked },
                  })
                }
              />
            </label>

            <div className="settings-fields-two-col">
              <label className="field">
                Maximum Guests Per Party
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={rsvpSettings.maxPartySize}
                  onChange={e =>
                    onUpdateDocument({
                      rsvpSettings: { ...rsvpSettings, maxPartySize: Number(e.target.value) },
                    })
                  }
                />
              </label>

              <label className="field">
                RSVP Deadline Date
                <input
                  type="date"
                  value={rsvpSettings.deadline || ''}
                  onChange={e =>
                    onUpdateDocument({
                      rsvpSettings: { ...rsvpSettings, deadline: e.target.value },
                    })
                  }
                />
              </label>
            </div>

            <label className="field">
              Welcome / Blessing Prompt
              <textarea
                rows={2}
                value={rsvpSettings.welcomeMessage || ''}
                onChange={e =>
                  onUpdateDocument({
                    rsvpSettings: { ...rsvpSettings, welcomeMessage: e.target.value },
                  })
                }
              />
            </label>
          </div>
        )}

        {/* MODAL: ADD OFFLINE GUEST */}
        {showAddModal && (
          <div className="add-guest-modal-overlay">
            <div className="add-guest-modal">
              <div className="dialog-top">
                <h3>Record Offline Guest RSVP</h3>
                <button type="button" aria-label="Cancel guest entry" onClick={() => setShowAddModal(false)}>
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleAddGuest}>
                <label className="field">
                  Guest / Family Name *
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar & Family"
                    value={newGuestName}
                    onChange={e => setNewGuestName(e.target.value)}
                  />
                </label>

                <div className="two-col-grid">
                  <label className="field">
                    Contact Phone / Email
                    <input
                      type="text"
                      placeholder="+91 98765 43210"
                      value={newGuestContact}
                      onChange={e => setNewGuestContact(e.target.value)}
                    />
                  </label>

                  <label className="field">
                    Attendance Status
                    <select
                      value={newGuestStatus}
                      onChange={e => setNewGuestStatus(e.target.value as AttendanceStatus)}
                    >
                      <option value="attending">Attending</option>
                      <option value="declined">Declined</option>
                      <option value="tentative">Tentative</option>
                    </select>
                  </label>
                </div>

                {newGuestStatus === 'attending' && (
                  <div className="two-col-grid">
                    <label className="field">
                      Total Attending Count
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={newGuestCount}
                        onChange={e => setNewGuestCount(Number(e.target.value))}
                      />
                    </label>

                    <label className="field">
                      Dietary Preference
                      <select
                        value={newGuestDietary}
                        onChange={e => setNewGuestDietary(e.target.value as DietaryPreference)}
                      >
                        <option value="vegetarian">Pure Vegetarian</option>
                        <option value="jain">Jain (No Root Veg)</option>
                        <option value="swaminarayan">Swaminarayan</option>
                        <option value="non_vegetarian">Non-Vegetarian</option>
                        <option value="none">No Preference</option>
                      </select>
                    </label>
                  </div>
                )}

                <label className="field">
                  Blessings / Notes
                  <textarea
                    rows={2}
                    placeholder="Warm wishes or seating notes…"
                    value={newGuestNotes}
                    onChange={e => setNewGuestNotes(e.target.value)}
                  />
                </label>

                <div className="dialog-actions">
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="button">
                    Save Guest RSVP
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
}

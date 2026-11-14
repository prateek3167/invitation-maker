'use client';
import { useState } from 'react';
import {
  Users,
  CheckCircle2,
  XCircle,
  Share2,
  Download,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  MessageCircle,
  Calendar,
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
  generateWhatsAppShareUrl,
  generateGoogleCalendarUrl,
} from '../../lib/share';
import { generateQrCodeSvg, generateQrCodeDataUrl } from '../../lib/qrcode';

interface GuestManagerProps {
  document: Invitation;
  elements?: CanvasElement[];
  onUpdateDocument: (patch: Partial<Invitation>) => void;
  onUpdateElements?: (elements: CanvasElement[]) => void;
  onClose: () => void;
}

export default function GuestManager({
  document: doc,
  elements = [],
  onUpdateDocument,
  onUpdateElements,
  onClose,
}: GuestManagerProps) {
  const [activeTab, setActiveTab] = useState<'guests' | 'share' | 'settings'>('guests');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

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
  const qrSvg = generateQrCodeSvg(inviteUrl, {
    size: 200,
    color: doc.palette[0] || '#541212',
    includeCenterBadge: true,
  });

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

  // Add QR Code element to card canvas
  const handleAddQrToCanvas = () => {
    if (!onUpdateElements) return;
    const qrDataUrl = generateQrCodeDataUrl(inviteUrl, {
      size: 160,
      color: doc.palette[0] || '#541212',
      includeCenterBadge: true,
    });
    const maxZ = Math.max(...elements.map(e => e.zIndex || 0), 0);
    const newEl: CanvasElement = {
      id: `el_qr_${Date.now()}`,
      type: 'image',
      name: 'RSVP QR Code',
      x: 520,
      y: 810,
      width: 110,
      height: 110,
      src: qrDataUrl,
      frameShape: 'rect',
      zIndex: maxZ + 1,
    };
    onUpdateElements([...elements, newEl]);
  };

  // Copy share link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Filtered responses
  const filteredResponses = responses.filter(r => {
    const matchesSearch =
      r.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phoneOrEmail.toLowerCase().includes(searchQuery.toLowerCase());
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && r.attending === statusFilter;
  });

  return (
    <div className="guest-manager-overlay">
      <div className="guest-manager-dialog">
        {/* Header */}
        <div className="guest-manager-header">
          <div className="header-title-box">
            <div className="header-icon-badge">
              <Users size={20} />
            </div>
            <div>
              <h2>Guest Management &amp; RSVP</h2>
              <p>Track attendance, dietary choices, ceremony RSVPs &amp; share invitation</p>
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
            <span>Share &amp; QR Code</span>
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
                  placeholder="Search guests by name or contact…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="filter-select-wrap">
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
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
                <p>Share your digital invitation link or load sample guests to test the dashboard.</p>
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

        {/* TAB 2: SHARE & QR CODE */}
        {activeTab === 'share' && (
          <div className="guest-tab-content share-tab-grid">
            {/* Left: QR Code Showcase */}
            <div className="share-qr-card">
              <div
                className="qr-code-svg-wrap"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
              <span className="qr-caption">Scan to view Digital Invitation &amp; RSVP</span>

              <div className="qr-actions-row">
                <button
                  type="button"
                  className="button secondary sm"
                  onClick={handleAddQrToCanvas}
                >
                  <Plus size={14} /> Add QR to Canvas
                </button>

                <a
                  href={`data:image/svg+xml;utf8,${encodeURIComponent(qrSvg)}`}
                  download={`${(doc.title || 'wedding').replace(/\s+/g, '_')}_qr.svg`}
                  className="button secondary sm"
                >
                  <Download size={14} /> Download SVG
                </a>
              </div>
            </div>

            {/* Right: Sharing Intents */}
            <div className="share-links-card">
              <h3>1-Click Invitation Links</h3>
              <p>Send your invitation suite directly to guests on WhatsApp or social networks.</p>

              <div className="share-link-input-group">
                <input type="text" readOnly value={inviteUrl} />
                <button type="button" className="button sm" onClick={handleCopyLink}>
                  <Copy size={13} /> {copiedLink ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div className="share-buttons-stack">
                <a
                  href={generateWhatsAppShareUrl(doc)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="share-channel-btn whatsapp"
                >
                  <MessageCircle size={18} />
                  <div>
                    <strong>Share on WhatsApp</strong>
                    <small>Pre-formatted auspicious greeting &amp; RSVP link</small>
                  </div>
                  <ExternalLink size={14} />
                </a>

                <a
                  href={generateGoogleCalendarUrl(doc)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="share-channel-btn calendar"
                >
                  <Calendar size={18} />
                  <div>
                    <strong>Add to Google Calendar</strong>
                    <small>1-click calendar invite for family &amp; friends</small>
                  </div>
                  <ExternalLink size={14} />
                </a>

                <a
                  href={inviteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="share-channel-btn preview"
                >
                  <ExternalLink size={18} />
                  <div>
                    <strong>Open Live Guest Invitation Page</strong>
                    <small>Preview the responsive mobile-friendly RSVP hub</small>
                  </div>
                </a>
              </div>
            </div>
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
                <button type="button" onClick={() => setShowAddModal(false)}>
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
    </div>
  );
}

'use client';
import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Check, Cloud, Copy, FolderHeart, LoaderCircle, LogOut, Plus, Save, ShieldCheck, Trash2 } from 'lucide-react';
import { occasions, templates as seedTemplates, type Invitation } from '../../../packages/editor-core/document';
import { api, saveAccountInvitation, type AccountInfo, type EventProject } from '../lib/account-api';
import { listDrafts } from '../lib/storage';
import Editor from './editor';
import Dialog from './dialog';
import AuthForm from './auth-form';
import AccountSettings from './account-settings';
import ExportHistory from './export-history';
import { loadCatalog } from '../lib/catalog-api';
import InvitationPreview from './invitation-preview';

export default function AccountWorkspace() {
  const [templates, setTemplates] = useState(seedTemplates);
  useEffect(() => { void loadCatalog().then(setTemplates).catch(() => {}); }, []);
  const [exportsOpen, setExportsOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [events, setEvents] = useState<EventProject[]>([]), [selected, setSelected] = useState<EventProject | null>(null);
  const [loading, setLoading] = useState(true), [busy, setBusy] = useState(false);
  const [error, setError] = useState(''), [notice, setNotice] = useState('');
  const [createOpen, setCreateOpen] = useState(false), [eventTitle, setEventTitle] = useState(''), [occasion, setOccasion] = useState('Wedding');
  const [templateId, setTemplateId] = useState(templates[0].id), [editor, setEditor] = useState<Invitation | null>(null);
  const [localDrafts, setLocalDrafts] = useState<Invitation[]>([]), [importId, setImportId] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'event' | 'card'; id: string; title: string } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false), [sharedHost, setSharedHost] = useState(''), [sharedPartner, setSharedPartner] = useState(''), [sharedVenue, setSharedVenue] = useState('');

  const loadEvents = useCallback(async () => { const data = await api<{ projects: EventProject[] }>('/api/v1/projects'); setEvents(data.projects); }, []);
  const openEvent = useCallback(async (id: string) => { const data = await api<{ project: EventProject }>(`/api/v1/projects/${id}`); setSelected(data.project); }, []);
  useEffect(() => {
    let alive = true;
    api<AccountInfo>('/api/v1/auth/me').then(async info => { if (!alive) return; setAccount(info); if (info.user?.emailVerified) await loadEvents(); })
      .catch(e => { if (alive) setError(e.message); }).finally(() => { if (alive) setLoading(false); });
    void listDrafts().then(d => { if (alive) { setLocalDrafts(d); setImportId(d[0]?.id || ''); } }).catch(() => {});
    return () => { alive = false; };
  }, [loadEvents]);
  const action = async (operation: () => Promise<void>) => {
    setBusy(true); setError(''); setNotice('');
    try { await operation(); } catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong. Please retry.'); } finally { setBusy(false); }
  };
  const refreshSelected = useCallback(() => {
    void loadEvents().catch(e => setError(e.message));
    if (selected) void openEvent(selected.id).catch(e => setError(e.message));
  }, [loadEvents, openEvent, selected?.id]);

  return <>
    <header className="account-header"><a href="/" className="text-button"><ArrowLeft size={17} />Back to designs</a><span className="footer-brand"><Cloud size={20} />Your account studio</span>{account?.user && <button className="text-button" disabled={busy} onClick={() => { void action(async () => { await api('/api/auth/sign-out', 'POST', {}); setAccount({ ...account, user: null }); setEvents([]); setSelected(null); }); }}><LogOut size={16} />Sign out</button>}</header>
    <main className="account-main">
      {loading ? <div className="empty-state" role="status"><LoaderCircle className="spin" /><p>Opening your account studio…</p></div> : (!account?.user || !account.user.emailVerified) ? <section className="auth-layout">
        <div className="auth-intro"><span className="eyebrow">EVERY CELEBRATION, TOGETHER</span><h1>Your ideas deserve<br />a place to belong.</h1><p>Create event collections, keep multiple invitations together, and come back to your designs from your account.</p><div className="auth-benefits"><span><ShieldCheck size={18} />Private projects, protected by your account.</span><span><FolderHeart size={18} />One event. Every invitation.</span><span><Check size={18} />Your device drafts stay untouched.</span></div><p className="field-help">{account?.capabilities.database === 'embedded-local' ? 'This development instance stores account data on this computer’s server. It is not an externally hosted cloud service.' : 'Account projects are stored on the configured server.'}</p></div>
        <AuthForm capabilities={account?.capabilities} initialError={error} onAuthenticated={async () => { const info = await api<AccountInfo>('/api/v1/auth/me'); setAccount(info); await loadEvents(); }} />
      </section> : <>
        <div className="section-heading"><div><span className="eyebrow">YOUR MOMENTS, ALL TOGETHER</span><h1>Your event studio.</h1><p>Welcome, {account.user.name}. Give every celebration a home.</p></div>{account.user.role === 'admin' && <a className="button secondary" href="/admin">Template publishing</a>}<button className="button secondary" onClick={() => setExportsOpen(true)}>Export history</button><button className="button secondary" onClick={() => setSecurityOpen(true)}>Account &amp; security</button><button className="button" onClick={() => { setEventTitle(''); setCreateOpen(true); }}><Plus size={16} />New event</button></div>
        <div className="storage-note"><ShieldCheck size={18} /><p><strong>Account workspace.</strong> {account.capabilities.database === 'embedded-local' ? 'Saved on this development server’s disk, protected by your account.' : 'Saved to the configured PostgreSQL server, protected by your account.'} Device drafts remain separate.</p></div>
        {error && <p className="error-box" role="alert">{error}</p>}{notice && <p className="notice" role="status">{notice}</p>}
        <div className="event-workspace"><aside className="event-list" aria-label="Your events"><h2>Event collections <span>{events.length}</span></h2>{events.length === 0 ? <p className="field-help">Create your first event to start collecting invitations.</p> : events.map(event => <button className={`event-item ${selected?.id === event.id ? 'selected' : ''}`} key={event.id} onClick={() => { void action(() => openEvent(event.id)); }}><FolderHeart size={19} /><span><strong>{event.title}</strong><small>{event.occasion} · {event.cardCount} {event.cardCount === 1 ? 'invitation' : 'invitations'}</small></span><ArrowUpRight size={15} /></button>)}</aside>
          <section className="event-detail" aria-label="Selected event">
            {!selected ? <div className="empty-state"><FolderHeart size={36} /><h2>Every detail starts here.</h2><p>{events.length ? 'Choose an event to see its invitations.' : 'Create an event for your wedding, birthday or next big beginning.'}</p><button className="button secondary" onClick={() => setCreateOpen(true)}>Create an event <Plus size={16} /></button></div> : <>
              <div className="event-title"><div><span className="eyebrow">{selected.occasion.toUpperCase()}</span><h2>{selected.title}</h2><p>{selected.invitations?.length || 0} invitations · saved to your account</p></div><div className="event-actions"><button className="button secondary" onClick={() => { setEventTitle(selected.title); setSharedHost(selected.sharedDetails.host || ''); setSharedPartner(selected.sharedDetails.partner || ''); setSharedVenue(selected.sharedDetails.venue || ''); setSettingsOpen(true); }}>Event details</button><button className="icon-button danger" aria-label={`Delete event ${selected.title}`} onClick={() => setDeleteTarget({ type: 'event', id: selected.id, title: selected.title })}><Trash2 size={17} /></button></div></div>
              <form className="add-card-row" onSubmit={e => { e.preventDefault(); void action(async () => { const result = await api<{ invitation: Invitation }>(`/api/v1/projects/${selected.id}/invitations`, 'POST', { templateId }); await openEvent(selected.id); await loadEvents(); setEditor(result.invitation); }); }}><label className="field">Add a design to this event<select value={templateId} onChange={e => setTemplateId(e.target.value)}>{occasions.map(cat => <optgroup key={cat} label={cat}>{templates.filter(t => t.occasion === cat).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</optgroup>)}</select></label><button className="button" disabled={busy || (selected.invitations?.length || 0) >= 20}><Plus size={16} />Add invitation</button></form>
              <div className="account-card-grid">{selected.invitations?.map(card => <article className="project-card" key={card.id}><button className="project-art" onClick={() => setEditor(card)} aria-label={`Edit account invitation ${card.title}`}><InvitationPreview document={card} /></button><div className="project-meta"><h3>{card.title || 'Untitled invitation'}</h3><p>Revision {card.revision}</p><div className="project-actions"><button onClick={() => setEditor(card)}>Continue editing <ArrowUpRight size={15} /></button><button className="icon-button" aria-label={`Duplicate account invitation ${card.title}`} disabled={busy} onClick={() => { void action(async () => { await api(`/api/v1/projects/${selected.id}/invitations`, 'POST', { document: { ...card, title: `${card.title.slice(0, 110)} (copy)` } }); await openEvent(selected.id); await loadEvents(); }); }}><Copy size={15} /></button><button className="icon-button" aria-label={`Delete account invitation ${card.title}`} onClick={() => setDeleteTarget({ type: 'card', id: card.id, title: card.title })}><Trash2 size={15} /></button></div></div></article>)}</div>
              {localDrafts.length > 0 && <form className="import-panel" onSubmit={e => { e.preventDefault(); void action(async () => { const document = localDrafts.find(d => d.id === importId); if (!document) return; await api(`/api/v1/projects/${selected.id}/invitations`, 'POST', { document }); await openEvent(selected.id); await loadEvents(); setNotice('Copied to this event. Your original device draft is unchanged.'); }); }}><h3>Bring a device draft into this event</h3><p>This makes a separate account copy, including its photo. The original stays in this browser.</p><div className="add-card-row"><label className="field">Device draft<select value={importId} onChange={e => setImportId(e.target.value)}>{localDrafts.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}</select></label><button className="button secondary" disabled={busy}><Copy size={16} />Copy to account</button></div></form>}
            </>}
          </section>
        </div>
      </>}
    </main>
    {exportsOpen && <ExportHistory onClose={() => setExportsOpen(false)} />}
    {securityOpen && account?.user && <AccountSettings account={account} onClose={() => setSecurityOpen(false)} onRefresh={async () => setAccount(await api<AccountInfo>('/api/v1/auth/me'))} />}
    {createOpen && <Dialog title="A home for your next celebration." onClose={() => { if (!busy) setCreateOpen(false); }}><form onSubmit={e => { e.preventDefault(); void action(async () => { const result = await api<{ project: EventProject }>('/api/v1/projects', 'POST', { title: eventTitle, occasion }); await loadEvents(); await openEvent(result.project.id); setCreateOpen(false); }); }}><label className="field">Event name<input required maxLength={120} value={eventTitle} onChange={e => setEventTitle(e.target.value)} placeholder="Aarav & Ananya’s wedding" /></label><label className="field">Occasion<select value={occasion} onChange={e => setOccasion(e.target.value)}>{occasions.map(o => <option key={o}>{o}</option>)}</select></label>{error && <p className="error-box" role="alert">{error}</p>}<button className="button full" disabled={busy}><Plus size={16} />Create event</button></form></Dialog>}
    {settingsOpen && selected && <Dialog title="The details that bring it together." onClose={() => { if (!busy) setSettingsOpen(false); }}><form onSubmit={e => { e.preventDefault(); void action(async () => { await api(`/api/v1/projects/${selected.id}`, 'PATCH', { title: eventTitle, revision: selected.revision, sharedDetails: { ...selected.sharedDetails, host: sharedHost, partner: sharedPartner, venue: sharedVenue } }); await loadEvents(); await openEvent(selected.id); setSettingsOpen(false); }); }}><label className="field">Event name<input required maxLength={120} value={eventTitle} onChange={e => setEventTitle(e.target.value)} /></label><label className="field">Shared first name / host<input maxLength={40} value={sharedHost} onChange={e => setSharedHost(e.target.value)} /></label><label className="field">Shared second name / detail<input maxLength={40} value={sharedPartner} onChange={e => setSharedPartner(e.target.value)} /></label><label className="field">Shared venue<input maxLength={120} value={sharedVenue} onChange={e => setSharedVenue(e.target.value)} /></label><p className="field-help">These defaults apply only to new invitations. Existing cards keep their own wording and edits.</p>{error && <p className="error-box" role="alert">{error}</p>}<button className="button full" disabled={busy}><Save size={16} />Save event details</button></form></Dialog>}
    {deleteTarget && <Dialog title={deleteTarget.type === 'event' ? 'Delete this event and its invitations?' : 'Delete this invitation?'} onClose={() => { if (!busy) setDeleteTarget(null); }}><p className="dialog-description">“{deleteTarget.title}” will be permanently removed from your account{deleteTarget.type === 'event' ? ', including all its invitations' : ''}. Device drafts and downloaded copies are unaffected.</p>{error && <p className="error-box" role="alert">{error}</p>}<div className="dialog-actions"><button className="button secondary" onClick={() => setDeleteTarget(null)}>Keep it</button><button className="button danger-button" disabled={busy} onClick={() => { void action(async () => { await api(`/api/v1/${deleteTarget.type === 'event' ? 'projects' : 'invitations'}/${deleteTarget.id}`, 'DELETE'); if (deleteTarget.type === 'event') setSelected(null); else if (selected) await openEvent(selected.id); await loadEvents(); setDeleteTarget(null); }); }}>Delete permanently</button></div></Dialog>}
    {editor && <Editor key={editor.id} initial={editor} storage="account" persistDocument={saveAccountInvitation} onSaved={refreshSelected} onClose={() => { setEditor(null); refreshSelected(); }} />}
  </>;
}

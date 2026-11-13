'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, CheckCheck, ChevronDown, Download, ImagePlus, LoaderCircle, RotateCcw, Save, SlidersHorizontal, Sparkles, Type, Upload, X } from 'lucide-react';
import { contentIssues, documentTemplate, presets, weddingEvents, type Fields, type Invitation, type Format } from '../../../packages/editor-core/document';
import { exportInvitation, readPhoto } from '../lib/export';
import { saveDraft } from '../lib/storage';
import Dialog from './dialog';
import InvitationPreview from './invitation-preview';
import { api } from '../lib/account-api';
import PortraitControls from './portrait-controls';

const labels: Record<keyof Fields, string> = { host: 'First name / host', partner: 'Second name / detail', heading: 'Event heading', date: 'Date', time: 'Time', venue: 'Venue / location', message: 'Your message' };
const palettes = [
  { name: 'Original', colors: null },
  { name: 'Royal Ruby & Gold', colors: ['#541212', '#fff8ee', '#d4af37'] },
  { name: 'Emerald & Gold', colors: ['#14382c', '#fff9ee', '#c5a059'] },
  { name: 'Turmeric & Marigold', colors: ['#7a450e', '#fffbe6', '#e5a00d'] },
  { name: 'Rose', colors: ['#613b49', '#fff0eb', '#ba7c78'] },
  { name: 'Sage', colors: ['#34453b', '#f2f2e4', '#8c9c78'] },
  { name: 'Midnight', colors: ['#182e43', '#f2eadc', '#ba9a62'] },
  { name: 'Clay', colors: ['#713e30', '#fff2df', '#c88e68'] },
];

export default function Editor({ initial, onClose, onSaved, persistDocument = saveDraft, storage = 'device' }: { initial: Invitation; onClose: () => void; onSaved: () => void; persistDocument?: (document: Invitation) => Promise<Invitation>; storage?: 'device' | 'account' }) {
  const savedLabel = storage === 'account' ? 'Saved to your account' : 'Saved on this device';
  const [doc, setDoc] = useState(initial);
  const [tab, setTab] = useState('details');
  const [status, setStatus] = useState(initial.revision ? savedLabel : 'Personalize to start your draft');
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [downloadType, setDownloadType] = useState<'png' | 'jpg' | 'pdf'>('png');
  const ref = useRef(doc); ref.current = doc;
  const revision = useRef(initial.revision);
  const change = useRef(0), savedChange = useRef(initial.revision ? 0 : -1);
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const alive = useRef(true);
  const history = useRef<Invitation[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const template = documentTemplate(doc);
  const issues = contentIssues(doc);

  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const update = (patch: Partial<Invitation>) => {
    history.current = [...history.current.slice(-29), ref.current];
    change.current++;
    const next = { ...ref.current, ...patch };
    ref.current = next; setDoc(next); setDirty(true); setError(''); setStatus('Unsaved changes');
  };
  const persist = useCallback((): Promise<Invitation> => {
    const task = queue.current.catch(() => {}).then(async () => {
      const version = change.current;
      if (savedChange.current === version && revision.current > 0) return { ...ref.current, revision: revision.current };
      if (alive.current) setStatus('Saving…');
      try {
        const saved = await persistDocument({ ...ref.current, revision: revision.current });
        revision.current = saved.revision; savedChange.current = version;
        if (alive.current && change.current === version) { ref.current = saved; setDoc(saved); }
        if (alive.current) { setDirty(change.current !== version); setStatus(change.current === version ? savedLabel : 'Unsaved changes'); onSaved(); }
        return saved;
      } catch (e) {
        if (alive.current) { setStatus('Not saved'); setError(e instanceof Error ? e.message : 'Could not save this draft.'); }
        throw e;
      }
    });
    queue.current = task;
    return task;
  }, [onSaved, persistDocument, savedLabel]);
  useEffect(() => {
    if (!dirty) return;
    const timer = setTimeout(() => { void persist().catch(() => {}); }, 800);
    return () => clearTimeout(timer);
  }, [doc, dirty, persist]);
  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => { if (change.current !== savedChange.current) event.preventDefault(); };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, []);
  const close = async () => {
    if (change.current !== savedChange.current && (dirty || initial.revision)) {
      try { await persist(); } catch { if (!window.confirm('This draft could not be saved. Leave and discard unsaved changes?')) return; }
    }
    onClose();
  };
  const upload = async (file?: File) => {
    if (!file) return;
    setUploading(true); setError('');
    try { const data = await readPhoto(file); if (alive.current) update({ photo: { data, x: 50, y: 50, zoom: 1 } }); }
    catch (e) { if (alive.current) setError(e instanceof Error ? e.message : 'That photo could not be opened.'); }
    finally { if (alive.current) setUploading(false); if (input.current) input.current.value = ''; }
  };
  const download = async () => {
    if (issues.length) return;
    setExporting(true); setError('');
    try { await exportInvitation(ref.current, downloadType); setDownloadOpen(false); setStatus(storage === 'account' ? 'Download ready · account draft' : 'Download ready · edits save on this device'); }
    catch (e) { setError(e instanceof Error ? e.message : 'Download failed. Please retry.'); }
    finally { setExporting(false); }
  };
  const queueExport = async () => {
    if (issues.length) return;
    setExporting(true); setError('');
    try {
      const saved = await persist();
      await api('/api/v1/exports', 'POST', { invitationId: saved.id, revision: saved.revision, format: downloadType, idempotencyKey: crypto.randomUUID() });
      setDownloadOpen(false); setStatus('Export queued · open Export history in your account');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not queue this export.'); }
    finally { setExporting(false); }
  };
  return <Dialog title={`Customize ${template.name}`} wide onClose={() => { void close(); }}>
    <div className="editor-shell">
      <header className="editor-header">
        <button className="text-button" aria-label="Back to studio" onClick={() => { void close(); }}><ArrowLeft size={18} /><span>Back to studio</span></button>
        <div className="editor-name"><strong>{template.name}</strong><span aria-live="polite"><span className={dirty ? 'status-dot pending' : 'status-dot'} />{status}</span></div>
        <div className="editor-header-actions"><button className="button secondary save-button" onClick={() => { void persist().catch(() => {}); }}><Save size={16} />Save</button><button className="button" onClick={() => setDownloadOpen(true)}><Download size={16} />Download</button></div>
      </header>
      <div className="editor-workspace">
        <aside className="editor-panel">
          <div className="editor-panel-heading"><span className="eyebrow">MAKE IT YOURS</span><h2>A few details.<br />A personal touch.</h2><p>Your changes appear on the invitation instantly.</p></div>
          <div className="editor-tabs" aria-label="Editor sections">{[{ id: 'details', label: 'Details', icon: Type }, { id: 'style', label: 'Design', icon: SlidersHorizontal }, ...(template.photo ? [{ id: 'photo', label: 'Photo', icon: ImagePlus }] : [])].map(t => <button key={t.id} className={tab === t.id ? 'selected' : ''} aria-pressed={tab === t.id} onClick={() => setTab(t.id)}><t.icon size={16} />{t.label}</button>)}</div>
          <div className="editor-fields">
            {tab === 'details' && <>
              {(template.royal || ['Wedding', 'Haldi', 'Mehndi', 'Sangeet', 'Engagement'].includes(template.occasion)) && <label className="field">Wedding event<select value={weddingEvents.find(event => doc.fields.heading.startsWith(event)) || ''} onChange={e => { if (e.target.value) update({ fields: { ...doc.fields, heading: `${e.target.value} Celebration` } }); }}><option value="">Custom event</option>{weddingEvents.map(event => <option key={event}>{event}</option>)}</select></label>}
              <label className="field">Draft name<input value={doc.title} maxLength={120} onChange={e => update({ title: e.target.value })} /></label>
              {(Object.keys(labels) as (keyof Fields)[]).map(key => <label className="field" key={key}>{template.royal && key === 'host' ? 'Bride name' : template.royal && key === 'partner' ? 'Groom name' : labels[key]}{key === 'message' ? <textarea maxLength={180} rows={3} value={doc.fields[key]} onChange={e => update({ fields: { ...doc.fields, [key]: e.target.value } })} /> : <input maxLength={key === 'venue' ? 120 : key === 'host' || key === 'partner' ? 40 : 65} value={doc.fields[key]} onChange={e => update({ fields: { ...doc.fields, [key]: e.target.value } })} />}</label>)}
            </>}
            {tab === 'style' && <>
              {template.royal && <p className="field-help">Color stories customize your lettering, portrait frames and stationery panel while preserving the original palace artwork.</p>}
              <div className="field">Color story<div className="palette-list">{palettes.map(p => <button key={p.name} className="palette-option" aria-pressed={JSON.stringify(doc.palette) === JSON.stringify(p.colors || template.palette)} onClick={() => update({ palette: p.colors ? [...p.colors] : [...template.palette] })}><span className="swatches">{(p.colors || template.palette).map(c => <i key={c} style={{ background: c }} />)}</span>{p.name}{JSON.stringify(doc.palette) === JSON.stringify(p.colors || template.palette) && <Check size={16} />}</button>)}</div></div>
              <label className="field">Typography<select value={doc.font} onChange={e => update({ font: e.target.value as Invitation['font'] })}><option value="serif">Timeless serif</option><option value="italic">Romantic italic</option><option value="modern">Modern sans serif</option></select></label>
              <label className="field">Invitation size<select value={doc.format} onChange={e => update({ format: e.target.value as Format })}>{Object.entries(presets).map(([key, preset]) => <option key={key} value={key}>{preset.name}</option>)}</select></label>
              <p className="field-help">Changing size preserves your entire design. Square and story formats add matching space around the composition.</p>
            </>}
            {tab === 'photo' && template.royal && <><p className="field-help">Two independent portraits, beautifully framed. Each keeps its own crop and zoom.</p>{(['bride','groom'] as const).map(slot=><PortraitControls key={slot} slot={slot} photo={doc.portraits?.[slot] || null} onError={setError} onChange={photo=>update({portraits:{bride:ref.current.portraits?.bride || null,groom:ref.current.portraits?.groom || null,[slot]:photo}})} />)}</>}
            {tab === 'photo' && !template.royal && <>
              <button className="upload-area" disabled={uploading} onClick={() => input.current?.click()}>{uploading ? <LoaderCircle className="spin" /> : <Upload size={26} />}<strong>{uploading ? 'Preparing your photo…' : doc.photo ? 'Replace your photo' : 'Add your favorite photo'}</strong><span>JPG, PNG or WebP · up to 12 MB</span></button>
              <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Upload invitation photo" onChange={e => { void upload(e.target.files?.[0]); }} />
              {doc.photo && <><label className="field">Zoom<input type="range" min="1" max="3" step="0.05" value={doc.photo.zoom} onChange={e => update({ photo: { ...doc.photo!, zoom: Number(e.target.value) } })} /></label>{(['x', 'y'] as const).map(axis => <label key={axis} className="field">{axis === 'x' ? 'Horizontal' : 'Vertical'} position<input type="range" min="0" max="100" value={doc.photo![axis]} onChange={e => update({ photo: { ...doc.photo!, [axis]: Number(e.target.value) } })} /></label>)}<button className="text-button danger" onClick={() => update({ photo: null })}><X size={16} />Remove photo</button></>}
              <p className="field-help">Your photo is processed in your browser and saved with this draft {storage === 'account' ? 'on your account server' : 'on this device'}.</p>
            </>}
            {error && <p className="error-box" role="alert">{error}</p>}
          </div>
          <div className="editor-panel-footer"><CheckCheck size={16} /><span>Every detail, beautifully yours.</span></div>
        </aside>
        <section className="editor-canvas" aria-label="Live invitation preview">
          <div className="canvas-top"><span><span className="status-dot" />LIVE PREVIEW</span><button className="text-button" disabled={!history.current.length} onClick={() => { const previous = history.current.pop(); if (previous) { change.current++; ref.current = previous; setDoc(previous); setDirty(true); } }}><RotateCcw size={15} />Undo</button></div>
          <div className={`canvas-paper format-${doc.format}`}><InvitationPreview document={doc} /></div>
          <div className="canvas-bottom"><Sparkles size={15} /><span>Made for your moment. Ready for the world.</span></div>
        </section>
      </div>
    </div>
    {downloadOpen && <Dialog title="Ready for your big moment?" onClose={() => { if (!exporting) setDownloadOpen(false); }}>
      <p className="dialog-description">Download the exact design in your preview. Your photo and typography are included.</p>
      <label className="field">File format<select value={downloadType} onChange={e => setDownloadType(e.target.value as typeof downloadType)}><option value="png">PNG — crisp digital sharing</option><option value="jpg">JPG — smaller file size</option><option value="pdf">PDF — raster print layout</option></select></label>
      <div className="download-summary"><Download size={21} /><div><strong>{presets[doc.format].name}</strong><span>{presets[doc.format].width} × {presets[doc.format].height} pixels{downloadType === 'pdf' ? ' · RGB raster, no bleed' : ''}</span></div><ChevronDown size={16} /></div>
      {issues.length > 0 && <div className="notice"><strong>A few finishing touches</strong><ul>{issues.map(issue => <li key={issue}>{issue}</li>)}</ul></div>}
      {error && <p className="error-box" role="alert">{error}</p>}
      <button className="button full" disabled={exporting || issues.length > 0} onClick={() => { void download(); }}>{exporting ? <LoaderCircle className="spin" size={18} /> : <Download size={18} />}{exporting ? 'Creating your download…' : `Download ${downloadType.toUpperCase()}`}</button>
      {storage === 'account' && <button className="button secondary full" disabled={exporting || issues.length > 0} onClick={() => { void queueExport(); }}>Queue background export</button>}
      <p className="field-help">Preview and download use the same document. Portrait PDF is 5 × 7 inches; professional CMYK and print bleed are not included.</p>
    </Dialog>}
  </Dialog>;
}

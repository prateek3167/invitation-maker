'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Check,
  CheckCheck,
  ChevronDown,
  Download,
  ImagePlus,
  LoaderCircle,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Type,
  Upload,
  X,
  Layers,
  Crown,
} from 'lucide-react';
import {
  contentIssues,
  documentTemplate,
  presets,
  weddingEvents,
  type Fields,
  type Invitation,
  type Format,
} from '../../../packages/editor-core/document';
import {
  type CanvasElement,
  decomposeTemplateToElements,
  syncFieldsFromElements,
  syncElementsFromFields,
} from '../../../packages/editor-core/canvas';
import {
  createEventCard,
  generateWeddingSuite,
  syncSuiteCoupleDetails,
} from '../../../packages/editor-core/suite';
import { exportInvitation, exportSuitePdf, exportSuiteImages, readPhoto } from '../lib/export';
import { saveDraft } from '../lib/storage';
import Dialog from './dialog';
import InvitationPreview from './invitation-preview';
import { api } from '../lib/account-api';
import PortraitControls from './portrait-controls';
import { browserArtwork } from '../lib/royal-art';

// Canva Studio Subcomponents
import InteractiveCanvas from './canvas/interactive-canvas';
import SidebarTools from './canvas/sidebar-tools';
import PropertiesPanel from './canvas/properties-panel';
import TopToolbar from './canvas/top-toolbar';
import SuiteBar from './canvas/suite-bar';
import type { ActiveSidebarTab } from './canvas/types';

const labels: Record<keyof Fields, string> = {
  host: 'First name / host',
  partner: 'Second name / detail',
  heading: 'Event heading',
  date: 'Date',
  time: 'Time',
  venue: 'Venue / location',
  message: 'Your message',
};

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

export default function Editor({
  initial,
  onClose,
  onSaved,
  persistDocument = saveDraft,
  storage = 'device',
}: {
  initial: Invitation;
  onClose: () => void;
  onSaved: () => void;
  persistDocument?: (document: Invitation) => Promise<Invitation>;
  storage?: 'device' | 'account';
}) {
  const savedLabel = storage === 'account' ? 'Saved to your account' : 'Saved on this device';

  // Ensure canvasElements is populated
  const initialWithCanvas: Invitation = {
    ...initial,
    canvasElements:
      initial.canvasElements && initial.canvasElements.length > 0
        ? initial.canvasElements
        : decomposeTemplateToElements(initial),
  };

  // Initialize multi-card suite
  const initialSuite: Invitation[] =
    initial.suiteCards && initial.suiteCards.length > 0
      ? initial.suiteCards.map(c => ({
          ...c,
          canvasElements:
            c.canvasElements && c.canvasElements.length > 0
              ? c.canvasElements
              : decomposeTemplateToElements(c),
        }))
      : [initialWithCanvas];

  const [suiteCards, setSuiteCards] = useState<Invitation[]>(initialSuite);
  const [cardIndex, setCardIndex] = useState(0);
  const [doc, setDoc] = useState<Invitation>(suiteCards[0] || initialWithCanvas);
  const [syncCouple, setSyncCouple] = useState(true);

  const [artworkData, setArtworkData] = useState<string | undefined>(undefined);
  const [mode, setMode] = useState<'visual' | 'guided'>('visual');
  const [activeTab, setActiveTab] = useState<ActiveSidebarTab>('templates');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1.0);

  // Guided mode tab
  const [guidedTab, setGuidedTab] = useState('details');

  const [status, setStatus] = useState(
    initial.revision ? savedLabel : 'Personalize to start your draft'
  );
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [downloadType, setDownloadType] = useState<'png' | 'jpg' | 'pdf'>('png');
  const [downloadScope, setDownloadScope] = useState<'card' | 'suite_pdf' | 'suite_images'>('card');

  const ref = useRef(doc);
  ref.current = doc;
  const suiteRef = useRef(suiteCards);
  suiteRef.current = suiteCards;
  const cardIndexRef = useRef(cardIndex);
  cardIndexRef.current = cardIndex;

  const revision = useRef(initial.revision);
  const change = useRef(0);
  const savedChange = useRef(initial.revision ? 0 : -1);
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const alive = useRef(true);

  // Undo / Redo stacks
  const history = useRef<Invitation[]>([]);
  const future = useRef<Invitation[]>([]);

  const input = useRef<HTMLInputElement>(null);
  const template = documentTemplate(doc);
  const issues = contentIssues(doc);

  // Load royal artwork if needed
  useEffect(() => {
    let active = true;
    if (template.royal) {
      void browserArtwork(doc).then(art => {
        if (active && art) {
          setArtworkData(art);
        }
      });
    }
    return () => {
      active = false;
    };
  }, [doc.templateId]);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const update = (patch: Partial<Invitation>, pushHistory = true) => {
    if (pushHistory) {
      history.current = [...history.current.slice(-29), ref.current];
      future.current = []; // Clear redo stack on new modification
    }
    change.current++;
    const next = { ...ref.current, ...patch };

    // Update active card in suite
    const currentIdx = cardIndexRef.current;
    let nextSuite = suiteRef.current.map((c, i) => (i === currentIdx ? next : c));

    // Propagate couple names to all cards in the suite if enabled
    if (
      syncCouple &&
      patch.fields &&
      (patch.fields.host !== undefined || patch.fields.partner !== undefined)
    ) {
      nextSuite = syncSuiteCoupleDetails(nextSuite, next);
    }
    next.suiteCards = nextSuite;

    ref.current = next;
    suiteRef.current = nextSuite;
    setDoc(next);
    setSuiteCards(nextSuite);
    setDirty(true);
    setError('');
    setStatus('Unsaved changes');
  };

  const handleSelectCard = (index: number) => {
    if (index < 0 || index >= suiteCards.length) return;
    setCardIndex(index);
    const target = suiteCards[index];
    ref.current = target;
    setDoc(target);
    setSelectedId(null);
  };

  const handleAddCard = (ceremonyId: string) => {
    const newCard = createEventCard(doc, ceremonyId);
    const nextSuite = [...suiteCards, newCard];
    setSuiteCards(nextSuite);
    setCardIndex(nextSuite.length - 1);
    ref.current = newCard;
    setDoc(newCard);
    setSelectedId(null);
    update({ suiteCards: nextSuite });
    setStatus(`Added ${newCard.eventTag || 'new ceremony'} card`);
  };

  const handleGenerateSuite = () => {
    const fullSuite = generateWeddingSuite(doc);
    setSuiteCards(fullSuite);
    setCardIndex(0);
    const first = fullSuite[0];
    ref.current = first;
    setDoc(first);
    setSelectedId(null);
    update({ suiteCards: fullSuite });
    setStatus('Complete 5-Card Wedding Suite generated!');
  };

  const handleDuplicateCard = (index: number) => {
    const source = suiteCards[index];
    const clone: Invitation = {
      ...structuredClone(source),
      id: crypto.randomUUID(),
      title: `${source.title} (Copy)`,
      revision: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const nextSuite = [
      ...suiteCards.slice(0, index + 1),
      clone,
      ...suiteCards.slice(index + 1),
    ];
    setSuiteCards(nextSuite);
    setCardIndex(index + 1);
    ref.current = clone;
    setDoc(clone);
    update({ suiteCards: nextSuite });
    setStatus('Card duplicated in suite');
  };

  const handleDeleteCard = (index: number) => {
    if (suiteCards.length <= 1) return;
    const nextSuite = suiteCards.filter((_, i) => i !== index);
    const nextIndex = Math.min(cardIndex, nextSuite.length - 1);
    setSuiteCards(nextSuite);
    setCardIndex(nextIndex);
    const active = nextSuite[nextIndex];
    ref.current = active;
    setDoc(active);
    update({ suiteCards: nextSuite });
    setStatus('Card removed from suite');
  };

  const handleMoveCard = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex < 0 ||
      fromIndex >= suiteCards.length ||
      toIndex < 0 ||
      toIndex >= suiteCards.length
    ) {
      return;
    }
    const nextSuite = [...suiteCards];
    const [moved] = nextSuite.splice(fromIndex, 1);
    nextSuite.splice(toIndex, 0, moved);
    setSuiteCards(nextSuite);
    if (cardIndex === fromIndex) {
      setCardIndex(toIndex);
    }
    update({ suiteCards: nextSuite });
  };

  const handleUndo = () => {
    if (!history.current.length) return;
    const previous = history.current.pop()!;
    future.current.push(ref.current);
    change.current++;
    ref.current = previous;
    setDoc(previous);
    setDirty(true);
    setStatus('Unsaved changes');
  };

  const handleRedo = () => {
    if (!future.current.length) return;
    const next = future.current.pop()!;
    history.current.push(ref.current);
    change.current++;
    ref.current = next;
    setDoc(next);
    setDirty(true);
    setStatus('Unsaved changes');
  };

  // Sync canvas elements changes with document fields
  const handleElementsChange = (elements: CanvasElement[]) => {
    const updatedFields = syncFieldsFromElements(elements, ref.current.fields);
    update({
      canvasElements: elements,
      fields: updatedFields,
    });
  };

  // Persist draft to storage
  const persist = useCallback((): Promise<Invitation> => {
    const task = queue.current.catch(() => {}).then(async () => {
      const version = change.current;
      if (savedChange.current === version && revision.current > 0) {
        return { ...ref.current, revision: revision.current };
      }
      if (alive.current) setStatus('Saving…');
      try {
        const payload: Invitation = {
          ...ref.current,
          suiteCards: suiteRef.current,
          revision: revision.current,
        };
        const saved = await persistDocument(payload);
        revision.current = saved.revision;
        savedChange.current = version;
        if (alive.current && change.current === version) {
          ref.current = saved;
          setDoc(saved);
        }
        if (alive.current) {
          setDirty(change.current !== version);
          setStatus(change.current === version ? savedLabel : 'Unsaved changes');
          onSaved();
        }
        return saved;
      } catch (e) {
        if (alive.current) {
          setStatus('Not saved');
          setError(e instanceof Error ? e.message : 'Could not save this draft.');
        }
        throw e;
      }
    });
    queue.current = task;
    return task;
  }, [onSaved, persistDocument, savedLabel]);

  // Debounced auto-save
  useEffect(() => {
    if (!dirty) return;
    const timer = setTimeout(() => {
      void persist().catch(() => {});
    }, 800);
    return () => clearTimeout(timer);
  }, [doc, dirty, persist]);

  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => {
      if (change.current !== savedChange.current) event.preventDefault();
    };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, []);

  const close = async () => {
    if (change.current !== savedChange.current && (dirty || initial.revision)) {
      try {
        await persist();
      } catch {
        if (!window.confirm('This draft could not be saved. Leave and discard unsaved changes?')) {
          return;
        }
      }
    }
    onClose();
  };

  const upload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const data = await readPhoto(file);
      if (alive.current) {
        const updatedPhoto = { data, x: 50, y: 50, zoom: 1 };
        const updatedElements = (ref.current.canvasElements || []).map(el =>
          el.type === 'image' && el.slot !== 'bride' && el.slot !== 'groom'
            ? { ...el, src: data }
            : el
        );
        update({ photo: updatedPhoto, canvasElements: updatedElements });
      }
    } catch (e) {
      if (alive.current) {
        setError(e instanceof Error ? e.message : 'That photo could not be opened.');
      }
    } finally {
      if (alive.current) setUploading(false);
      if (input.current) input.current.value = '';
    }
  };

  const download = async () => {
    if (issues.length) return;
    setExporting(true);
    setError('');
    try {
      if (downloadScope === 'suite_pdf') {
        await exportSuitePdf(suiteCards, doc.title || 'Wedding_Suite');
        setStatus(`Wedding Suite (${suiteCards.length} cards) exported as PDF booklet`);
      } else if (downloadScope === 'suite_images') {
        await exportSuiteImages(suiteCards, downloadType === 'pdf' ? 'png' : downloadType);
        setStatus(`All ${suiteCards.length} wedding cards downloaded`);
      } else {
        await exportInvitation(ref.current, downloadType);
        setStatus(
          storage === 'account'
            ? 'Download ready · account draft'
            : 'Download ready · edits save on this device'
        );
      }
      setDownloadOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Download failed. Please retry.');
    } finally {
      setExporting(false);
    }
  };

  const queueExport = async () => {
    if (issues.length) return;
    setExporting(true);
    setError('');
    try {
      const saved = await persist();
      await api('/api/v1/exports', 'POST', {
        invitationId: saved.id,
        revision: saved.revision,
        format: downloadType,
        idempotencyKey: crypto.randomUUID(),
      });
      setDownloadOpen(false);
      setStatus('Export queued · open Export history in your account');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not queue this export.');
    } finally {
      setExporting(false);
    }
  };

  const currentElements =
    doc.canvasElements && doc.canvasElements.length > 0
      ? doc.canvasElements
      : decomposeTemplateToElements(doc, artworkData);

  return (
    <Dialog
      title={`Customize ${template.name}`}
      wide
      onClose={() => {
        void close();
      }}
    >
      <div className="editor-shell">
        {/* Universal Top Toolbar */}
        <TopToolbar
          document={doc}
          onBack={() => {
            void close();
          }}
          status={status}
          dirty={dirty}
          onSave={() => {
            void persist().catch(() => {});
          }}
          onDownload={() => setDownloadOpen(true)}
          canUndo={history.current.length > 0}
          canRedo={future.current.length > 0}
          onUndo={handleUndo}
          onRedo={handleRedo}
          mode={mode}
          onModeChange={setMode}
          suiteCount={suiteCards.length}
          currentCardIndex={cardIndex}
          eventTag={doc.eventTag}
        />

        {/* VISUAL CANVA STUDIO MODE */}
        {mode === 'visual' && (
          <div className="canva-editor-workspace">
            {/* Left Sidebar: Tool Palettes */}
            <SidebarTools
              document={doc}
              elements={currentElements}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onChange={handleElementsChange}
              onUpdateDocument={patch => {
                if (patch.templateId && patch.templateId !== doc.templateId) {
                  const newT = documentTemplate({ ...doc, templateId: patch.templateId });
                  const newElements = decomposeTemplateToElements(
                    { ...doc, templateId: patch.templateId, palette: [...newT.palette] },
                    artworkData
                  );
                  update({ ...patch, canvasElements: newElements });
                } else if (patch.fields) {
                  const newElements = syncElementsFromFields(currentElements, patch.fields);
                  update({ ...patch, canvasElements: newElements });
                } else {
                  update(patch);
                }
              }}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            {/* Center Column: Interactive Canvas + Bottom Multi-Card Suite Bar */}
            <div className="canva-center-column">
              <InteractiveCanvas
                document={doc}
                elements={currentElements}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onChange={handleElementsChange}
                zoom={zoom}
                onZoomChange={setZoom}
                artworkData={artworkData}
              />

              {/* Bottom Multi-Card Wedding Suite Bar */}
              <SuiteBar
                cards={suiteCards}
                activeIndex={cardIndex}
                onSelectCard={handleSelectCard}
                onAddCard={handleAddCard}
                onGenerateSuite={handleGenerateSuite}
                onDuplicateCard={handleDuplicateCard}
                onDeleteCard={handleDeleteCard}
                onMoveCard={handleMoveCard}
              />
            </div>

            {/* Right Properties Panel: Contextual Inspector */}
            <PropertiesPanel
              document={doc}
              elements={currentElements}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onChange={handleElementsChange}
              onUpdateDocument={patch => {
                if (patch.fields) {
                  const newElements = syncElementsFromFields(currentElements, patch.fields);
                  update({ ...patch, canvasElements: newElements });
                } else {
                  update(patch);
                }
              }}
            />
          </div>
        )}

        {/* GUIDED DETAILS MODE (Classic Quick Form View) */}
        {mode === 'guided' && (
          <div className="editor-workspace">
            <aside className="editor-panel">
              <div className="editor-panel-heading">
                <span className="eyebrow">GUIDED DETAILS</span>
                <h2>
                  A few details.
                  <br />A personal touch.
                </h2>
                <p>Changes synchronize directly with your visual design canvas and wedding suite.</p>
              </div>

              <div className="editor-tabs" aria-label="Editor sections">
                {[
                  { id: 'details', label: 'Details', icon: Type },
                  { id: 'style', label: 'Design', icon: SlidersHorizontal },
                  ...(template.photo ? [{ id: 'photo', label: 'Photo', icon: ImagePlus }] : []),
                ].map(t => (
                  <button
                    key={t.id}
                    className={guidedTab === t.id ? 'selected' : ''}
                    aria-pressed={guidedTab === t.id}
                    onClick={() => setGuidedTab(t.id)}
                  >
                    <t.icon size={16} />
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="editor-fields">
                {guidedTab === 'details' && (
                  <>
                    {(template.royal ||
                      ['Wedding', 'Haldi', 'Mehndi', 'Sangeet', 'Engagement'].includes(
                        template.occasion
                      )) && (
                      <label className="field">
                        Wedding event
                        <select
                          value={
                            weddingEvents.find(event => doc.fields.heading.startsWith(event)) || ''
                          }
                          onChange={e => {
                            if (e.target.value) {
                              const newHeading = `${e.target.value} Celebration`;
                              const newFields = { ...doc.fields, heading: newHeading };
                              const newElements = syncElementsFromFields(
                                currentElements,
                                newFields
                              );
                              update({ fields: newFields, canvasElements: newElements });
                            }
                          }}
                        >
                          <option value="">Custom event</option>
                          {weddingEvents.map(event => (
                            <option key={event}>{event}</option>
                          ))}
                        </select>
                      </label>
                    )}

                    <label className="field">
                      Draft name
                      <input
                        value={doc.title}
                        maxLength={120}
                        onChange={e => update({ title: e.target.value })}
                      />
                    </label>

                    {(Object.keys(labels) as (keyof Fields)[]).map(key => (
                      <label className="field" key={key}>
                        {template.royal && key === 'host'
                          ? 'Bride name'
                          : template.royal && key === 'partner'
                          ? 'Groom name'
                          : labels[key]}
                        {key === 'message' ? (
                          <textarea
                            maxLength={180}
                            rows={3}
                            value={doc.fields[key]}
                            onChange={e => {
                              const newFields = { ...doc.fields, [key]: e.target.value };
                              const newElements = syncElementsFromFields(
                                currentElements,
                                newFields
                              );
                              update({ fields: newFields, canvasElements: newElements });
                            }}
                          />
                        ) : (
                          <input
                            maxLength={
                              key === 'venue'
                                ? 120
                                : key === 'host' || key === 'partner'
                                ? 40
                                : 65
                            }
                            value={doc.fields[key]}
                            onChange={e => {
                              const newFields = { ...doc.fields, [key]: e.target.value };
                              const newElements = syncElementsFromFields(
                                currentElements,
                                newFields
                              );
                              update({ fields: newFields, canvasElements: newElements });
                            }}
                          />
                        )}
                      </label>
                    ))}

                    <label className="field-checkbox" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                      <input
                        type="checkbox"
                        checked={syncCouple}
                        onChange={e => setSyncCouple(e.target.checked)}
                      />
                      <span>Sync Bride & Groom names across all ceremony cards in suite</span>
                    </label>
                  </>
                )}

                {guidedTab === 'style' && (
                  <>
                    {template.royal && (
                      <p className="field-help">
                        Color stories customize your lettering, portrait frames and stationery panel
                        while preserving the original palace artwork.
                      </p>
                    )}
                    <div className="field">
                      Color story
                      <div className="palette-list">
                        {palettes.map(p => (
                          <button
                            key={p.name}
                            className="palette-option"
                            aria-pressed={
                              JSON.stringify(doc.palette) ===
                              JSON.stringify(p.colors || template.palette)
                            }
                            onClick={() => {
                              const newColors = p.colors ? [...p.colors] : [...template.palette];
                              const newElements = currentElements.map(el => {
                                if (el.type === 'background') return { ...el, fill: newColors[1] };
                                return el;
                              });
                              update({ palette: newColors, canvasElements: newElements });
                            }}
                          >
                            <span className="swatches">
                              {(p.colors || template.palette).map(c => (
                                <i key={c} style={{ background: c }} />
                              ))}
                            </span>
                            {p.name}
                            {JSON.stringify(doc.palette) ===
                              JSON.stringify(p.colors || template.palette) && <Check size={16} />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <label className="field">
                      Typography
                      <select
                        value={doc.font}
                        onChange={e =>
                          update({ font: e.target.value as Invitation['font'] })
                        }
                      >
                        <option value="serif">Timeless serif</option>
                        <option value="italic">Romantic italic</option>
                        <option value="modern">Modern sans serif</option>
                      </select>
                    </label>

                    <label className="field">
                      Invitation size
                      <select
                        value={doc.format}
                        onChange={e => update({ format: e.target.value as Format })}
                      >
                        {Object.entries(presets).map(([key, preset]) => (
                          <option key={key} value={key}>
                            {preset.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </>
                )}

                {guidedTab === 'photo' && template.royal && (
                  <>
                    <p className="field-help">
                      Two independent portraits, beautifully framed. Each keeps its own crop and
                      zoom.
                    </p>
                    {(['bride', 'groom'] as const).map(slot => (
                      <PortraitControls
                        key={slot}
                        slot={slot}
                        photo={doc.portraits?.[slot] || null}
                        onError={setError}
                        onChange={photo => {
                          const updatedPortraits = {
                            bride: ref.current.portraits?.bride || null,
                            groom: ref.current.portraits?.groom || null,
                            [slot]: photo,
                          };
                          const updatedElements = currentElements.map(el =>
                            el.type === 'image' && el.photoSlot === slot
                              ? { ...el, src: photo?.data, zoom: photo?.zoom, cropX: photo?.x, cropY: photo?.y }
                              : el
                          );
                          update({
                            portraits: updatedPortraits,
                            canvasElements: updatedElements,
                          });
                        }}
                      />
                    ))}
                  </>
                )}

                {guidedTab === 'photo' && !template.royal && (
                  <>
                    <button
                      className="upload-area"
                      disabled={uploading}
                      onClick={() => input.current?.click()}
                    >
                      {uploading ? (
                        <LoaderCircle className="spin" />
                      ) : (
                        <Upload size={26} />
                      )}
                      <strong>
                        {uploading
                          ? 'Preparing your photo…'
                          : doc.photo
                          ? 'Replace your photo'
                          : 'Add your favorite photo'}
                      </strong>
                      <span>JPG, PNG or WebP · up to 12 MB</span>
                    </button>
                    <input
                      ref={input}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      aria-label="Upload invitation photo"
                      onChange={e => {
                        void upload(e.target.files?.[0]);
                      }}
                    />
                    {doc.photo && (
                      <>
                        <label className="field">
                          Zoom
                          <input
                            type="range"
                            min="1"
                            max="3"
                            step="0.05"
                            value={doc.photo.zoom}
                            onChange={e => {
                              const newZoom = Number(e.target.value);
                              const updatedPhoto = { ...doc.photo!, zoom: newZoom };
                              const updatedElements = currentElements.map(el =>
                                el.type === 'image' ? { ...el, zoom: newZoom } : el
                              );
                              update({ photo: updatedPhoto, canvasElements: updatedElements });
                            }}
                          />
                        </label>
                        {(['x', 'y'] as const).map(axis => (
                          <label key={axis} className="field">
                            {axis === 'x' ? 'Horizontal' : 'Vertical'} position
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={doc.photo![axis]}
                              onChange={e => {
                                const newPos = Number(e.target.value);
                                const updatedPhoto = { ...doc.photo!, [axis]: newPos };
                                const updatedElements = currentElements.map(el =>
                                  el.type === 'image'
                                    ? {
                                        ...el,
                                        cropX: axis === 'x' ? newPos : el.cropX,
                                        cropY: axis === 'y' ? newPos : el.cropY,
                                      }
                                    : el
                                );
                                update({ photo: updatedPhoto, canvasElements: updatedElements });
                              }}
                            />
                          </label>
                        ))}
                        <button
                          className="text-button danger"
                          onClick={() => {
                            const updatedElements = currentElements.map(el =>
                              el.type === 'image' ? { ...el, src: undefined } : el
                            );
                            update({ photo: null, canvasElements: updatedElements });
                          }}
                        >
                          <X size={16} />
                          Remove photo
                        </button>
                      </>
                    )}
                  </>
                )}

                {error && (
                  <p className="error-box" role="alert">
                    {error}
                  </p>
                )}
              </div>

              <div className="editor-panel-footer">
                <CheckCheck size={16} />
                <span>Every detail, beautifully yours.</span>
              </div>
            </aside>

            {/* Live Preview Pane */}
            <section className="editor-canvas" aria-label="Live invitation preview">
              <div className="canvas-top">
                <span>
                  <span className="status-dot" />
                  LIVE PREVIEW
                </span>
                <button
                  className="text-button"
                  disabled={!history.current.length}
                  onClick={handleUndo}
                >
                  <RotateCcw size={15} />
                  Undo
                </button>
              </div>
              <div className={`canvas-paper format-${doc.format}`}>
                <InvitationPreview document={doc} />
              </div>
              <div className="canvas-bottom">
                <Sparkles size={15} />
                <span>Made for your moment. Ready for the world.</span>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Download Modal Dialog */}
      {downloadOpen && (
        <Dialog
          title="Download Wedding Invitations"
          onClose={() => {
            if (!exporting) setDownloadOpen(false);
          }}
        >
          <p className="dialog-description">
            Export print-ready files preserving your custom canvas elements, typography, and couple photographs.
          </p>

          {/* Download Scope Selector (Current Card vs Full Suite Booklet vs All Cards) */}
          <div className="field">
            Export Selection
            <div className="download-scope-options">
              <button
                type="button"
                className={`scope-option-btn ${downloadScope === 'card' ? 'active' : ''}`}
                onClick={() => setDownloadScope('card')}
              >
                <Layers size={16} />
                <div>
                  <strong>Current Card Only</strong>
                  <small>{doc.eventTag || doc.fields.heading || 'Active Card'}</small>
                </div>
              </button>

              <button
                type="button"
                className={`scope-option-btn ${downloadScope === 'suite_pdf' ? 'active' : ''}`}
                onClick={() => {
                  setDownloadScope('suite_pdf');
                  setDownloadType('pdf');
                }}
              >
                <Crown size={16} />
                <div>
                  <strong>Complete Wedding Suite (PDF Booklet)</strong>
                  <small>All {suiteCards.length} ceremony cards in 1 print document</small>
                </div>
              </button>

              <button
                type="button"
                className={`scope-option-btn ${downloadScope === 'suite_images' ? 'active' : ''}`}
                onClick={() => {
                  setDownloadScope('suite_images');
                  if (downloadType === 'pdf') setDownloadType('png');
                }}
              >
                <Sparkles size={16} />
                <div>
                  <strong>All Ceremony Cards (Images)</strong>
                  <small>Download each of the {suiteCards.length} cards separately</small>
                </div>
              </button>
            </div>
          </div>

          <label className="field">
            File format
            <select
              value={downloadType}
              onChange={e => setDownloadType(e.target.value as typeof downloadType)}
              disabled={downloadScope === 'suite_pdf'}
            >
              <option value="png">PNG — crisp digital sharing (High Resolution 300 DPI)</option>
              <option value="jpg">JPG — smaller file size (High Resolution 300 DPI)</option>
              {downloadScope !== 'suite_images' && (
                <option value="pdf">PDF — raster print layout</option>
              )}
            </select>
          </label>

          <div className="download-summary">
            <Download size={21} />
            <div>
              <strong>
                {downloadScope === 'suite_pdf'
                  ? `Wedding Suite Booklet (${suiteCards.length} Pages)`
                  : downloadScope === 'suite_images'
                  ? `All ${suiteCards.length} Ceremony Cards`
                  : presets[doc.format].name}
              </strong>
              <span>
                {downloadScope === 'suite_pdf'
                  ? `Multi-page PDF booklet · ${presets[doc.format].width} × ${presets[doc.format].height} px per page`
                  : `${presets[doc.format].width} × ${presets[doc.format].height} pixels · 300 DPI RGB`}
              </span>
            </div>
            <ChevronDown size={16} />
          </div>

          {issues.length > 0 && (
            <div className="notice">
              <strong>A few finishing touches</strong>
              <ul>
                {issues.map(issue => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
          {error && (
            <p className="error-box" role="alert">
              {error}
            </p>
          )}
          <button
            className="button full"
            disabled={exporting || issues.length > 0}
            onClick={() => {
              void download();
            }}
          >
            {exporting ? (
              <LoaderCircle className="spin" size={18} />
            ) : (
              <Download size={18} />
            )}
            {exporting
              ? 'Creating your download…'
              : downloadScope === 'suite_pdf'
              ? `Download Wedding Booklet (PDF)`
              : downloadScope === 'suite_images'
              ? `Download All ${suiteCards.length} Cards (${downloadType.toUpperCase()})`
              : `Download ${downloadType.toUpperCase()}`}
          </button>
          {storage === 'account' && (
            <button
              className="button secondary full"
              disabled={exporting || issues.length > 0}
              onClick={() => {
                void queueExport();
              }}
            >
              Queue background export
            </button>
          )}
          <p className="field-help">
            Preview and download use the same document. Portrait PDF is 5 × 7 inches; professional
            CMYK and print bleed are not included.
          </p>
        </Dialog>
      )}
    </Dialog>
  );
}

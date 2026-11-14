'use client';
import { useRef } from 'react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
  Sparkles,
  Upload,
} from 'lucide-react';
import type { Invitation, Format } from '../../../../packages/editor-core/document';
import { presets, weddingEvents } from '../../../../packages/editor-core/document';
import type { CanvasElement, FrameShape } from '../../../../packages/editor-core/canvas';
import { readPhoto } from '../../lib/export';

interface PropertiesPanelProps {
  document: Invitation;
  elements: CanvasElement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (elements: CanvasElement[]) => void;
  onUpdateDocument: (patch: Partial<Invitation>) => void;
}

export default function PropertiesPanel({
  document: doc,
  elements,
  selectedId,
  onSelect,
  onChange,
  onUpdateDocument,
}: PropertiesPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedEl = elements.find(el => el.id === selectedId) || null;
  const [ink, paper, accent] = doc.palette;

  const updateSelected = (patch: Partial<CanvasElement>) => {
    if (!selectedEl) return;
    onChange(
      elements.map(el => (el.id === selectedEl.id ? { ...el, ...patch } : el))
    );
  };

  const deleteSelected = () => {
    if (!selectedEl) return;
    onChange(elements.filter(el => el.id !== selectedEl.id));
    onSelect(null);
  };

  const duplicateSelected = () => {
    if (!selectedEl) return;
    const maxZ = Math.max(...elements.map(e => e.zIndex || 0), 0);
    const clone: CanvasElement = {
      ...selectedEl,
      id: `el_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: `${selectedEl.name} (Copy)`,
      x: selectedEl.x + 20,
      y: selectedEl.y + 20,
      zIndex: maxZ + 1,
    };
    onChange([...elements, clone]);
    onSelect(clone.id);
  };

  // Reorder Z-Index
  const bringToFront = () => {
    if (!selectedEl) return;
    const maxZ = Math.max(...elements.map(e => e.zIndex || 0), 0);
    updateSelected({ zIndex: maxZ + 1 });
  };

  const sendToBack = () => {
    if (!selectedEl) return;
    const minZ = Math.min(...elements.map(e => e.zIndex || 0), 0);
    updateSelected({ zIndex: minZ - 1 });
  };

  const bringForward = () => {
    if (!selectedEl) return;
    updateSelected({ zIndex: (selectedEl.zIndex || 0) + 1 });
  };

  const sendBackward = () => {
    if (!selectedEl) return;
    updateSelected({ zIndex: (selectedEl.zIndex || 0) - 1 });
  };

  // Canvas Alignment helpers
  const alignElement = (
    pos: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
  ) => {
    if (!selectedEl) return;
    if (pos === 'left') updateSelected({ x: 40 });
    if (pos === 'center') updateSelected({ x: Math.round(350 - selectedEl.width / 2) });
    if (pos === 'right') updateSelected({ x: Math.round(660 - selectedEl.width) });
    if (pos === 'top') updateSelected({ y: 40 });
    if (pos === 'middle') updateSelected({ y: Math.round(490 - selectedEl.height / 2) });
    if (pos === 'bottom') updateSelected({ y: Math.round(940 - selectedEl.height) });
  };

  // Replace photo file
  const handleReplacePhoto = async (file?: File) => {
    if (!file || !selectedEl) return;
    try {
      const data = await readPhoto(file);
      if (selectedEl.photoSlot === 'bride') {
        onUpdateDocument({
          portraits: {
            bride: { data, x: 50, y: 50, zoom: 1 },
            groom: doc.portraits?.groom || null,
          },
        });
      } else if (selectedEl.photoSlot === 'groom') {
        onUpdateDocument({
          portraits: {
            bride: doc.portraits?.bride || null,
            groom: { data, x: 50, y: 50, zoom: 1 },
          },
        });
      } else {
        onUpdateDocument({ photo: { data, x: 50, y: 50, zoom: 1 } });
      }
      updateSelected({ src: data });
    } catch (e) {
      console.error('Could not replace photo:', e);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <aside className="canva-properties-panel" aria-label="Element properties inspector">
      {/* If No Element is Selected: Show Global Page & Document Inspector */}
      {!selectedEl && (
        <div className="inspector-section">
          <div className="inspector-header">
            <h3>Canvas Settings</h3>
            <span className="badge">Page</span>
          </div>

          <label className="field">
            Draft Title
            <input
              type="text"
              value={doc.title}
              maxLength={120}
              onChange={e => onUpdateDocument({ title: e.target.value })}
            />
          </label>

          <label className="field">
            Wedding Event
            <select
              value={
                weddingEvents.find(event => doc.fields.heading.startsWith(event)) || ''
              }
              onChange={e => {
                if (e.target.value) {
                  onUpdateDocument({
                    fields: { ...doc.fields, heading: `${e.target.value} Celebration` },
                  });
                }
              }}
            >
              <option value="">Custom Event</option>
              {weddingEvents.map(event => (
                <option key={event} value={event}>
                  {event}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            Size & Aspect Ratio
            <select
              value={doc.format}
              onChange={e => onUpdateDocument({ format: e.target.value as Format })}
            >
              {Object.entries(presets).map(([k, p]) => (
                <option key={k} value={k}>
                  {p.name} ({p.width} × {p.height})
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            Default Typography
            <select
              value={doc.font}
              onChange={e =>
                onUpdateDocument({ font: e.target.value as Invitation['font'] })
              }
            >
              <option value="serif">Timeless Royal Serif</option>
              <option value="italic">Romantic Flowing Italic</option>
              <option value="modern">Modern Clean Sans</option>
            </select>
          </label>

          <div className="inspector-hint">
            <Sparkles size={16} />
            <p>Click on any text, photo frame, or royal ornament on the canvas to inspect and edit its properties.</p>
          </div>
        </div>
      )}

      {/* If Element is Selected */}
      {selectedEl && (
        <div className="inspector-section">
          {/* Top Bar for Selected Element */}
          <div className="inspector-header">
            <div>
              <h3>{selectedEl.name}</h3>
              <small className="element-type-badge">{selectedEl.type}</small>
            </div>
            <div className="inspector-quick-actions">
              <button
                type="button"
                title={selectedEl.locked ? 'Unlock element' : 'Lock element'}
                className={selectedEl.locked ? 'active' : ''}
                onClick={() => updateSelected({ locked: !selectedEl.locked })}
              >
                {selectedEl.locked ? <Lock size={15} /> : <Unlock size={15} />}
              </button>
              <button
                type="button"
                title="Duplicate element"
                onClick={duplicateSelected}
              >
                <Copy size={15} />
              </button>
              <button
                type="button"
                title="Delete element"
                className="danger"
                onClick={deleteSelected}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {/* TEXT ELEMENT PROPERTIES */}
          {selectedEl.type === 'text' && (
            <div className="property-group">
              <label className="field">
                Text Content
                <textarea
                  rows={3}
                  value={selectedEl.text || ''}
                  onChange={e => updateSelected({ text: e.target.value })}
                />
              </label>

              <div className="two-col-grid">
                <label className="field">
                  Font Family
                  <select
                    value={selectedEl.fontFamily || (doc.font === 'modern' ? 'Arial, sans-serif' : 'Georgia, serif')}
                    onChange={e => updateSelected({ fontFamily: e.target.value })}
                  >
                    <optgroup label="🕉️ Traditional & Devanagari / Hindi">
                      <option value="'Rozha One', serif">Rozha One (शाही हेडिंग · श्री)</option>
                      <option value="'Yatra One', cursive">Yatra One (पारंपरिक बोल्ड · विवाह)</option>
                      <option value="'Kalam', cursive">Kalam (उत्सव कैलीग्राफी · मेहँदी)</option>
                      <option value="'Tiro Devanagari Hindi', serif">Tiro Devanagari (शास्त्रीय श्लोक)</option>
                      <option value="'Noto Serif Devanagari', serif">Noto Serif (वैदिक सेरिफ)</option>
                      <option value="'Noto Sans Devanagari', sans-serif">Noto Sans (आधुनिक देवनागरी)</option>
                    </optgroup>
                    <optgroup label="👑 Royal English Typography">
                      <option value="'Cinzel', serif">Cinzel (Royal Roman)</option>
                      <option value="'Playfair Display', serif">Playfair Display (Editorial)</option>
                      <option value="'Great Vibes', cursive">Great Vibes (Script)</option>
                      <option value="Georgia, serif">Georgia Serif</option>
                      <option value="Arial, sans-serif">Modern Sans</option>
                    </optgroup>
                  </select>
                </label>

                <label className="field">
                  Size (pt)
                  <input
                    type="number"
                    min="10"
                    max="96"
                    value={selectedEl.fontSize || 16}
                    onChange={e => updateSelected({ fontSize: Math.max(1, Math.min(1000, Number(e.target.value) || 16)) })}
                  />
                </label>
              </div>

              {/* Formatting Toggles (Bold, Italic, Alignments) */}
              <div className="toolbar-button-row">
                <button
                  type="button"
                  className={selectedEl.fontWeight === 'bold' ? 'active' : ''}
                  onClick={() =>
                    updateSelected({
                      fontWeight: selectedEl.fontWeight === 'bold' ? 'normal' : 'bold',
                    })
                  }
                  title="Bold"
                >
                  <Bold size={15} />
                </button>
                <button
                  type="button"
                  className={selectedEl.fontStyle === 'italic' ? 'active' : ''}
                  onClick={() =>
                    updateSelected({
                      fontStyle: selectedEl.fontStyle === 'italic' ? 'normal' : 'italic',
                    })
                  }
                  title="Italic"
                >
                  <Italic size={15} />
                </button>
                <span className="divider" />
                <button
                  type="button"
                  className={selectedEl.textAlign === 'left' ? 'active' : ''}
                  onClick={() => updateSelected({ textAlign: 'left' })}
                  title="Align Left"
                >
                  <AlignLeft size={15} />
                </button>
                <button
                  type="button"
                  className={selectedEl.textAlign === 'center' ? 'active' : ''}
                  onClick={() => updateSelected({ textAlign: 'center' })}
                  title="Align Center"
                >
                  <AlignCenter size={15} />
                </button>
                <button
                  type="button"
                  className={selectedEl.textAlign === 'right' ? 'active' : ''}
                  onClick={() => updateSelected({ textAlign: 'right' })}
                  title="Align Right"
                >
                  <AlignRight size={15} />
                </button>
              </div>

              {/* Color Swatches */}
              <div className="field">
                Text Color
                <div className="color-swatch-row">
                  <input
                    type="color"
                    value={selectedEl.color || ink}
                    onChange={e => updateSelected({ color: e.target.value })}
                  />
                  {[ink, accent, '#541212', '#14382c', '#d4af37', '#ffffff'].map(c => (
                    <button
                      key={c}
                      type="button"
                      style={{ background: c }}
                      className={`color-dot ${selectedEl.color === c ? 'active' : ''}`}
                      onClick={() => updateSelected({ color: c })}
                    />
                  ))}
                </div>
              </div>

              {/* Spacing & Line Height */}
              <label className="field">
                Letter Spacing: {selectedEl.letterSpacing || 0}px
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="0.5"
                  value={selectedEl.letterSpacing || 0}
                  onChange={e => updateSelected({ letterSpacing: Number(e.target.value) })}
                />
              </label>
            </div>
          )}

          {/* IMAGE / PHOTO PROPERTIES */}
          {selectedEl.type === 'image' && (
            <div className="property-group">
              <div className="field">
                Photo Frame Shape
                <div className="frame-shape-selector">
                  {(['arch', 'oval', 'circle', 'rect'] as FrameShape[]).map(shape => (
                    <button
                      key={shape}
                      type="button"
                      className={`frame-shape-btn ${
                        (selectedEl.frameShape || 'arch') === shape ? 'active' : ''
                      }`}
                      onClick={() => updateSelected({ frameShape: shape })}
                    >
                      {shape.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="button secondary full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={15} /> Replace Photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={e => handleReplacePhoto(e.target.files?.[0])}
              />

              <label className="field">
                Zoom: {(selectedEl.zoom || 1).toFixed(2)}x
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={selectedEl.zoom || 1}
                  onChange={e => updateSelected({ zoom: Number(e.target.value) })}
                />
              </label>

              <label className="field">
                Horizontal Shift: {selectedEl.cropX || 50}%
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedEl.cropX || 50}
                  onChange={e => updateSelected({ cropX: Number(e.target.value) })}
                />
              </label>

              <label className="field">
                Vertical Shift: {selectedEl.cropY || 50}%
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedEl.cropY || 50}
                  onChange={e => updateSelected({ cropY: Number(e.target.value) })}
                />
              </label>

              <div className="field">
                Frame Border Color
                <div className="color-swatch-row">
                  <input
                    type="color"
                    value={selectedEl.stroke || accent}
                    onChange={e => updateSelected({ stroke: e.target.value })}
                  />
                  {[accent, ink, '#d4af37', '#ffffff', '#e5a00d'].map(c => (
                    <button
                      key={c}
                      type="button"
                      style={{ background: c }}
                      className={`color-dot ${selectedEl.stroke === c ? 'active' : ''}`}
                      onClick={() => updateSelected({ stroke: c })}
                    />
                  ))}
                </div>
              </div>

              <label className="field">
                Border Thickness: {selectedEl.strokeWidth || 2}px
                <input
                  type="range"
                  min="0"
                  max="8"
                  value={selectedEl.strokeWidth || 2}
                  onChange={e => updateSelected({ strokeWidth: Number(e.target.value) })}
                />
              </label>
            </div>
          )}

          {/* SHAPE & ORNAMENT PROPERTIES */}
          {(selectedEl.type === 'shape' || selectedEl.type === 'ornament') && (
            <div className="property-group">
              <div className="field">
                Stroke / Accent Color
                <div className="color-swatch-row">
                  <input
                    type="color"
                    value={selectedEl.stroke || accent}
                    onChange={e => updateSelected({ stroke: e.target.value })}
                  />
                  {[accent, ink, '#d4af37', '#541212', '#14382c', '#ffffff'].map(c => (
                    <button
                      key={c}
                      type="button"
                      style={{ background: c }}
                      className={`color-dot ${selectedEl.stroke === c ? 'active' : ''}`}
                      onClick={() => updateSelected({ stroke: c })}
                    />
                  ))}
                </div>
              </div>

              {selectedEl.type === 'shape' && (
                <div className="field">
                  Fill Color
                  <div className="color-swatch-row">
                    <input
                      type="color"
                      value={selectedEl.fill === 'none' ? '#ffffff' : selectedEl.fill || '#ffffff'}
                      onChange={e => updateSelected({ fill: e.target.value })}
                    />
                    <button
                      type="button"
                      className={`none-fill-btn ${selectedEl.fill === 'none' ? 'active' : ''}`}
                      onClick={() => updateSelected({ fill: 'none' })}
                    >
                      None
                    </button>
                    {[paper, '#ffffff', accent, ink].map(c => (
                      <button
                        key={c}
                        type="button"
                        style={{ background: c }}
                        className={`color-dot ${selectedEl.fill === c ? 'active' : ''}`}
                        onClick={() => updateSelected({ fill: c })}
                      />
                    ))}
                  </div>
                </div>
              )}

              <label className="field">
                Thickness: {selectedEl.strokeWidth || 1.5}px
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={selectedEl.strokeWidth || 1.5}
                  onChange={e => updateSelected({ strokeWidth: Number(e.target.value) })}
                />
              </label>
            </div>
          )}

          {/* COMMON PROPERTIES: POSITION, SIZE, ROTATION, OPACITY, LAYERING */}
          <div className="property-group">
            <label className="field">
              Opacity: {Math.round((selectedEl.opacity ?? 1) * 100)}%
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={selectedEl.opacity ?? 1}
                onChange={e => updateSelected({ opacity: Number(e.target.value) })}
              />
            </label>

            <label className="field">
              Rotation: {selectedEl.rotation || 0}°
              <input
                type="range"
                min="0"
                max="360"
                value={selectedEl.rotation || 0}
                onChange={e => updateSelected({ rotation: Number(e.target.value) })}
              />
            </label>

            {/* Align to Canvas */}
            <div className="field">
              Align to Canvas
              <div className="align-grid">
                <button type="button" onClick={() => alignElement('left')}>
                  Left
                </button>
                <button type="button" onClick={() => alignElement('center')}>
                  Center X
                </button>
                <button type="button" onClick={() => alignElement('right')}>
                  Right
                </button>
                <button type="button" onClick={() => alignElement('top')}>
                  Top
                </button>
                <button type="button" onClick={() => alignElement('middle')}>
                  Middle Y
                </button>
                <button type="button" onClick={() => alignElement('bottom')}>
                  Bottom
                </button>
              </div>
            </div>

            {/* Layer Ordering */}
            <div className="field">
              Layer Arrangement
              <div className="layer-order-grid">
                <button type="button" onClick={bringToFront} title="Bring to Front">
                  <ChevronsUp size={14} /> To Front
                </button>
                <button type="button" onClick={bringForward} title="Bring Forward">
                  <ChevronUp size={14} /> Forward
                </button>
                <button type="button" onClick={sendBackward} title="Send Backward">
                  <ChevronDown size={14} /> Backward
                </button>
                <button type="button" onClick={sendToBack} title="Send to Back">
                  <ChevronsDown size={14} /> To Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

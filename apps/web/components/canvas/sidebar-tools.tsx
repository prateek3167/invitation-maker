'use client';
import { useRef, useState } from 'react';
import {
  LayoutTemplate,
  Type,
  ImagePlus,
  Sparkles,
  Palette,
  UploadCloud,
  Layers,
  Search,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  Check,
  Shapes,
  Flower2,
  Crown,
  Heart,
} from 'lucide-react';
import type { Invitation, Format } from '../../../../packages/editor-core/document';
import { templates, presets } from '../../../../packages/editor-core/document';
import type { CanvasElement } from '../../../../packages/editor-core/canvas';
import { WEDDING_ELEMENT_TEMPLATES } from '../../../../packages/editor-core/canvas';
import type { ActiveSidebarTab } from './types';
import { readPhoto } from '../../lib/export';

interface SidebarToolsProps {
  document: Invitation;
  elements: CanvasElement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (elements: CanvasElement[]) => void;
  onUpdateDocument: (patch: Partial<Invitation>) => void;
  activeTab: ActiveSidebarTab;
  onTabChange: (tab: ActiveSidebarTab) => void;
}

const WEDDING_PHRASES = [
  { label: 'Invocation', text: '॥ श्री गणेशाय नमः ॥' },
  { label: 'Save the Date', text: 'SAVE THE DATE' },
  { label: 'Together', text: 'Together with their families' },
  { label: 'Invitation', text: 'cordially invite you to celebrate the joyous wedding of' },
  { label: 'Blessing', text: 'Seeking your blessings and warm presence' },
  { label: 'Reception', text: 'Dinner, Music & Reception to follow' },
  { label: 'RSVP', text: 'RSVP: With Warm Regards' },
];

const LUXURY_PALETTES = [
  { name: 'Royal Ruby & Gold', colors: ['#541212', '#fff8ee', '#d4af37'] },
  { name: 'Emerald & Gold', colors: ['#14382c', '#fff9ee', '#c5a059'] },
  { name: 'Turmeric & Marigold', colors: ['#7a450e', '#fffbe6', '#e5a00d'] },
  { name: 'Rose & Champagne', colors: ['#613b49', '#fff0eb', '#ba7c78'] },
  { name: 'Midnight Sapphire', colors: ['#182e43', '#f2eadc', '#ba9a62'] },
  { name: 'Sage & Olive', colors: ['#34453b', '#f2f2e4', '#8c9c78'] },
  { name: 'Terracotta Clay', colors: ['#713e30', '#fff2df', '#c88e68'] },
];

export default function SidebarTools({
  document: doc,
  elements,
  selectedId,
  onSelect,
  onChange,
  onUpdateDocument,
  activeTab,
  onTabChange,
}: SidebarToolsProps) {
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateFilter, setTemplateFilter] = useState<string>('all');
  const [uploads, setUploads] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const [ink, , accent] = doc.palette;

  // Add Element helper
  const addElement = (newEl: Omit<CanvasElement, 'id' | 'zIndex'>) => {
    const maxZ = Math.max(...elements.map(e => e.zIndex || 0), 0);
    const created: CanvasElement = {
      ...newEl,
      id: `el_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      zIndex: maxZ + 1,
    };
    onChange([...elements, created]);
    onSelect(created.id);
  };

  // Upload handler
  const handleFileUpload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const data = await readPhoto(file);
      setUploads(prev => [data, ...prev]);
      // Also add to canvas directly
      addElement({
        type: 'image',
        name: 'Uploaded Photo',
        x: 200,
        y: 280,
        width: 300,
        height: 400,
        frameShape: 'arch',
        src: data,
        cropX: 50,
        cropY: 50,
        zoom: 1,
      });
    } catch (err) {
      console.error('Failed to read image:', err);
    } finally {
      setUploading(false);
      if (uploadInputRef.current) uploadInputRef.current.value = '';
    }
  };

  // Reorder layer
  const moveLayer = (id: string, direction: 'up' | 'down') => {
    const sorted = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    const idx = sorted.findIndex(el => el.id === id);
    if (idx < 0) return;

    if (direction === 'up' && idx < sorted.length - 1) {
      const temp = sorted[idx].zIndex;
      sorted[idx].zIndex = sorted[idx + 1].zIndex;
      sorted[idx + 1].zIndex = temp;
    } else if (direction === 'down' && idx > 0) {
      const temp = sorted[idx].zIndex;
      sorted[idx].zIndex = sorted[idx - 1].zIndex;
      sorted[idx - 1].zIndex = temp;
    }
    onChange([...sorted]);
  };

  // Filter templates
  const filteredTemplates = templates.filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
      t.occasion.toLowerCase().includes(templateSearch.toLowerCase());
    if (templateFilter === 'all') return matchesSearch;
    if (templateFilter === 'royal') return matchesSearch && !!t.royal;
    if (templateFilter === 'photo') return matchesSearch && t.photo;
    return matchesSearch && t.occasion.toLowerCase() === templateFilter.toLowerCase();
  });

  return (
    <div className="canva-sidebar">
      {/* Icon Dock */}
      <nav className="canva-sidebar-dock" aria-label="Editor tools">
        <button
          type="button"
          className={activeTab === 'templates' ? 'active' : ''}
          onClick={() => onTabChange('templates')}
          title="Templates"
        >
          <LayoutTemplate size={20} />
          <span>Templates</span>
        </button>
        <button
          type="button"
          className={activeTab === 'text' ? 'active' : ''}
          onClick={() => onTabChange('text')}
          title="Text"
        >
          <Type size={20} />
          <span>Text</span>
        </button>
        <button
          type="button"
          className={activeTab === 'photos' ? 'active' : ''}
          onClick={() => onTabChange('photos')}
          title="Photos"
        >
          <ImagePlus size={20} />
          <span>Photos</span>
        </button>
        <button
          type="button"
          className={activeTab === 'elements' ? 'active' : ''}
          onClick={() => onTabChange('elements')}
          title="Elements"
        >
          <Sparkles size={20} />
          <span>Elements</span>
        </button>
        <button
          type="button"
          className={activeTab === 'backgrounds' ? 'active' : ''}
          onClick={() => onTabChange('backgrounds')}
          title="Background"
        >
          <Palette size={20} />
          <span>Colors</span>
        </button>
        <button
          type="button"
          className={activeTab === 'uploads' ? 'active' : ''}
          onClick={() => onTabChange('uploads')}
          title="Uploads"
        >
          <UploadCloud size={20} />
          <span>Uploads</span>
        </button>
        <button
          type="button"
          className={activeTab === 'layers' ? 'active' : ''}
          onClick={() => onTabChange('layers')}
          title="Layers"
        >
          <Layers size={20} />
          <span>Layers</span>
        </button>
      </nav>

      {/* Expanded Tab Drawer */}
      <div className="canva-sidebar-content">
        {/* TEMPLATES TAB */}
        {activeTab === 'templates' && (
          <div className="sidebar-tab-pane">
            <div className="pane-header">
              <h3>Templates Catalog</h3>
              <p>Switch designs or explore styles</p>
            </div>
            <div className="sidebar-search-box">
              <Search size={14} />
              <input
                type="text"
                placeholder="Search royal, floral, modern..."
                value={templateSearch}
                onChange={e => setTemplateSearch(e.target.value)}
              />
            </div>
            <div className="sidebar-filter-pills">
              {['all', 'royal', 'photo', 'Wedding', 'Sangeet', 'Mehndi', 'Haldi'].map(f => (
                <button
                  key={f}
                  type="button"
                  className={templateFilter === f ? 'selected' : ''}
                  onClick={() => setTemplateFilter(f)}
                >
                  {f === 'all' ? 'All (80)' : f}
                </button>
              ))}
            </div>
            <div className="sidebar-template-grid">
              {filteredTemplates.slice(0, 30).map(t => (
                <button
                  key={t.id}
                  type="button"
                  className={`sidebar-template-card ${doc.templateId === t.id ? 'active' : ''}`}
                  onClick={() => {
                    onUpdateDocument({
                      templateId: t.id,
                      palette: [...t.palette],
                      canvasElements: undefined, // Will re-decompose into new template elements
                    });
                  }}
                >
                  <div
                    className="sidebar-template-swatch"
                    style={{ background: t.palette[1], border: `2px solid ${t.palette[2]}` }}
                  >
                    <span style={{ color: t.palette[0] }}>{t.name.split(' ')[0]}</span>
                  </div>
                  <strong>{t.name}</strong>
                  <small>{t.occasion}</small>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TEXT TAB */}
        {activeTab === 'text' && (
          <div className="sidebar-tab-pane">
            <div className="pane-header">
              <h3>Add Text</h3>
              <p>Click to add lettering to your invitation</p>
            </div>
            <div className="text-actions-list">
              <button
                type="button"
                className="add-text-btn heading-btn"
                onClick={() =>
                  addElement({
                    type: 'text',
                    name: 'Heading Text',
                    text: 'A Royal Celebration',
                    x: 100,
                    y: 300,
                    width: 500,
                    height: 60,
                    fontSize: 32,
                    fontWeight: 'bold',
                    fontFamily: doc.font === 'modern' ? 'Arial, sans-serif' : 'Georgia, serif',
                    color: ink,
                    textAlign: 'center',
                  })
                }
              >
                <strong>Add a heading</strong>
                <span>32pt serif bold</span>
              </button>

              <button
                type="button"
                className="add-text-btn subheading-btn"
                onClick={() =>
                  addElement({
                    type: 'text',
                    name: 'Subheading Text',
                    text: 'Together with their families',
                    x: 150,
                    y: 380,
                    width: 400,
                    height: 40,
                    fontSize: 18,
                    fontStyle: 'italic',
                    fontFamily: 'Georgia, serif',
                    color: accent,
                    textAlign: 'center',
                  })
                }
              >
                <strong>Add a subheading</strong>
                <span>18pt romantic italic</span>
              </button>

              <button
                type="button"
                className="add-text-btn body-btn"
                onClick={() =>
                  addElement({
                    type: 'text',
                    name: 'Body Details',
                    text: 'Saturday, November 28th, 2026\nGrand Hyatt Ballroom, Mumbai',
                    x: 100,
                    y: 440,
                    width: 500,
                    height: 50,
                    fontSize: 14,
                    color: ink,
                    textAlign: 'center',
                    lineHeight: 1.3,
                  })
                }
              >
                <strong>Add event details</strong>
                <span>14pt date, time & venue</span>
              </button>
            </div>

            <div className="pane-section-title">
              <Crown size={14} />
              <span>Auspicious Wedding Phrasing</span>
            </div>
            <div className="wedding-phrases-list">
              {WEDDING_PHRASES.map(item => (
                <button
                  key={item.label}
                  type="button"
                  className="wedding-phrase-item"
                  onClick={() =>
                    addElement({
                      type: 'text',
                      name: item.label,
                      text: item.text,
                      x: 100,
                      y: 350,
                      width: 500,
                      height: 50,
                      fontSize: item.label === 'Invocation' ? 24 : 16,
                      color: item.label === 'Invocation' ? accent : ink,
                      textAlign: 'center',
                    })
                  }
                >
                  <strong>{item.label}</strong>
                  <span>{item.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PHOTOS TAB */}
        {activeTab === 'photos' && (
          <div className="sidebar-tab-pane">
            <div className="pane-header">
              <h3>Couple Photographs</h3>
              <p>Upload portraits and choose frame styles</p>
            </div>

            <div className="photo-slot-cards">
              <div className="photo-slot-card">
                <div className="slot-icon">
                  <Flower2 size={24} />
                </div>
                <div>
                  <strong>Bride Portrait Frame</strong>
                  <span>Royal arch framed portrait</span>
                </div>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() =>
                    addElement({
                      type: 'image',
                      name: 'Bride Portrait',
                      x: 100,
                      y: 240,
                      width: 220,
                      height: 300,
                      frameShape: 'arch',
                      stroke: accent,
                      strokeWidth: 2,
                      photoSlot: 'bride',
                      zoom: 1,
                      cropX: 50,
                      cropY: 50,
                    })
                  }
                >
                  <Plus size={14} /> Add Frame
                </button>
              </div>

              <div className="photo-slot-card">
                <div className="slot-icon">
                  <Crown size={24} />
                </div>
                <div>
                  <strong>Groom Portrait Frame</strong>
                  <span>Royal arch framed portrait</span>
                </div>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() =>
                    addElement({
                      type: 'image',
                      name: 'Groom Portrait',
                      x: 380,
                      y: 240,
                      width: 220,
                      height: 300,
                      frameShape: 'arch',
                      stroke: accent,
                      strokeWidth: 2,
                      photoSlot: 'groom',
                      zoom: 1,
                      cropX: 50,
                      cropY: 50,
                    })
                  }
                >
                  <Plus size={14} /> Add Frame
                </button>
              </div>

              <div className="photo-slot-card">
                <div className="slot-icon">
                  <Heart size={24} />
                </div>
                <div>
                  <strong>Single Couple Frame</strong>
                  <span>Center oval or rectangular portrait</span>
                </div>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() =>
                    addElement({
                      type: 'image',
                      name: 'Couple Photograph',
                      x: 200,
                      y: 240,
                      width: 300,
                      height: 380,
                      frameShape: 'oval',
                      stroke: accent,
                      strokeWidth: 2,
                      photoSlot: 'single',
                      zoom: 1,
                      cropX: 50,
                      cropY: 50,
                    })
                  }
                >
                  <Plus size={14} /> Add Frame
                </button>
              </div>
            </div>

            <div className="pane-section-title">
              <span>Quick Upload New Photo</span>
            </div>
            <button
              type="button"
              className="sidebar-upload-dropzone"
              onClick={() => uploadInputRef.current?.click()}
            >
              <UploadCloud size={24} />
              <span>{uploading ? 'Processing photo…' : 'Choose portrait from computer'}</span>
              <small>JPG, PNG, WebP up to 12MB</small>
            </button>
            <input
              ref={uploadInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={e => handleFileUpload(e.target.files?.[0])}
            />
          </div>
        )}

        {/* ELEMENTS TAB */}
        {activeTab === 'elements' && (
          <div className="sidebar-tab-pane">
            <div className="pane-header">
              <h3>Design Elements</h3>
              <p>Traditional Indian wedding ornaments & shapes</p>
            </div>

            <div className="pane-section-title">
              <Sparkles size={14} />
              <span>Auspicious Ornaments</span>
            </div>
            <div className="elements-ornaments-grid">
              {Object.entries(WEDDING_ELEMENT_TEMPLATES).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  className="ornament-card-btn"
                  onClick={() =>
                    addElement({
                      type: 'ornament',
                      name: item.name,
                      x: Math.round(350 - item.width / 2),
                      y: 300,
                      width: item.width,
                      height: item.height,
                      shapeType: item.shapeType,
                      stroke: accent,
                      fill: accent,
                      strokeWidth: 1.5,
                    })
                  }
                >
                  <div className="ornament-icon-preview">
                    {key === 'kalash' && '🏺'}
                    {key === 'mandala' && '☸️'}
                    {key === 'toran' && '🌿'}
                    {key === 'lanterns' && '🏮'}
                    {key === 'peacock' && '🦚'}
                    {key === 'henna' && '✨'}
                    {key === 'divider' && '━ ◈ ━'}
                  </div>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>

            <div className="pane-section-title">
              <Shapes size={14} />
              <span>Geometric Shapes</span>
            </div>
            <div className="shapes-button-grid">
              <button
                type="button"
                className="shape-btn"
                onClick={() =>
                  addElement({
                    type: 'shape',
                    name: 'Rectangle',
                    x: 200,
                    y: 350,
                    width: 300,
                    height: 200,
                    shapeType: 'rect',
                    fill: 'none',
                    stroke: accent,
                    strokeWidth: 2,
                  })
                }
              >
                <div className="shape-preview rect" />
                <span>Rectangle</span>
              </button>
              <button
                type="button"
                className="shape-btn"
                onClick={() =>
                  addElement({
                    type: 'shape',
                    name: 'Circle',
                    x: 250,
                    y: 350,
                    width: 200,
                    height: 200,
                    shapeType: 'circle',
                    fill: 'none',
                    stroke: accent,
                    strokeWidth: 2,
                  })
                }
              >
                <div className="shape-preview circle" />
                <span>Circle</span>
              </button>
              <button
                type="button"
                className="shape-btn"
                onClick={() =>
                  addElement({
                    type: 'shape',
                    name: 'Accent Line',
                    x: 150,
                    y: 400,
                    width: 400,
                    height: 20,
                    shapeType: 'line',
                    stroke: accent,
                    strokeWidth: 1.5,
                  })
                }
              >
                <div className="shape-preview line" />
                <span>Divider Line</span>
              </button>
              <button
                type="button"
                className="shape-btn"
                onClick={() =>
                  addElement({
                    type: 'ornament',
                    name: 'Decorative Border',
                    x: 40,
                    y: 40,
                    width: 620,
                    height: 900,
                    shapeType: 'border',
                    stroke: accent,
                    strokeWidth: 2,
                  })
                }
              >
                <div className="shape-preview border-box" />
                <span>Page Border</span>
              </button>
            </div>
          </div>
        )}

        {/* BACKGROUNDS TAB */}
        {activeTab === 'backgrounds' && (
          <div className="sidebar-tab-pane">
            <div className="pane-header">
              <h3>Background & Palettes</h3>
              <p>Customize royal stationery colors</p>
            </div>

            <div className="pane-section-title">
              <span>Luxury Color Stories</span>
            </div>
            <div className="palettes-drawer-list">
              {LUXURY_PALETTES.map(p => {
                const isActive = JSON.stringify(doc.palette) === JSON.stringify(p.colors);
                return (
                  <button
                    key={p.name}
                    type="button"
                    className={`palette-drawer-item ${isActive ? 'selected' : ''}`}
                    onClick={() => {
                      onUpdateDocument({ palette: [...p.colors] });
                      // Also update any elements using old palette colors
                      onChange(
                        elements.map(el => {
                          if (el.type === 'background') return { ...el, fill: p.colors[1] };
                          return el;
                        })
                      );
                    }}
                  >
                    <div className="palette-color-triplet">
                      {p.colors.map(c => (
                        <span key={c} style={{ background: c }} />
                      ))}
                    </div>
                    <strong>{p.name}</strong>
                    {isActive && <Check size={16} className="palette-check-icon" />}
                  </button>
                );
              })}
            </div>

            <div className="pane-section-title">
              <span>Page Canvas Format</span>
            </div>
            <div className="format-picker-grid">
              {(Object.entries(presets) as [Format, (typeof presets)[Format]][]).map(
                ([key, preset]) => (
                  <button
                    key={key}
                    type="button"
                    className={`format-card-btn ${doc.format === key ? 'selected' : ''}`}
                    onClick={() => onUpdateDocument({ format: key })}
                  >
                    <strong>{preset.name}</strong>
                    <span>
                      {preset.width} × {preset.height} px
                    </span>
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* UPLOADS TAB */}
        {activeTab === 'uploads' && (
          <div className="sidebar-tab-pane">
            <div className="pane-header">
              <h3>Uploads Library</h3>
              <p>Upload photos, logos & custom graphics</p>
            </div>

            <button
              type="button"
              className="sidebar-upload-dropzone"
              onClick={() => uploadInputRef.current?.click()}
            >
              <UploadCloud size={24} />
              <span>Upload media</span>
              <small>Click to browse local files</small>
            </button>

            {uploads.length > 0 && (
              <div className="uploads-gallery-grid">
                {uploads.map((dataUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="uploaded-thumb-btn"
                    onClick={() =>
                      addElement({
                        type: 'image',
                        name: `Uploaded Item ${idx + 1}`,
                        x: 200,
                        y: 300,
                        width: 250,
                        height: 320,
                        src: dataUrl,
                        frameShape: 'arch',
                        cropX: 50,
                        cropY: 50,
                        zoom: 1,
                      })
                    }
                  >
                    <img src={dataUrl} alt={`Upload ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LAYERS TAB */}
        {activeTab === 'layers' && (
          <div className="sidebar-tab-pane">
            <div className="pane-header">
              <h3>Layers Stack</h3>
              <p>Arrange, lock, hide or delete canvas elements</p>
            </div>

            <div className="layers-stack-list">
              {[...elements]
                .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0))
                .map(el => {
                  const isSelected = el.id === selectedId;
                  return (
                    <div
                      key={el.id}
                      className={`layer-row-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => onSelect(el.id)}
                    >
                      <div className="layer-type-icon">
                        {el.type === 'text' && <Type size={14} />}
                        {el.type === 'image' && <ImagePlus size={14} />}
                        {el.type === 'shape' && <Shapes size={14} />}
                        {el.type === 'ornament' && <Sparkles size={14} />}
                        {el.type === 'background' && <Palette size={14} />}
                      </div>

                      <div className="layer-info">
                        <strong>{el.name}</strong>
                        <small>{el.type}</small>
                      </div>

                      <div className="layer-controls" onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          title="Bring Forward"
                          onClick={() => moveLayer(el.id, 'up')}
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          type="button"
                          title="Send Backward"
                          onClick={() => moveLayer(el.id, 'down')}
                        >
                          <ChevronDown size={14} />
                        </button>
                        <button
                          type="button"
                          title={el.locked ? 'Unlock' : 'Lock'}
                          onClick={() =>
                            onChange(
                              elements.map(e =>
                                e.id === el.id ? { ...e, locked: !e.locked } : e
                              )
                            )
                          }
                        >
                          {el.locked ? <Lock size={14} /> : <Unlock size={14} />}
                        </button>
                        <button
                          type="button"
                          title={el.hidden ? 'Show' : 'Hide'}
                          onClick={() =>
                            onChange(
                              elements.map(e =>
                                e.id === el.id ? { ...e, hidden: !e.hidden } : e
                              )
                            )
                          }
                        >
                          {el.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          type="button"
                          className="danger"
                          title="Delete element"
                          onClick={() => {
                            onChange(elements.filter(e => e.id !== el.id));
                            if (selectedId === el.id) onSelect(null);
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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
  Languages,
  ScrollText,
  Wand2,
  Copy,
} from 'lucide-react';
import type { Invitation, Format } from '../../../../packages/editor-core/document';
import {
  templates,
  presets,
  generateInvitationCopy,
  type GeneratedInvitationCopy,
} from '../../../../packages/editor-core/document';
import type { CanvasElement } from '../../../../packages/editor-core/canvas';
import { WEDDING_ELEMENT_TEMPLATES } from '../../../../packages/editor-core/canvas';
import {
  VEDIC_SHLOKAS,
  convertDocumentToHindi,
  applyDevanagariFontsToElements,
} from '../../../../packages/editor-core/shlokas';
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
  const [shlokaCategory, setShlokaCategory] = useState<string>('all');
  const [elementCategory, setElementCategory] = useState<string>('all');
  const [hindiConverted, setHindiConverted] = useState(false);
  const [uploads, setUploads] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const [ink, , accent] = doc.palette;

  const handleConvertToHindi = () => {
    const hindiPreset = convertDocumentToHindi(doc);
    onUpdateDocument({
      fields: hindiPreset.fields,
      font: 'serif',
    });
    const updated = applyDevanagariFontsToElements(elements);
    onChange(updated);
    setHindiConverted(true);
    setTimeout(() => setHindiConverted(false), 3000);
  };

  // AI Copywriter State
  const [aiCeremony, setAiCeremony] = useState<'vivah' | 'haldi' | 'mehndi' | 'sangeet' | 'reception' | 'sagaai'>('vivah');
  const [aiTone, setAiTone] = useState<'royal' | 'traditional' | 'romantic' | 'playful' | 'formal'>('royal');
  const [aiVoice, setAiVoice] = useState<'couple' | 'bride_parents' | 'groom_parents' | 'friends'>('couple');
  const [aiLang, setAiLang] = useState<'hindi' | 'english' | 'hinglish'>('hindi');
  const [aiBride, setAiBride] = useState(doc.fields.partner || 'Aarushi');
  const [aiGroom, setAiGroom] = useState(doc.fields.host || 'Siddharth');
  const [aiSurname, setAiSurname] = useState('Parivar');
  const [aiGenerated, setAiGenerated] = useState<GeneratedInvitationCopy[]>(() =>
    generateInvitationCopy({
      ceremony: 'vivah',
      tone: 'royal',
      voice: 'couple',
      language: 'hindi',
      brideName: doc.fields.partner || 'Aarushi',
      groomName: doc.fields.host || 'Siddharth',
      familySurname: 'Parivar',
    })
  );
  const [aiAppliedId, setAiAppliedId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleGenerateAi = () => {
    const results = generateInvitationCopy({
      ceremony: aiCeremony,
      tone: aiTone,
      voice: aiVoice,
      language: aiLang,
      brideName: aiBride.trim() || 'Aarushi',
      groomName: aiGroom.trim() || 'Siddharth',
      familySurname: aiSurname.trim() || 'Parivar',
    });
    setAiGenerated(results);
  };

  const handleApplyAiCopy = (copy: GeneratedInvitationCopy) => {
    onUpdateDocument({
      fields: {
        ...doc.fields,
        heading: copy.heading,
        host: aiGroom.trim() || doc.fields.host,
        partner: aiBride.trim() || doc.fields.partner,
        message: copy.message,
      },
    });

    let updatedElements = [...elements];
    let messageFound = false;

    updatedElements = updatedElements.map(el => {
      if (el.type !== 'text') return el;
      const textVal = el.text || '';
      if (el.fieldBinding === 'heading' || textVal.includes('॥') || textVal.toLowerCase().includes('ganesh')) {
        return { ...el, text: copy.heading, fontFamily: copy.recommendedFont };
      }
      if (el.fieldBinding === 'host' || el.fieldBinding === 'partner' || (el.fontSize && el.fontSize >= 32)) {
        return { ...el, text: copy.title, fontFamily: copy.recommendedFont };
      }
      if (el.fieldBinding === 'message' || textVal.length > 40) {
        messageFound = true;
        return { ...el, text: copy.message, fontFamily: copy.recommendedFont };
      }
      return el;
    });

    if (!messageFound) {
      const maxZ = Math.max(...updatedElements.map(e => e.zIndex || 0), 0);
      updatedElements.push({
        id: `el_ai_msg_${Date.now()}`,
        name: 'Wedding Message',
        type: 'text',
        x: 80,
        y: 420,
        width: 540,
        height: 100,
        rotation: 0,
        zIndex: maxZ + 1,
        text: copy.message,
        fontSize: 16,
        fontFamily: copy.recommendedFont,
        color: ink,
        textAlign: 'center',
        lineHeight: 1.5,
      });
    }

    onChange(updatedElements);
    setAiAppliedId(copy.id);
    setTimeout(() => setAiAppliedId(null), 3000);
  };

  const handleCopySnippet = (text: string, label: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    }
  };

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
          className={activeTab === 'ai' ? 'active' : ''}
          onClick={() => onTabChange('ai')}
          title="AI Wedding Copywriter"
        >
          <Wand2 size={20} />
          <span>AI Writer</span>
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
              {filteredTemplates.map(t => (
                <button
                  key={t.id}
                  type="button"
                  className={`sidebar-template-card ${doc.templateId === t.id ? 'active' : ''}`}
                  onClick={() => {
                    onUpdateDocument({
                      templateId: t.id,
                      templateSnapshot: structuredClone(t),
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
              <h3>Add Text &amp; Shlokas</h3>
              <p>Devanagari calligraphy, Vedic shlokas &amp; headings</p>
            </div>

            {/* 1-Click Hindi Converter Card */}
            <div className="hindi-preset-banner">
              <div className="hindi-banner-left">
                <Languages size={20} className="hindi-icon" />
                <div>
                  <strong>हिंदी निमंत्रण (Shudh Hindi Preset)</strong>
                  <span>1-click translate names, greetings &amp; details to Devanagari</span>
                </div>
              </div>
              <button
                type="button"
                className={`button ${hindiConverted ? 'secondary' : ''}`}
                onClick={handleConvertToHindi}
              >
                {hindiConverted ? '✓ Converted!' : 'हिंदी में बदलें'}
              </button>
            </div>

            {/* Devanagari Quick Typography */}
            <div className="pane-section-title">
              <Type size={14} />
              <span>Devanagari Typography (देवनागरी फॉन्ट्स)</span>
            </div>
            <div className="text-actions-list">
              <button
                type="button"
                className="add-text-btn heading-btn"
                onClick={() =>
                  addElement({
                    type: 'text',
                    name: 'Shubh Vivah Heading',
                    text: '॥ शुभ विवाह ॥',
                    x: 100,
                    y: 280,
                    width: 500,
                    height: 65,
                    fontSize: 36,
                    fontWeight: 'bold',
                    fontFamily: "'Rozha One', serif",
                    color: accent,
                    textAlign: 'center',
                  })
                }
              >
                <strong style={{ fontFamily: "'Rozha One', serif", fontSize: 16 }}>॥ शुभ विवाह ॥</strong>
                <span>36pt Rozha One (शाही हेडिंग)</span>
              </button>

              <button
                type="button"
                className="add-text-btn subheading-btn"
                onClick={() =>
                  addElement({
                    type: 'text',
                    name: 'Sanskrit Invocation',
                    text: 'परमपिता परमेश्वर की असीम अनुकंपा से',
                    x: 100,
                    y: 355,
                    width: 500,
                    height: 40,
                    fontSize: 18,
                    fontFamily: "'Tiro Devanagari Hindi', serif",
                    color: ink,
                    textAlign: 'center',
                  })
                }
              >
                <strong style={{ fontFamily: "'Tiro Devanagari Hindi', serif" }}>परमपिता परमेश्वर के आशीर्वाद से</strong>
                <span>18pt Tiro Devanagari (शास्त्रीय)</span>
              </button>

              <button
                type="button"
                className="add-text-btn festive-btn"
                onClick={() =>
                  addElement({
                    type: 'text',
                    name: 'Festive Calligraphy',
                    text: 'सजेगी मेहंदी, रचेगा प्यार',
                    x: 120,
                    y: 400,
                    width: 460,
                    height: 45,
                    fontSize: 22,
                    fontFamily: "'Kalam', cursive",
                    color: accent,
                    textAlign: 'center',
                  })
                }
              >
                <strong style={{ fontFamily: "'Kalam', cursive" }}>सजेगी मेहंदी, रचेगा प्यार</strong>
                <span>22pt Kalam (उत्सव कैलीग्राफी)</span>
              </button>

              <button
                type="button"
                className="add-text-btn body-btn"
                onClick={() =>
                  addElement({
                    type: 'text',
                    name: 'Hindi Event Details',
                    text: 'शनिवार, २८ नवंबर २०२६ · सायं ७:०० बजे\nशाही पैलेस, नई दिल्ली',
                    x: 100,
                    y: 450,
                    width: 500,
                    height: 50,
                    fontSize: 14,
                    fontFamily: "'Noto Serif Devanagari', serif",
                    color: ink,
                    textAlign: 'center',
                    lineHeight: 1.35,
                  })
                }
              >
                <strong style={{ fontFamily: "'Noto Serif Devanagari', serif" }}>शनिवार, २८ नवंबर २०२६</strong>
                <span>14pt Noto Serif (वैदिक विवरण)</span>
              </button>
            </div>

            {/* Vedic Shlokas & Mantras Library */}
            <div className="pane-section-title">
              <ScrollText size={14} />
              <span>पवित्र वैदिक श्लोक एवं मंत्र (Vedic Shlokas)</span>
            </div>

            {/* Shloka Category Filter Pills */}
            <div className="shloka-filter-pills">
              {[
                { id: 'all', label: 'सभी' },
                { id: 'ganesh', label: 'गणेश वंदना' },
                { id: 'vivah', label: 'विवाह मंगल' },
                { id: 'gauri', label: 'मां गौरी' },
                { id: 'saptapadi', label: 'सप्तपदी/फेरे' },
                { id: 'shanti', label: 'शांति पाठ' },
                { id: 'headlines', label: 'मांगलिक शीर्षक' },
                { id: 'traditional_lines', label: 'आमंत्रण पंक्तियां' },
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className={`pill-btn ${shlokaCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setShlokaCategory(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="vedic-shlokas-list">
              {VEDIC_SHLOKAS.filter(s => shlokaCategory === 'all' || s.category === shlokaCategory).map(item => (
                <button
                  key={item.id}
                  type="button"
                  className="vedic-shloka-card"
                  onClick={() =>
                    addElement({
                      type: 'text',
                      name: item.title,
                      text: item.sanskrit,
                      x: 80,
                      y: 330,
                      width: 540,
                      height: item.sanskrit.includes('\n') ? 75 : 50,
                      fontSize: item.suggestedFontSize,
                      fontFamily: item.suggestedFont,
                      color: item.category === 'headlines' || item.category === 'ganesh' ? accent : ink,
                      textAlign: 'center',
                      lineHeight: 1.35,
                    })
                  }
                >
                  <div className="shloka-card-top">
                    <strong>{item.hindiTitle}</strong>
                    <span className="shloka-font-tag">{item.suggestedFont.split("'")[1] || 'Serif'}</span>
                  </div>
                  <p className="shloka-verse" style={{ fontFamily: item.suggestedFont }}>
                    {item.sanskrit}
                  </p>
                  <small className="shloka-meaning">{item.meaning}</small>
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
              <h3>Traditional Elements &amp; Shapes</h3>
              <p>Authentic Indian wedding vector ornaments &amp; sacred symbols</p>
            </div>

            {/* Element Category Filter Pills */}
            <div className="shloka-filter-pills">
              {[
                { id: 'all', label: 'सभी तत्व (All)' },
                { id: 'sacred', label: '🕉️ पवित्र प्रतीक' },
                { id: 'ceremony', label: '🎺 विवाह रस्में' },
                { id: 'decor', label: '🦚 राजसी सज्जा' },
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className={`pill-btn ${elementCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setElementCategory(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="pane-section-title">
              <Sparkles size={14} />
              <span>Auspicious Ornaments ({Object.entries(WEDDING_ELEMENT_TEMPLATES).filter(([, item]) => elementCategory === 'all' || item.category === elementCategory).length})</span>
            </div>
            <div className="elements-ornaments-grid">
              {Object.entries(WEDDING_ELEMENT_TEMPLATES)
                .filter(([, item]) => elementCategory === 'all' || item.category === elementCategory)
                .map(([key, item]) => {
                  const icons: Record<string, string> = {
                    ganesha_royal: '👑 🕉️',
                    ganesha_minimal: '🕉️',
                    swastik: '卐',
                    om: 'ॐ',
                    kalash: '🏺',
                    mandala: '☸️',
                    doli: '🎪 🪑',
                    shehnai: '🎺 🥁',
                    baarat_elephant: '🐘',
                    havan_kund: '🔥',
                    mangalsutra: '📿 💍',
                    peacock_pair: '🦚 🦚',
                    diya: '🪔',
                    namaste: '🙏',
                    marigold_garland: '🏵️ 🌿',
                    toran: '🌿',
                    lanterns: '🏮',
                    peacock: '🦚',
                    henna: '✨',
                    divider: '━ ◈ ━',
                  };
                  return (
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
                        {icons[key] || '✨'}
                      </div>
                      <span>{item.name}</span>
                    </button>
                  );
                })}
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

        {/* AI WEDDING COPYWRITER TAB */}
        {activeTab === 'ai' && (
          <div className="sidebar-tab-pane">
            <div className="pane-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wand2 size={18} style={{ color: '#d4af37' }} />
                <h3>AI Wedding Copywriter</h3>
              </div>
              <p>स्मार्ट निमंत्रण एवं वैदिक श्लोक सहायक</p>
            </div>

            {/* Input Controls */}
            <div
              style={{
                padding: '0.75rem',
                background: 'rgba(212, 175, 55, 0.08)',
                borderRadius: '8px',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                marginBottom: '1rem',
              }}
            >
              <div style={{ marginBottom: '0.6rem' }}>
                <label
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '0.25rem',
                    color: '#666',
                  }}
                >
                  Ceremony (समारोह)
                </label>
                <select
                  value={aiCeremony}
                  onChange={e => setAiCeremony(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '0.4rem 0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    fontSize: '0.85rem',
                  }}
                >
                  <option value="vivah">Vivah / Shaadi (शुभ विवाह)</option>
                  <option value="haldi">Haldi (हल्दी उत्सव)</option>
                  <option value="mehndi">Mehndi (मेहंदी की रात)</option>
                  <option value="sangeet">Sangeet (संगीत संध्या)</option>
                  <option value="reception">Reception (प्रीतिभोज)</option>
                  <option value="sagaai">Sagaai (सगाई / Engagement)</option>
                </select>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  marginBottom: '0.6rem',
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '0.25rem',
                      color: '#666',
                    }}
                  >
                    Tone (शैली)
                  </label>
                  <select
                    value={aiTone}
                    onChange={e => setAiTone(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '0.4rem 0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      fontSize: '0.85rem',
                    }}
                  >
                    <option value="royal">Royal & Regal (शाही)</option>
                    <option value="traditional">Traditional (पारंपरिक)</option>
                    <option value="romantic">Romantic (रोमांटिक)</option>
                    <option value="playful">Playful (मस्ती भरा)</option>
                    <option value="formal">Formal (औपचारिक)</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '0.25rem',
                      color: '#666',
                    }}
                  >
                    Voice (पक्ष)
                  </label>
                  <select
                    value={aiVoice}
                    onChange={e => setAiVoice(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '0.4rem 0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      fontSize: '0.85rem',
                    }}
                  >
                    <option value="couple">Couple (वर-वधू)</option>
                    <option value="bride_parents">Bride Parents (कन्या पक्ष)</option>
                    <option value="groom_parents">Groom Parents (वर पक्ष)</option>
                    <option value="friends">Friends & Siblings (मित्रगण)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '0.6rem' }}>
                <label
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '0.25rem',
                    color: '#666',
                  }}
                >
                  Language (भाषा)
                </label>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {(['hindi', 'english', 'hinglish'] as const).map(l => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setAiLang(l)}
                      style={{
                        flex: 1,
                        padding: '0.35rem 0.4rem',
                        borderRadius: '4px',
                        border: aiLang === l ? '1px solid #8b181b' : '1px solid #ccc',
                        background: aiLang === l ? '#8b181b' : '#fff',
                        color: aiLang === l ? '#fff' : '#333',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                      }}
                    >
                      {l === 'hindi' ? 'हिंदी' : l === 'english' ? 'English' : 'Hinglish'}
                    </button>
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  marginBottom: '0.6rem',
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '0.25rem',
                      color: '#666',
                    }}
                  >
                    Bride Name
                  </label>
                  <input
                    type="text"
                    value={aiBride}
                    onChange={e => setAiBride(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.4rem 0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '0.25rem',
                      color: '#666',
                    }}
                  >
                    Groom Name
                  </label>
                  <input
                    type="text"
                    value={aiGroom}
                    onChange={e => setAiGroom(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.4rem 0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '0.6rem' }}>
                <label
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '0.25rem',
                    color: '#666',
                  }}
                >
                  Family Surname (परिवार का उपनाम)
                </label>
                <input
                  type="text"
                  value={aiSurname}
                  onChange={e => setAiSurname(e.target.value)}
                  placeholder="e.g. Sharma or Kapoor"
                  style={{
                    width: '100%',
                    padding: '0.4rem 0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handleGenerateAi}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  background: 'linear-gradient(135deg, #8b181b, #541212)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                }}
              >
                <Sparkles size={16} />
                <span>Generate Wording & Shlokas</span>
              </button>
            </div>

            {/* Generated Options Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '2rem' }}>
              {aiGenerated.map((opt, idx) => {
                const isApplied = aiAppliedId === opt.id;
                return (
                  <div
                    key={opt.id || idx}
                    style={{
                      background: '#fff',
                      borderRadius: '8px',
                      border: '1px solid #e2d9c8',
                      padding: '0.9rem',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.4rem',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#8b181b',
                          background: '#fff0ee',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '12px',
                        }}
                      >
                        {opt.heading}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopySnippet(opt.heading, `h_${idx}`)}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#888' }}
                        title="Copy heading"
                      >
                        {copiedText === `h_${idx}` ? (
                          <Check size={14} color="#16a34a" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>

                    <h4
                      style={{
                        margin: '0 0 0.2rem 0',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: '#222',
                      }}
                    >
                      {opt.title}
                    </h4>
                    <p
                      style={{
                        margin: '0 0 0.5rem 0',
                        fontSize: '0.8rem',
                        color: '#666',
                        fontStyle: 'italic',
                      }}
                    >
                      {opt.subtitle}
                    </p>

                    <div
                      style={{
                        background: '#fdfcf9',
                        padding: '0.6rem',
                        borderRadius: '6px',
                        border: '1px dashed #d4af37',
                        marginBottom: '0.6rem',
                      }}
                    >
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#333', lineHeight: 1.5 }}>
                        {opt.message}
                      </p>
                    </div>

                    {opt.rhymeOrQuote && (
                      <div
                        style={{
                          background: '#fff9ee',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          marginBottom: '0.6rem',
                          borderLeft: '3px solid #d4af37',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            color: '#8a6200',
                            textTransform: 'uppercase',
                            display: 'block',
                            marginBottom: '0.2rem',
                          }}
                        >
                          Vedic Shloka / Folk Verse
                        </span>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '0.78rem',
                            color: '#554212',
                            fontStyle: 'italic',
                          }}
                        >
                          {opt.rhymeOrQuote}
                        </p>
                      </div>
                    )}

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '0.6rem',
                        borderTop: '1px solid #eee',
                        paddingTop: '0.6rem',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.72rem',
                          color: '#6366f1',
                          background: '#eef2ff',
                          padding: '0.15rem 0.4rem',
                          borderRadius: '4px',
                          fontWeight: 600,
                        }}
                      >
                        {opt.hashtag}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleApplyAiCopy(opt)}
                        style={{
                          background: isApplied ? '#16a34a' : '#8b181b',
                          color: '#fff',
                          border: 'none',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '4px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          transition: 'background 0.2s',
                        }}
                      >
                        {isApplied ? (
                          <>
                            <Check size={14} />
                            <span>Applied!</span>
                          </>
                        ) : (
                          <>
                            <Wand2 size={13} />
                            <span>Apply to Canvas</span>
                          </>
                        )}
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

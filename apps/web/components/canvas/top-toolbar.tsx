'use client';
import {
  ArrowLeft,
  Download,
  RotateCcw,
  RotateCw,
  Save,
  Sparkles,
  FileText,
  Crown,
} from 'lucide-react';
import type { Invitation } from '../../../../packages/editor-core/document';

interface TopToolbarProps {
  document: Invitation;
  onBack: () => void;
  status: string;
  dirty: boolean;
  onSave: () => void;
  onDownload: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  mode: 'visual' | 'guided';
  onModeChange: (mode: 'visual' | 'guided') => void;
  suiteCount?: number;
  currentCardIndex?: number;
  eventTag?: string;
}

export default function TopToolbar({
  document: doc,
  onBack,
  status,
  dirty,
  onSave,
  onDownload,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  mode,
  onModeChange,
  suiteCount = 1,
  currentCardIndex = 0,
  eventTag,
}: TopToolbarProps) {
  return (
    <header className="canva-top-toolbar" aria-label="Editor toolbar">
      <div className="toolbar-left">
        <button
          type="button"
          className="text-button"
          onClick={onBack}
          aria-label="Back to studio"
        >
          <ArrowLeft size={16} />
          <span>Back to Studio</span>
        </button>

        <div className="toolbar-document-meta">
          <div className="toolbar-title-row">
            <strong title={doc.title}>{doc.title || 'Wedding Invitation'}</strong>
            {suiteCount > 1 && (
              <span className="toolbar-suite-tag">
                <Crown size={11} /> Card {currentCardIndex + 1}/{suiteCount} · {eventTag || doc.fields.heading.split(' ')[0]}
              </span>
            )}
          </div>
          <span className="save-status-pill" aria-live="polite">
            <span className={`status-dot ${dirty ? 'pending' : ''}`} />
            {status}
          </span>
        </div>
      </div>

      <div className="toolbar-center">
        {/* Undo / Redo */}
        <div className="history-button-group">
          <button
            type="button"
            disabled={!canUndo}
            onClick={onUndo}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
          >
            <RotateCcw size={15} />
          </button>
          <button
            type="button"
            disabled={!canRedo}
            onClick={onRedo}
            title="Redo (Ctrl+Y)"
            aria-label="Redo"
          >
            <RotateCw size={15} />
          </button>
        </div>

        {/* Mode Switcher Toggle: Visual Studio vs Guided Form */}
        <div className="editor-mode-toggle" role="tablist" aria-label="Editor mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'visual'}
            className={mode === 'visual' ? 'active' : ''}
            onClick={() => onModeChange('visual')}
          >
            <Sparkles size={14} />
            <span>Visual Studio</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'guided'}
            className={mode === 'guided' ? 'active' : ''}
            onClick={() => onModeChange('guided')}
          >
            <FileText size={14} />
            <span>Guided Details</span>
          </button>
        </div>
      </div>

      <div className="toolbar-right">
        <button
          type="button"
          className="button secondary toolbar-save-btn"
          onClick={onSave}
          title="Save Draft"
        >
          <Save size={15} />
          <span>Save</span>
        </button>
        <button
          type="button"
          className="button toolbar-download-btn"
          onClick={onDownload}
          title="Download & Export"
        >
          <Download size={15} />
          <span>Download</span>
        </button>
      </div>
    </header>
  );
}

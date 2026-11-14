'use client';
import { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Sparkles,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Crown,
  Calendar,
} from 'lucide-react';
import type { Invitation } from '../../../../packages/editor-core/document';
import { WEDDING_CEREMONIES, getCeremony } from '../../../../packages/editor-core/suite';

interface SuiteBarProps {
  cards: Invitation[];
  activeIndex: number;
  onSelectCard: (index: number) => void;
  onAddCard: (ceremonyId: string) => void;
  onGenerateSuite: () => void;
  onDuplicateCard: (index: number) => void;
  onDeleteCard: (index: number) => void;
  onMoveCard: (fromIndex: number, toIndex: number) => void;
}

export default function SuiteBar({
  cards,
  activeIndex,
  onSelectCard,
  onAddCard,
  onGenerateSuite,
  onDuplicateCard,
  onDeleteCard,
  onMoveCard,
}: SuiteBarProps) {
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setAddMenuOpen(false);
      }
    };
    if (addMenuOpen) {
      window.addEventListener('mousedown', handleClickOutside);
    }
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [addMenuOpen]);

  return (
    <footer className="canva-suite-bar" aria-label="Wedding Suite Cards Navigation">
      <div className="suite-bar-header">
        <div className="suite-title-badge">
          <Crown size={14} />
          <strong>Wedding Suite</strong>
          <span className="suite-count-tag">{cards.length} {cards.length === 1 ? 'Card' : 'Cards'}</span>
        </div>

        {cards.length === 1 && (
          <button
            type="button"
            className="suite-magic-gen-btn"
            onClick={onGenerateSuite}
            title="Generate full 5-card wedding set (Save the Date, Haldi, Mehndi, Sangeet, Vivah)"
          >
            <Sparkles size={14} />
            <span>Generate 5-Card Suite</span>
          </button>
        )}
      </div>

      {/* Horizontal Strip of Cards */}
      <div className="suite-cards-track">
        {cards.map((card, idx) => {
          const isActive = idx === activeIndex;
          const ceremony = getCeremony(card.eventTag?.toLowerCase().replace(/\s+/g, '-') || 'shaadi');
          const [ink, paper, accent] = card.palette;

          return (
            <div
              key={card.id || idx}
              className={`suite-card-thumb ${isActive ? 'active' : ''}`}
              onClick={() => onSelectCard(idx)}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') onSelectCard(idx);
              }}
              aria-label={`Select ${card.eventTag || card.fields.heading || `Card ${idx + 1}`}`}
            >
              {/* Card Mini Art Preview */}
              <div
                className="card-thumb-art"
                style={{
                  background: paper,
                  border: `2px solid ${isActive ? '#7c3aed' : accent}`,
                }}
              >
                <div className="card-thumb-badge" style={{ color: ink }}>
                  <span className="ceremony-emoji">{ceremony.iconEmoji}</span>
                  <small>{card.eventTag || ceremony.name}</small>
                </div>
                <div className="card-thumb-heading" style={{ color: ink }}>
                  {card.fields.heading.slice(0, 22)}
                </div>
                <div className="card-thumb-names" style={{ color: accent }}>
                  {card.fields.host.split(' ')[0]} & {card.fields.partner ? card.fields.partner.split(' ')[0] : 'Wedding'}
                </div>
              </div>

              {/* Card Meta & Number */}
              <div className="card-thumb-footer">
                <span className="card-index-pill">{idx + 1}</span>
                <strong className="card-event-name">{card.eventTag || ceremony.name}</strong>
              </div>

              {/* Hover Quick Actions */}
              <div className="card-thumb-actions" onClick={e => e.stopPropagation()}>
                {idx > 0 && (
                  <button
                    type="button"
                    title="Move Left"
                    onClick={() => onMoveCard(idx, idx - 1)}
                  >
                    <ChevronLeft size={12} />
                  </button>
                )}
                {idx < cards.length - 1 && (
                  <button
                    type="button"
                    title="Move Right"
                    onClick={() => onMoveCard(idx, idx + 1)}
                  >
                    <ChevronRight size={12} />
                  </button>
                )}
                <button
                  type="button"
                  title="Duplicate Card"
                  onClick={() => onDuplicateCard(idx)}
                >
                  <Copy size={12} />
                </button>
                {cards.length > 1 && (
                  <button
                    type="button"
                    className="danger"
                    title="Delete Card"
                    onClick={() => onDeleteCard(idx)}
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Add Event Card Button & Popup Menu */}
        <div className="suite-add-card-container" ref={menuRef}>
          <button
            type="button"
            className="suite-add-card-btn"
            onClick={() => setAddMenuOpen(prev => !prev)}
            aria-expanded={addMenuOpen}
          >
            <Plus size={18} />
            <span>Add Event Card</span>
          </button>

          {addMenuOpen && (
            <div className="suite-ceremony-popup-menu">
              <div className="popup-menu-heading">
                <Calendar size={13} />
                <span>Choose Ceremony Event</span>
              </div>

              <div className="popup-ceremony-list">
                {WEDDING_CEREMONIES.map(ceremony => (
                  <button
                    key={ceremony.id}
                    type="button"
                    className="popup-ceremony-item"
                    onClick={() => {
                      onAddCard(ceremony.id);
                      setAddMenuOpen(false);
                    }}
                  >
                    <span className="ceremony-item-icon">{ceremony.iconEmoji}</span>
                    <div className="ceremony-item-info">
                      <strong>{ceremony.name}</strong>
                      <small>{ceremony.hindiName}</small>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

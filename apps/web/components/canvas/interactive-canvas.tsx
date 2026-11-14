'use client';
import { useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import type { Invitation } from '../../../../packages/editor-core/document';
import { presets } from '../../../../packages/editor-core/document';
import type { CanvasElement } from '../../../../packages/editor-core/canvas';
import type { DragState, HandleType, SnapGuide } from './types';

interface InteractiveCanvasProps {
  document: Invitation;
  elements: CanvasElement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (elements: CanvasElement[]) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  artworkData?: string;
}

function clientToSvg(svg: SVGSVGElement, clientX: number, clientY: number): { x: number; y: number } {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: clientX, y: clientY };
  const svgPt = pt.matrixTransform(ctm.inverse());
  return { x: svgPt.x, y: svgPt.y };
}

function lines(str: string, maxLen = 30): string[] {
  const words = str.split(/\s+/).filter(Boolean);
  if (!words.length) return [''];
  const out: string[] = [];
  let cur = '';
  for (const w of words) {
    if (!cur) cur = w;
    else if ((cur + ' ' + w).length <= maxLen) cur += ' ' + w;
    else { out.push(cur); cur = w; }
  }
  if (cur) out.push(cur);
  return out;
}

export default function InteractiveCanvas({
  document: doc,
  elements,
  selectedId,
  onSelect,
  onChange,
  zoom,
  onZoomChange,
  artworkData,
}: InteractiveCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([]);
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);

  const { width: presetW, height: presetH } = presets[doc.format];
  const ratio = presetW / presetH;
  const viewW = ratio >= 700 / 980 ? 980 * ratio : 700;
  const viewH = ratio >= 700 / 980 ? 980 : 700 / ratio;
  const minX = -(viewW - 700) / 2;
  const minY = -(viewH - 980) / 2;

  const selectedEl = elements.find(el => el.id === selectedId) || null;
  const [ink, paper, accent] = doc.palette;

  // Keyboard navigation & shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input, textarea, or contentEditable
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (!selectedEl) return;

      if (e.key === 'Escape') {
        onSelect(null);
        setInlineEditingId(null);
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && !selectedEl.locked) {
        e.preventDefault();
        onChange(elements.filter(el => el.id !== selectedEl.id));
        onSelect(null);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        const clone: CanvasElement = {
          ...selectedEl,
          id: `el_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: `${selectedEl.name} (Copy)`,
          x: selectedEl.x + 20,
          y: selectedEl.y + 20,
          zIndex: Math.max(...elements.map(e => e.zIndex || 0), 0) + 1,
        };
        onChange([...elements, clone]);
        onSelect(clone.id);
        return;
      }

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && !selectedEl.locked) {
        e.preventDefault();
        const delta = e.shiftKey ? 10 : 1;
        const dx = e.key === 'ArrowLeft' ? -delta : e.key === 'ArrowRight' ? delta : 0;
        const dy = e.key === 'ArrowUp' ? -delta : e.key === 'ArrowDown' ? delta : 0;

        onChange(
          elements.map(el =>
            el.id === selectedEl.id
              ? { ...el, x: Math.round(el.x + dx), y: Math.round(el.y + dy) }
              : el
          )
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEl, elements, onChange, onSelect]);

  // Pointer interactions for dragging, resizing, rotating
  const handlePointerDownElement = (e: React.PointerEvent, el: CanvasElement) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    onSelect(el.id);
    if (el.locked || !svgRef.current) return;

    const pt = clientToSvg(svgRef.current, e.clientX, e.clientY);
    setDragState({
      mode: 'move',
      elementId: el.id,
      startPointer: pt,
      startElement: {
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        rotation: el.rotation || 0,
      },
    });
    setSnapGuides([]);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const handlePointerDownHandle = (e: React.PointerEvent, handle: HandleType) => {
    if (e.button !== 0 || !selectedEl || selectedEl.locked || !svgRef.current) return;
    e.stopPropagation();

    const pt = clientToSvg(svgRef.current, e.clientX, e.clientY);
    setDragState({
      mode: handle === 'rotate' ? 'rotate' : 'resize',
      elementId: selectedEl.id,
      handle,
      startPointer: pt,
      startElement: {
        x: selectedEl.x,
        y: selectedEl.y,
        width: selectedEl.width,
        height: selectedEl.height,
        rotation: selectedEl.rotation || 0,
      },
      aspectRatio: selectedEl.type === 'image' ? selectedEl.width / selectedEl.height : undefined,
    });
    setSnapGuides([]);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState || !svgRef.current) return;

    const currentPt = clientToSvg(svgRef.current, e.clientX, e.clientY);
    const { mode, handle, startPointer, startElement, aspectRatio } = dragState;
    const dx = currentPt.x - startPointer.x;
    const dy = currentPt.y - startPointer.y;

    if (mode === 'move') {
      let nextX = startElement.x + dx;
      let nextY = startElement.y + dy;
      const guides: SnapGuide[] = [];

      // Canvas Center Snapping
      const centerX = nextX + startElement.width / 2;
      const centerY = nextY + startElement.height / 2;
      const SNAP_THRESHOLD = 8;

      if (Math.abs(centerX - 350) < SNAP_THRESHOLD) {
        nextX = 350 - startElement.width / 2;
        guides.push({ type: 'vertical', position: 350 });
      }
      if (Math.abs(centerY - 490) < SNAP_THRESHOLD) {
        nextY = 490 - startElement.height / 2;
        guides.push({ type: 'horizontal', position: 490 });
      }

      setSnapGuides(guides);
      onChange(
        elements.map(el =>
          el.id === dragState.elementId ? { ...el, x: Math.round(nextX), y: Math.round(nextY) } : el
        )
      );
    } else if (mode === 'resize' && handle) {
      let { x, y, width, height } = startElement;
      const MIN_SIZE = 24;

      if (handle.includes('e')) width = Math.max(MIN_SIZE, startElement.width + dx);
      if (handle.includes('s')) height = Math.max(MIN_SIZE, startElement.height + dy);
      if (handle.includes('w')) {
        const newW = Math.max(MIN_SIZE, startElement.width - dx);
        x = startElement.x + (startElement.width - newW);
        width = newW;
      }
      if (handle.includes('n')) {
        const newH = Math.max(MIN_SIZE, startElement.height - dy);
        y = startElement.y + (startElement.height - newH);
        height = newH;
      }

      if (aspectRatio && (handle === 'nw' || handle === 'ne' || handle === 'se' || handle === 'sw')) {
        if (Math.abs(dx) > Math.abs(dy)) {
          height = width / aspectRatio;
        } else {
          width = height * aspectRatio;
        }
      }

      onChange(
        elements.map(el =>
          el.id === dragState.elementId
            ? { ...el, x: Math.round(x), y: Math.round(y), width: Math.round(width), height: Math.round(height) }
            : el
        )
      );
    } else if (mode === 'rotate') {
      const cx = startElement.x + startElement.width / 2;
      const cy = startElement.y + startElement.height / 2;
      const rad = Math.atan2(currentPt.y - cy, currentPt.x - cx);
      let deg = Math.round((rad * 180) / Math.PI + 90);
      if (deg < 0) deg += 360;

      // 45-degree angle snap
      const snapPoints = [0, 45, 90, 135, 180, 225, 270, 315, 360];
      for (const sp of snapPoints) {
        if (Math.abs(deg - sp) <= 3) {
          deg = sp % 360;
          break;
        }
      }

      onChange(
        elements.map(el => (el.id === dragState.elementId ? { ...el, rotation: deg } : el))
      );
    }
  };

  const handlePointerUp = () => {
    setDragState(null);
    setSnapGuides([]);
  };

  const sortedElements = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  return (
    <div
      ref={containerRef}
      className="interactive-canvas-container"
      onPointerDown={e => {
        if (e.target === svgRef.current || (e.target as HTMLElement).tagName === 'rect') {
          onSelect(null);
          setInlineEditingId(null);
        }
      }}
    >
      <div
        className="interactive-canvas-scaler"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          transition: dragState ? 'none' : 'transform 0.15s ease',
        }}
      >
        <svg
          ref={svgRef}
          width={presetW}
          height={presetH}
          viewBox={`${minX} ${minY} ${viewW} ${viewH}`}
          className="canvas-interactive-svg"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Base Background Paper */}
          <rect x={minX} y={minY} width={viewW} height={viewH} fill={paper} />

          {/* Render All Elements */}
          {sortedElements.map(el => {
            if (el.hidden) return null;
            const isSelected = el.id === selectedId;
            const rot = el.rotation || 0;
            const cx = el.x + el.width / 2;
            const cy = el.y + el.height / 2;
            const transform = rot ? `rotate(${rot} ${cx} ${cy})` : undefined;
            const opacity = el.opacity ?? 1;

            if (el.type === 'background') {
              if (artworkData) {
                return (
                  <image
                    key={el.id}
                    href={artworkData}
                    x={el.x}
                    y={el.y}
                    width={el.width}
                    height={el.height}
                    preserveAspectRatio="xMidYMid slice"
                    opacity={opacity}
                    onPointerDown={e => handlePointerDownElement(e, el)}
                  />
                );
              }
              return (
                <rect
                  key={el.id}
                  x={el.x}
                  y={el.y}
                  width={el.width}
                  height={el.height}
                  fill={el.fill || paper}
                  opacity={opacity}
                  onPointerDown={e => handlePointerDownElement(e, el)}
                />
              );
            }

            if (el.type === 'image') {
              const clipId = `clip_interactive_${el.id}`;
              const shape = el.frameShape || 'arch';
              const photoData =
                el.photoSlot === 'bride'
                  ? doc.portraits?.bride?.data
                  : el.photoSlot === 'groom'
                  ? doc.portraits?.groom?.data
                  : doc.photo?.data;

              return (
                <g
                  key={el.id}
                  transform={transform}
                  opacity={opacity}
                  className={`canvas-element ${isSelected ? 'selected' : ''}`}
                  onPointerDown={e => handlePointerDownElement(e, el)}
                  style={{ cursor: el.locked ? 'default' : 'move' }}
                >
                  <defs>
                    <clipPath id={clipId}>
                      {shape === 'arch' && (
                        <path
                          d={`M${el.x} ${el.y + el.width / 2} A${el.width / 2} ${el.width / 2} 0 0 1 ${
                            el.x + el.width
                          } ${el.y + el.width / 2} L${el.x + el.width} ${el.y + el.height} L${el.x} ${
                            el.y + el.height
                          } Z`}
                        />
                      )}
                      {shape === 'oval' && (
                        <ellipse cx={cx} cy={cy} rx={el.width / 2} ry={el.height / 2} />
                      )}
                      {shape === 'circle' && (
                        <circle cx={cx} cy={cy} r={Math.min(el.width, el.height) / 2} />
                      )}
                      {shape === 'rect' && (
                        <rect x={el.x} y={el.y} width={el.width} height={el.height} rx="8" />
                      )}
                    </clipPath>
                  </defs>

                  {photoData ? (
                    <image
                      href={photoData}
                      clipPath={`url(#${clipId})`}
                      x={el.x - el.width * ((el.zoom || 1) - 1) * 0.5 + ((el.cropX || 50) - 50) * 2}
                      y={el.y - el.height * ((el.zoom || 1) - 1) * 0.5 + ((el.cropY || 50) - 50) * 2}
                      width={el.width * (el.zoom || 1)}
                      height={el.height * (el.zoom || 1)}
                      preserveAspectRatio="xMidYMid slice"
                    />
                  ) : (
                    <g clipPath={`url(#${clipId})`}>
                      <rect x={el.x} y={el.y} width={el.width} height={el.height} fill="#f4ece1" />
                      <circle
                        cx={cx}
                        cy={el.y + el.height * 0.38}
                        r={el.width * 0.14}
                        fill={el.stroke || accent}
                        fillOpacity="0.25"
                      />
                      <path
                        d={`M${el.x + el.width * 0.28} ${el.y + el.height * 0.78} Q${
                          el.x + el.width * 0.3
                        } ${el.y + el.height * 0.54} ${cx} ${el.y + el.height * 0.56} Q${
                          el.x + el.width * 0.7
                        } ${el.y + el.height * 0.54} ${el.x + el.width * 0.72} ${
                          el.y + el.height * 0.78
                        } Z`}
                        fill={el.stroke || accent}
                        fillOpacity="0.25"
                      />
                      <text
                        x={cx}
                        y={el.y + el.height * 0.88}
                        textAnchor="middle"
                        fill={el.stroke || accent}
                        fontFamily="Arial, sans-serif"
                        fontSize="10"
                        letterSpacing="1.5"
                      >
                        {el.name.toUpperCase()}
                      </text>
                    </g>
                  )}

                  {/* Frame Stroke */}
                  {shape === 'arch' && (
                    <path
                      d={`M${el.x} ${el.y + el.width / 2} A${el.width / 2} ${el.width / 2} 0 0 1 ${
                        el.x + el.width
                      } ${el.y + el.width / 2} L${el.x + el.width} ${el.y + el.height} L${el.x} ${
                        el.y + el.height
                      } Z`}
                      fill="none"
                      stroke={el.stroke || accent}
                      strokeWidth={el.strokeWidth || 2}
                    />
                  )}
                  {shape === 'oval' && (
                    <ellipse
                      cx={cx}
                      cy={cy}
                      rx={el.width / 2}
                      ry={el.height / 2}
                      fill="none"
                      stroke={el.stroke || accent}
                      strokeWidth={el.strokeWidth || 2}
                    />
                  )}
                  {shape === 'circle' && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={Math.min(el.width, el.height) / 2}
                      fill="none"
                      stroke={el.stroke || accent}
                      strokeWidth={el.strokeWidth || 2}
                    />
                  )}
                  {shape === 'rect' && (
                    <rect
                      x={el.x}
                      y={el.y}
                      width={el.width}
                      height={el.height}
                      rx="8"
                      fill="none"
                      stroke={el.stroke || accent}
                      strokeWidth={el.strokeWidth || 2}
                    />
                  )}
                </g>
              );
            }

            if (el.type === 'text') {
              const family =
                el.fontFamily || (doc.font === 'modern' ? 'Arial, sans-serif' : 'Georgia, serif');
              const size = el.fontSize || 16;
              const weight = el.fontWeight || 'normal';
              const style = el.fontStyle || (doc.font === 'italic' ? 'italic' : 'normal');
              const color = el.color || ink;
              const align = el.textAlign || 'center';
              const spacing = el.letterSpacing || 0;
              const textX = align === 'center' ? cx : align === 'right' ? el.x + el.width : el.x;
              const anchor = align === 'center' ? 'middle' : align === 'right' ? 'end' : 'start';
              const rowList = lines(el.text || '', Math.max(8, Math.floor(el.width / (size * 0.5))));

              return (
                <g
                  key={el.id}
                  transform={transform}
                  opacity={opacity}
                  className={`canvas-element ${isSelected ? 'selected' : ''}`}
                  onPointerDown={e => handlePointerDownElement(e, el)}
                  onDoubleClick={() => setInlineEditingId(el.id)}
                  style={{ cursor: el.locked ? 'default' : 'move' }}
                >
                  <text
                    textAnchor={anchor}
                    fill={color}
                    fontFamily={family}
                    fontSize={size}
                    fontWeight={weight}
                    fontStyle={style}
                    letterSpacing={spacing}
                  >
                    {rowList.map((row, i) => (
                      <tspan
                        key={i}
                        x={textX}
                        y={el.y + size * 0.9 + i * size * (el.lineHeight || 1.25)}
                      >
                        {row}
                      </tspan>
                    ))}
                  </text>
                </g>
              );
            }

            if (el.type === 'shape') {
              const fill = el.fill || 'none';
              const stroke = el.stroke || 'none';
              const strokeW = el.strokeWidth || 1;
              const dash = el.strokeDasharray;

              return (
                <g
                  key={el.id}
                  transform={transform}
                  opacity={opacity}
                  className={`canvas-element ${isSelected ? 'selected' : ''}`}
                  onPointerDown={e => handlePointerDownElement(e, el)}
                  style={{ cursor: el.locked ? 'default' : 'move' }}
                >
                  {el.shapeType === 'circle' || el.shapeType === 'ellipse' ? (
                    <ellipse
                      cx={cx}
                      cy={cy}
                      rx={el.width / 2}
                      ry={el.height / 2}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={strokeW}
                      strokeDasharray={dash}
                    />
                  ) : el.shapeType === 'line' ? (
                    <line
                      x1={el.x}
                      y1={cy}
                      x2={el.x + el.width}
                      y2={cy}
                      stroke={stroke || accent}
                      strokeWidth={strokeW}
                      strokeDasharray={dash}
                    />
                  ) : (
                    <rect
                      x={el.x}
                      y={el.y}
                      width={el.width}
                      height={el.height}
                      rx="8"
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={strokeW}
                      strokeDasharray={dash}
                    />
                  )}
                </g>
              );
            }

            if (el.type === 'ornament') {
              const stroke = el.stroke || accent;
              const fill = el.fill || accent;

              return (
                <g
                  key={el.id}
                  transform={transform}
                  opacity={opacity}
                  className={`canvas-element ${isSelected ? 'selected' : ''}`}
                  onPointerDown={e => handlePointerDownElement(e, el)}
                  style={{ cursor: el.locked ? 'default' : 'move' }}
                >
                  {el.shapeType === 'border' ? (
                    <rect
                      x={el.x}
                      y={el.y}
                      width={el.width}
                      height={el.height}
                      fill="none"
                      stroke={stroke}
                      strokeWidth={el.strokeWidth || 1.2}
                    />
                  ) : el.shapeType === 'divider' ? (
                    <g stroke={stroke}>
                      <line
                        x1={el.x}
                        y1={cy}
                        x2={el.x + el.width}
                        y2={cy}
                        strokeWidth="1.2"
                      />
                      <circle cx={cx} cy={cy} r="4" fill={fill} />
                      <circle cx={cx - 16} cy={cy} r="2" fill={fill} />
                      <circle cx={cx + 16} cy={cy} r="2" fill={fill} />
                    </g>
                  ) : el.shapeType === 'kalash' ? (
                    <g stroke={stroke} fill="none" strokeWidth="1.3">
                      <ellipse cx={cx} cy={el.y + el.height * 0.65} rx={el.width * 0.35} ry={el.height * 0.28} />
                      <ellipse cx={cx} cy={el.y + el.height * 0.35} rx={el.width * 0.22} ry={el.height * 0.08} />
                      <circle cx={cx} cy={el.y + el.height * 0.18} r={el.width * 0.16} fill={stroke} fillOpacity="0.2" />
                      <path d={`M${cx - el.width * 0.18} ${el.y + el.height * 0.28} Q${cx - el.width * 0.35} ${el.y + el.height * 0.1} ${cx - el.width * 0.1} ${el.y + el.height * 0.12}`} />
                      <path d={`M${cx + el.width * 0.18} ${el.y + el.height * 0.28} Q${cx + el.width * 0.35} ${el.y + el.height * 0.1} ${cx + el.width * 0.1} ${el.y + el.height * 0.12}`} />
                    </g>
                  ) : el.shapeType === 'mandala' ? (
                    <g stroke={stroke} fill="none" strokeWidth="1.2" opacity="0.85">
                      <circle cx={cx} cy={cy} r={Math.min(el.width, el.height) * 0.44} strokeDasharray="3 4" />
                      <circle cx={cx} cy={cy} r={Math.min(el.width, el.height) * 0.28} />
                      <circle cx={cx} cy={cy} r={Math.min(el.width, el.height) * 0.12} fill={stroke} fillOpacity="0.15" />
                      {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
                        <line
                          key={a}
                          x1={cx}
                          y1={cy}
                          x2={cx + Math.cos((a * Math.PI) / 180) * (Math.min(el.width, el.height) * 0.44)}
                          y2={cy + Math.sin((a * Math.PI) / 180) * (Math.min(el.width, el.height) * 0.44)}
                          opacity="0.5"
                        />
                      ))}
                    </g>
                  ) : el.shapeType === 'lanterns' ? (
                    <g stroke={stroke} fill="none" strokeWidth="1.2">
                      <line x1={el.x + el.width * 0.2} y1={el.y} x2={el.x + el.width * 0.2} y2={el.y + el.height * 0.5} strokeDasharray="2 3" />
                      <polygon points={`${el.x + el.width * 0.2},${el.y + el.height * 0.5} ${el.x + el.width * 0.26},${el.y + el.height * 0.65} ${el.x + el.width * 0.24},${el.y + el.height * 0.85} ${el.x + el.width * 0.16},${el.y + el.height * 0.85} ${el.x + el.width * 0.14},${el.y + el.height * 0.65}`} fill={stroke} fillOpacity="0.2" />
                      <line x1={el.x + el.width * 0.8} y1={el.y} x2={el.x + el.width * 0.8} y2={el.y + el.height * 0.5} strokeDasharray="2 3" />
                      <polygon points={`${el.x + el.width * 0.8},${el.y + el.height * 0.5} ${el.x + el.width * 0.86},${el.y + el.height * 0.65} ${el.x + el.width * 0.84},${el.y + el.height * 0.85} ${el.x + el.width * 0.76},${el.y + el.height * 0.85} ${el.x + el.width * 0.74},${el.y + el.height * 0.65}`} fill={stroke} fillOpacity="0.2" />
                    </g>
                  ) : (
                    el.svgContent && <g dangerouslySetInnerHTML={{ __html: el.svgContent }} />
                  )}
                </g>
              );
            }

            return null;
          })}

          {/* Alignment Snapping Guides */}
          {snapGuides.map((guide, i) =>
            guide.type === 'vertical' ? (
              <line
                key={`snap_v_${i}`}
                x1={guide.position}
                y1={minY}
                x2={guide.position}
                y2={minY + viewH}
                stroke="#a855f7"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                pointerEvents="none"
              />
            ) : (
              <line
                key={`snap_h_${i}`}
                x1={minX}
                y1={guide.position}
                x2={minX + viewW}
                y2={guide.position}
                stroke="#a855f7"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                pointerEvents="none"
              />
            )
          )}

          {/* Interactive Selection Bounding Box & 8 Handles */}
          {selectedEl && (
            <g
              transform={
                selectedEl.rotation
                  ? `rotate(${selectedEl.rotation} ${selectedEl.x + selectedEl.width / 2} ${
                      selectedEl.y + selectedEl.height / 2
                    })`
                  : undefined
              }
            >
              {/* Bounding Box Border */}
              <rect
                x={selectedEl.x}
                y={selectedEl.y}
                width={selectedEl.width}
                height={selectedEl.height}
                fill="none"
                stroke="#7c3aed"
                strokeWidth="1.8"
                strokeDasharray={selectedEl.locked ? '4 3' : undefined}
                pointerEvents="none"
              />

              {/* Lock Indicator */}
              {selectedEl.locked && (
                <g
                  transform={`translate(${selectedEl.x + selectedEl.width - 24}, ${
                    selectedEl.y - 24
                  })`}
                  className="canvas-lock-badge"
                >
                  <circle cx="12" cy="12" r="11" fill="#7c3aed" />
                  <path
                    d="M8 11V9a4 4 0 0 1 8 0v2 M7 11h10v6H7z"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </g>
              )}

              {/* 8 Resize Handles (if unlocked) */}
              {!selectedEl.locked && (
                <>
                  {/* Stem for Rotation Handle */}
                  <line
                    x1={selectedEl.x + selectedEl.width / 2}
                    y1={selectedEl.y}
                    x2={selectedEl.x + selectedEl.width / 2}
                    y2={selectedEl.y - 24}
                    stroke="#7c3aed"
                    strokeWidth="1.5"
                  />
                  {/* Rotation Handle Button */}
                  <g
                    transform={`translate(${selectedEl.x + selectedEl.width / 2}, ${
                      selectedEl.y - 24
                    })`}
                    onPointerDown={e => handlePointerDownHandle(e, 'rotate')}
                    style={{ cursor: 'grab' }}
                  >
                    <circle cx="0" cy="0" r="7" fill="#ffffff" stroke="#7c3aed" strokeWidth="2" />
                    <circle cx="0" cy="0" r="3" fill="#7c3aed" />
                  </g>

                  {/* 8 Points */}
                  {(
                    [
                      { handle: 'nw', x: selectedEl.x, y: selectedEl.y, cursor: 'nwse-resize' },
                      {
                        handle: 'n',
                        x: selectedEl.x + selectedEl.width / 2,
                        y: selectedEl.y,
                        cursor: 'ns-resize',
                      },
                      {
                        handle: 'ne',
                        x: selectedEl.x + selectedEl.width,
                        y: selectedEl.y,
                        cursor: 'nesw-resize',
                      },
                      {
                        handle: 'e',
                        x: selectedEl.x + selectedEl.width,
                        y: selectedEl.y + selectedEl.height / 2,
                        cursor: 'ew-resize',
                      },
                      {
                        handle: 'se',
                        x: selectedEl.x + selectedEl.width,
                        y: selectedEl.y + selectedEl.height,
                        cursor: 'nwse-resize',
                      },
                      {
                        handle: 's',
                        x: selectedEl.x + selectedEl.width / 2,
                        y: selectedEl.y + selectedEl.height,
                        cursor: 'ns-resize',
                      },
                      {
                        handle: 'sw',
                        x: selectedEl.x,
                        y: selectedEl.y + selectedEl.height,
                        cursor: 'nesw-resize',
                      },
                      {
                        handle: 'w',
                        x: selectedEl.x,
                        y: selectedEl.y + selectedEl.height / 2,
                        cursor: 'ew-resize',
                      },
                    ] as const
                  ).map(pt => (
                    <circle
                      key={pt.handle}
                      cx={pt.x}
                      cy={pt.y}
                      r="5.5"
                      fill="#ffffff"
                      stroke="#7c3aed"
                      strokeWidth="2"
                      style={{ cursor: pt.cursor }}
                      onPointerDown={e => handlePointerDownHandle(e, pt.handle)}
                    />
                  ))}
                </>
              )}
            </g>
          )}
        </svg>

        {/* Inline Text Editor Overlay (on double click) */}
        {inlineEditingId && selectedEl && selectedEl.type === 'text' && (
          <div
            className="canvas-inline-text-editor"
            style={{
              position: 'absolute',
              left: `${((selectedEl.x - minX) / viewW) * 100}%`,
              top: `${((selectedEl.y - minY) / viewH) * 100}%`,
              width: `${(selectedEl.width / viewW) * 100}%`,
              minHeight: `${(selectedEl.height / viewH) * 100}%`,
              transform: selectedEl.rotation ? `rotate(${selectedEl.rotation}deg)` : undefined,
            }}
          >
            <textarea
              autoFocus
              className="canvas-inline-input"
              value={selectedEl.text || ''}
              onChange={e => {
                const val = e.target.value;
                onChange(
                  elements.map(el => (el.id === selectedEl.id ? { ...el, text: val } : el))
                );
              }}
              onBlur={() => setInlineEditingId(null)}
              onKeyDown={e => {
                if (e.key === 'Escape') setInlineEditingId(null);
              }}
              style={{
                fontFamily: selectedEl.fontFamily || (doc.font === 'modern' ? 'Arial, sans-serif' : 'Georgia, serif'),
                fontSize: `${(selectedEl.fontSize || 16) * (presetW / viewW)}px`,
                fontWeight: selectedEl.fontWeight || 'normal',
                fontStyle: selectedEl.fontStyle || (doc.font === 'italic' ? 'italic' : 'normal'),
                color: selectedEl.color || ink,
                textAlign: selectedEl.textAlign || 'center',
              }}
            />
          </div>
        )}
      </div>

      {/* Floating Canvas Zoom Controls */}
      <div className="canvas-floating-zoom" aria-label="Canvas zoom controls">
        <button
          type="button"
          onClick={() => onZoomChange(Math.max(0.4, Number((zoom - 0.1).toFixed(2))))}
          title="Zoom out"
          aria-label="Zoom out"
        >
          <ZoomOut size={15} />
        </button>
        <span className="zoom-label">{Math.round(zoom * 100)}%</span>
        <button
          type="button"
          onClick={() => onZoomChange(Math.min(2.0, Number((zoom + 0.1).toFixed(2))))}
          title="Zoom in"
          aria-label="Zoom in"
        >
          <ZoomIn size={15} />
        </button>
        <button
          type="button"
          onClick={() => onZoomChange(1.0)}
          title="Reset zoom"
          aria-label="Reset zoom"
        >
          <Maximize2 size={14} />
        </button>
      </div>
    </div>
  );
}

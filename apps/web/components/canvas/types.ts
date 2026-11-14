export type ActiveSidebarTab =
  | 'templates'
  | 'text'
  | 'photos'
  | 'elements'
  | 'backgrounds'
  | 'uploads'
  | 'layers'
  | 'ai';

export type HandleType = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'rotate';

export interface SnapGuide {
  type: 'horizontal' | 'vertical';
  position: number;
}

export interface DragState {
  mode: 'move' | 'resize' | 'rotate';
  elementId: string;
  handle?: HandleType;
  startPointer: { x: number; y: number };
  startElement: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  };
  aspectRatio?: number;
}

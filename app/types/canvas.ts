export interface CanvasElement {
  id: string;
  type: 'rectangle' | 'circle' | 'text' | 'image' | 'line';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  rotation?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  shadowEnabled?: boolean;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  align?: 'left' | 'center' | 'right';
  fontStyleBold?: boolean;
  fontStyleItalic?: boolean;
  textDecorationUnderline?: boolean;
  points?: number[];
  src?: string;
  isNew?: boolean;
  locked?: boolean;
}

export interface StageConfig {
  scale: number;
  position: { x: number; y: number };
}

export interface ToolType {
  id: 'select' | 'text' | 'rectangle' | 'circle' | 'line' | 'image';
  name: string;
  icon: string;
  shortcut?: string;
} 
export interface CanvasElement {
  id: string;
  type: 'rectangle' | 'circle' | 'text' | 'image' | 'line' | 'path';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  rotation?: number;
  fillType?: 'solid' | 'gradient';
  fill?: string;
  gradient?: GradientConfig;
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
  pathData?: string;
  closed?: boolean;
  filters?: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    blur?: number;
    grayscale?: number;
    sepia?: number;
    hueRotate?: number;
  };
}

export interface StageConfig {
  scale: number;
  position: { x: number; y: number };
}

export interface ToolType {
  id: 'select' | 'text' | 'rectangle' | 'circle' | 'line' | 'image' | 'pen';
  name: string;
  icon: string;
  shortcut?: string;
}

export interface GradientStop {
  color: string;
  position: number; // 0-100
}

export interface GradientConfig {
  type: 'linear' | 'radial';
  angle?: number; // for linear gradients
  stops: GradientStop[];
  // Konva specific points if needed, or derive them
  start?: { x: number; y: number }; 
  end?: { x: number; y: number };
  startRadius?: number;
  endRadius?: number;
} 
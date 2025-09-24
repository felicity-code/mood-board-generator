// Core types for the mood board application

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface ImageElement {
  id: string;
  type: 'image';
  src: string;
  position: Position;
  size: Size;
  rotation: number;
  opacity: number;
  zIndex: number;
}

export interface TextElement {
  id: string;
  type: 'text';
  text: string;
  position: Position;
  fontSize: number;
  fontFamily: string;
  color: string;
  rotation: number;
  opacity: number;
  zIndex: number;
}

export interface ShapeElement {
  id: string;
  type: 'rectangle' | 'circle' | 'line';
  position: Position;
  size: Size;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  rotation: number;
  opacity: number;
  zIndex: number;
}

export type BoardElement = ImageElement | TextElement | ShapeElement;

export interface MoodBoard {
  id: string;
  name: string;
  elements: BoardElement[];
  canvasSize: Size;
  backgroundColor: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ToolbarState {
  selectedTool: 'select' | 'image' | 'text' | 'rectangle' | 'circle' | 'line';
  selectedElement: string | null;
  showGrid: boolean;
  snapToGrid: boolean;
}

export interface CanvasState {
  zoom: number;
  pan: Position;
  selectedElements: string[];
  clipboard: BoardElement[];
}

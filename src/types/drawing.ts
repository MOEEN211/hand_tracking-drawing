export type Tool = 'pencil' | 'brush' | 'marker' | 'eraser' | 'highlighter' | 'circle' | 'rectangle' | 'line';

export type DrawingOptions = {
  color: string;
  size: number;
  opacity: number;
  tool: Tool;
};

export type Layer = {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
};

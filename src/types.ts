export interface Todo {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
}

export type FilterType = "all" | "todo" | "done";

export interface DragAndDropParams {
  itemList: HTMLUListElement;
  onOrderChange: (items: HTMLElement[]) => void;
}

export interface DragState {
  isDragging: boolean;
  selectedItem: HTMLElement | null;
  draggingItem: HTMLElement | null;
  selectedItemIndex: number | null;
  offsetX: number;
  offsetY: number;
  startX: number;
  startY: number;
}

export interface DropGuidelineState {
  element: HTMLElement | null;
  insertIndex: number | null;
  insertReferenceItem: HTMLElement | null;
}

export interface PreviewState {
  element: HTMLElement | null;
  timer: NodeJS.Timeout | null;
  insertIndex: number | null;
  lastPosition: number | null;
}

export interface CreateElementOptions {
  className?: string;
  text?: string;
  attrs?: Record<string, string | number | boolean>;
  events?: {
    [K in keyof HTMLElementEventMap]?: (event: HTMLElementEventMap[K]) => void;
  };
  children?: HTMLElement[];
}

export interface TypingEvent {
  key: string;
  correct: boolean;
  timestamp: number;
}

export interface Word {
  target: string;
  history: TypingEvent[];
  visibleHistory: string;
}

export interface LongSessionRow extends TypingEvent {
  target: string;
}

export interface StorageData {
  [key: string]: Word[];
}

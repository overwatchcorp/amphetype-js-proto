export interface TypingEvent {
  key: string;
  // keep track of targetID so we can match instances of a word if there are multiple of the same
  targetID: number;
  correct: boolean;
  timestamp: number;
}

export interface Word {
  target: string;
  targetID: number;
  history: TypingEvent[];
  visibleHistory: string;
}

export interface LongSessionRow extends TypingEvent {
  target: string;
}

export interface StorageData {
  [key: string]: Word[];
}

export interface WordPerformance {
  // the word that was supposed to be typed
  target: string;
  // there might be multiple attempts for the one word, so we'll keep track of them all
  attempts: {
    key: string[];
    // array of whether the right key was pressed
    correct: boolean[];
    // array of timestamps so we can know how long the word took to type
    timestamps: number[];
  }[];
}

export interface nGramFeedback {
  // letters of nGram e.g. 'thi'
  nGram: string;
  // array of each attempt w/
  // boolean hit/miss for each letter of nGram e.g. true, true, false
  // and how long it took to complete it
  performance: {
    correct: boolean[];
    duration: number;
  }[];
}

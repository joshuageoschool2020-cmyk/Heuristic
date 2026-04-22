export const SAVED_LIBRARY_KEY = "heuristic_library_v1";
export const RECENT_EXPLANATIONS_KEY = "heuristic_recent_v1";
export const MAX_RECENT_EXPLANATIONS = 3;

export type SavedExplanation = {
  id: string;
  topic: string;
  language: string;
  level: string;
  explanation: string;
  createdAt: string;
};

const isBrowser = typeof window !== "undefined";

export function readSavedLibrary(): SavedExplanation[] {
  if (!isBrowser) return [];
  try {
    const raw = window.localStorage.getItem(SAVED_LIBRARY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedExplanation[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeSavedLibrary(items: SavedExplanation[]) {
  if (!isBrowser) return;
  window.localStorage.setItem(SAVED_LIBRARY_KEY, JSON.stringify(items));
}

export function readRecentExplanations(): SavedExplanation[] {
  if (!isBrowser) return [];
  try {
    const raw = window.localStorage.getItem(RECENT_EXPLANATIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedExplanation[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeRecentExplanations(items: SavedExplanation[]) {
  if (!isBrowser) return;
  window.localStorage.setItem(RECENT_EXPLANATIONS_KEY, JSON.stringify(items));
}

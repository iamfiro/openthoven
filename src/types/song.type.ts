// [noteNumber, durationMs]
export type NoteEvent = [number, number];

export interface Song {
  id: number;
  title: string;
  artist: string;
  notes: NoteEvent[];
}

export interface SearchResult {
  title: string;
  artist: string;
  distance: number;
  similarity: number;
}

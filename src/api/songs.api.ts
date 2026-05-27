import type { Song, NoteEvent, SearchResult } from '../types/song.type';

const BASE = '/api/songs';

export async function fetchSongs(): Promise<Song[]> {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error('곡 목록 조회 실패');
  return res.json() as Promise<Song[]>;
}

export async function uploadSong(formData: FormData): Promise<Song> {
  const res = await fetch(`${BASE}/upload`, { method: 'POST', body: formData });
  if (!res.ok) throw new Error('업로드 실패');
  return res.json() as Promise<Song>;
}

export async function searchSong(notes: NoteEvent[]): Promise<SearchResult> {
  const res = await fetch(`${BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes }),
  });
  if (!res.ok) throw new Error('검색 실패');
  return res.json() as Promise<SearchResult>;
}

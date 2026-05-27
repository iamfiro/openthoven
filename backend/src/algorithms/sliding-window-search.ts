import { levenshteinDistance } from './levenshtein';
import type { NoteEvent } from '../types/song.type';

export interface WindowSearchResult {
  minDistance: number;
  bestStart: number;    // 최적 윈도우 시작 인덱스
  totalWindows: number; // 탐색한 윈도우 수
}

/**
 * 슬라이딩 윈도우로 긴 멜로디(songNotes) 안에서
 * 쿼리(query)와 가장 유사한 구간의 최소 Levenshtein Distance를 반환한다.
 */
export function slidingWindowMinDistance(songNotes: NoteEvent[], query: NoteEvent[]): WindowSearchResult {
  const windowSize = query.length;

  if (songNotes.length < windowSize) {
    const dist = levenshteinDistance(songNotes, query);
    return { minDistance: dist, bestStart: 0, totalWindows: 1 };
  }

  let minDistance = Infinity;
  let bestStart = 0;
  const totalWindows = songNotes.length - windowSize + 1;

  for (let start = 0; start <= songNotes.length - windowSize; start++) {
    const window = songNotes.slice(start, start + windowSize);
    const dist = levenshteinDistance(window, query);
    if (dist < minDistance) {
      minDistance = dist;
      bestStart = start;
    }
    if (minDistance === 0) break;
  }

  return { minDistance, bestStart, totalWindows };
}

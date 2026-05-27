import { levenshteinDistance } from './levenshtein';
import type { NoteEvent } from '../types/song.type';

export interface WindowSearchResult {
  minDistance: number;
  bestStart: number;
  totalWindows: number;
}

/**
 * 슬라이딩 윈도우로 songNotes 안에서 query와 가장 유사한 구간을 찾는다.
 * - slice() 없이 인덱스만 전달해 메모리 할당을 제거
 * - globalBest를 넘기면 이미 더 좋은 곡이 있을 때 조기 종료
 */
export function slidingWindowMinDistance(
  songNotes: NoteEvent[],
  query: NoteEvent[],
  globalBest = Infinity,
): WindowSearchResult {
  const windowSize = query.length;

  if (songNotes.length < windowSize) {
    const dist = levenshteinDistance(songNotes, 0, songNotes.length, query, globalBest);
    return { minDistance: dist, bestStart: 0, totalWindows: 1 };
  }

  let minDistance = Infinity;
  let bestStart = 0;
  const totalWindows = songNotes.length - windowSize + 1;

  for (let start = 0; start <= songNotes.length - windowSize; start++) {
    const dist = levenshteinDistance(songNotes, start, windowSize, query, minDistance);
    if (dist < minDistance) {
      minDistance = dist;
      bestStart = start;
    }
    if (minDistance === 0) break;         // 완전 일치
    if (minDistance >= globalBest) break; // 이미 다른 곡이 더 좋음
  }

  return { minDistance, bestStart, totalWindows };
}

import type { NoteEvent } from '../types/song.type';

function substitutionCost(a: NoteEvent, b: NoteEvent): number {
  if (a[0] !== b[0]) return 1;
  const durRatio = Math.abs(a[1] - b[1]) / Math.max(a[1], b[1]);
  return durRatio < 0.5 ? 0 : 0.3;
}

// 모듈 수준에서 재사용 — 매 호출마다 배열을 새로 만들지 않음
let _prev: number[] = [];
let _curr: number[] = [];

/**
 * song[songStart .. songStart+windowSize) 과 query 사이의 Levenshtein Distance.
 * 1D 롤링 배열로 계산해 메모리 할당을 최소화한다.
 * maxDist 이상이 확실해지면 조기 종료해 불필요한 연산을 줄인다.
 */
export function levenshteinDistance(
  song: NoteEvent[], songStart: number, windowSize: number,
  query: NoteEvent[],
  maxDist = Infinity,
): number {
  const m = windowSize;
  const n = query.length;

  // 배열 크기 확보 (필요할 때만 확장)
  while (_prev.length <= n) { _prev.push(0); _curr.push(0); }

  // 이전 행 초기화
  for (let j = 0; j <= n; j++) _prev[j] = j;

  for (let i = 1; i <= m; i++) {
    _curr[0] = i;
    let rowMin = i; // 이 행의 최솟값 추적
    for (let j = 1; j <= n; j++) {
      const cost = substitutionCost(song[songStart + i - 1], query[j - 1]);
      const val = Math.min(_prev[j] + 1, _curr[j - 1] + 1, _prev[j - 1] + cost);
      _curr[j] = val;
      if (val < rowMin) rowMin = val;
    }
    // 이 행의 최솟값이 이미 maxDist 이상이면 더 나아질 수 없음
    if (rowMin >= maxDist) return rowMin;

    // 두 행을 스왑 (메모리 재사용)
    const tmp = _prev; _prev = _curr; _curr = tmp;
  }

  return _prev[n];
}

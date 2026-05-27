import type { NoteEvent } from '../types/song.type';

/**
 * 두 NoteEvent 쌍의 대체 비용을 계산한다.
 * - pitch가 다르면 비용 1
 * - pitch가 같고 duration 차이가 50% 미만이면 비용 0 (완전 일치로 처리)
 * - pitch가 같지만 duration 차이가 크면 비용 0.3
 */
function substitutionCost(a: NoteEvent, b: NoteEvent): number {
  if (a[0] !== b[0]) return 1;
  const durRatio = Math.abs(a[1] - b[1]) / Math.max(a[1], b[1]);
  return durRatio < 0.5 ? 0 : 0.3;
}

/**
 * 두 NoteEvent 배열 사이의 Levenshtein Distance를 계산한다.
 * pitch 불일치 = 비용 1, duration 불일치(pitch 동일) = 비용 0.3
 */
export function levenshteinDistance(a: NoteEvent[], b: NoteEvent[]): number {
  const m = a.length;
  const n = b.length;

  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = substitutionCost(a[i - 1], b[j - 1]);
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,          // 삭제
        dp[i][j - 1] + 1,          // 삽입
        dp[i - 1][j - 1] + cost    // 교체 or 일치
      );
    }
  }

  return dp[m][n];
}

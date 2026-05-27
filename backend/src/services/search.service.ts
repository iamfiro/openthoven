import { getDb } from '../db/database';
import type { SongRow, NoteEvent, SearchResult } from '../types/song.type';
import { slidingWindowMinDistance } from '../algorithms/sliding-window-search';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
function noteName(n: number) {
  return `${NOTE_NAMES[n % 12]}${Math.floor(n / 12) - 1}`;
}

// 이전 블록 위로 올라가서 전체를 덮어씀
let prevLines = 0;
function render(lines: string[]) {
  if (prevLines > 0) {
    process.stdout.write(`\x1B[${prevLines}A`); // 커서 위로
  }
  for (const line of lines) {
    process.stdout.write(`\x1B[2K${line}\n`); // 줄 지우고 새 내용 출력
  }
  prevLines = lines.length;
}

export function findBestMatch(queryNotes: NoteEvent[]): SearchResult | null {
  prevLines = 0;

  const db = getDb();
  const rows = db.prepare('SELECT * FROM songs').all() as SongRow[];

  const queryPitches = queryNotes.map(([n]) => noteName(n)).join(' → ');
  const total = rows.length;

  const header = [
    '┌─────────────────────────────────────────',
    `│ 🔍 검색 시작`,
    `│ 입력 음: ${queryPitches}`,
    `│ 입력 길이: ${queryNotes.length}음 / DB 곡 수: ${total}곡`,
    '├─────────────────────────────────────────',
  ];

  if (total === 0) {
    render([...header, '│ ⚠️  저장된 곡 없음', '└─────────────────────────────────────────', '']);
    return null;
  }

  // 초기 렌더
  render([...header, '│ ⏳ 탐색 중...', '└─────────────────────────────────────────']);

  // 전체 계산하면서 진행 상황 갱신
  const results = rows.map((row, i) => {
    const songNotes = JSON.parse(row.notes) as NoteEvent[];
    const { minDistance, bestStart, totalWindows } = slidingWindowMinDistance(songNotes, queryNotes);
    const similarity = Math.max(0, 1 - minDistance / queryNotes.length);

    const title = row.title.length > 30 ? row.title.slice(0, 30) + '…' : row.title;
    const bar = '█'.repeat(Math.round(similarity * 8)) + '░'.repeat(8 - Math.round(similarity * 8));
    render([
      ...header,
      `│ ⏳ [${i + 1}/${total}] ${title}`,
      `│    Distance: ${minDistance.toFixed(2)}  [${bar}] ${Math.round(similarity * 100)}%`,
      '└─────────────────────────────────────────',
    ]);

    return { row, songNotes, minDistance, bestStart, totalWindows, similarity };
  });

  results.sort((a, b) => a.minDistance - b.minDistance);

  // 최종 결과 렌더
  const top5 = results.slice(0, 5);
  const resultLines: string[] = [...header];

  top5.forEach(({ row, songNotes, minDistance, bestStart, totalWindows, similarity }, rank) => {
    const bar = '█'.repeat(Math.round(similarity * 10)) + '░'.repeat(10 - Math.round(similarity * 10));
    resultLines.push(`│ ${rank + 1}위 🎵 "${row.title}" (${row.artist})`);
    resultLines.push(`│    곡 길이: ${songNotes.length}음 / 윈도우 ${totalWindows}개 탐색`);
    resultLines.push(`│    최적 구간: ${bestStart}~${bestStart + queryNotes.length - 1}번째 음`);
    resultLines.push(`│    Distance: ${minDistance.toFixed(2)}  유사도: [${bar}] ${Math.round(similarity * 100)}%`);
  });

  const best = results[0];
  resultLines.push('├─────────────────────────────────────────');
  resultLines.push(`│ ✅ 최종 결과: "${best.row.title}" (${best.row.artist})`);
  resultLines.push(`│    Distance: ${best.minDistance.toFixed(2)} / 유사도: ${Math.round(best.similarity * 100)}%`);
  resultLines.push('└─────────────────────────────────────────');
  resultLines.push('');

  render(resultLines);

  return {
    title: best.row.title,
    artist: best.row.artist,
    distance: Math.round(best.minDistance * 100) / 100,
    similarity: Math.round(best.similarity * 100) / 100,
  };
}

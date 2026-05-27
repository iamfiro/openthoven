import { getDb } from '../db/database';
import type { SongRow, NoteEvent, SearchResult } from '../types/song.type';
import { slidingWindowMinDistance } from '../algorithms/sliding-window-search';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
function noteName(n: number) {
  return `${NOTE_NAMES[n % 12]}${Math.floor(n / 12) - 1}`;
}

function bar(ratio: number, len = 10) {
  const filled = Math.round(ratio * len);
  return '█'.repeat(filled) + '░'.repeat(len - filled);
}

export function findBestMatch(queryNotes: NoteEvent[]): SearchResult | null {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM songs').all() as SongRow[];

  const queryPitches = queryNotes.map(([n]) => noteName(n)).join(' → ');
  const total = rows.length;

  console.clear();
  console.log('\n┌─────────────────────────────────────────');
  console.log(`│ 🔍 입력 음: ${queryPitches}`);
  console.log(`│    ${queryNotes.length}음 / DB ${total}곡`);

  if (total === 0) {
    console.log('│ ⚠️  저장된 곡 없음');
    console.log('└─────────────────────────────────────────\n');
    return null;
  }

  console.log('├─────────────────────────────────────────');

  let globalBest = Infinity;
  const results = rows.map((row) => {
    const songNotes = JSON.parse(row.notes) as NoteEvent[];
    const { minDistance, bestStart, totalWindows } = slidingWindowMinDistance(songNotes, queryNotes, globalBest);
    if (minDistance < globalBest) globalBest = minDistance;
    const similarity = Math.max(0, 1 - minDistance / queryNotes.length);
    return { row, songNotes, minDistance, bestStart, totalWindows, similarity };
  });

  results.sort((a, b) => a.minDistance - b.minDistance);

  results.slice(0, 5).forEach(({ row, songNotes, minDistance, bestStart, similarity }, rank) => {
    console.log(`│ ${rank + 1}위 "${row.title}" (${row.artist})`);
    console.log(`│    [${bar(similarity)}] ${Math.round(similarity * 100)}%  dist=${minDistance.toFixed(2)}  ${songNotes.length}음  구간 ${bestStart}~${bestStart + queryNotes.length - 1}`);
  });

  const best = results[0];
  console.log('├─────────────────────────────────────────');
  console.log(`│ ✅ "${best.row.title}"  ${Math.round(best.similarity * 100)}% 일치`);
  console.log('└─────────────────────────────────────────\n');

  return {
    title: best.row.title,
    artist: best.row.artist,
    distance: Math.round(best.minDistance * 100) / 100,
    similarity: Math.round(best.similarity * 100) / 100,
  };
}

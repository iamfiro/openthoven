import { parseMidi } from 'midi-file';
import fs from 'fs';
import type { NoteEvent } from '../types/song.type';

interface TempoEntry {
  tick: number;
  tempo: number; // microseconds per beat
  ms: number;    // absolute ms at this entry
}

/**
 * MIDI 파일을 읽어 [noteNumber, durationMs] 배열을 추출한다.
 * noteOn/noteOff 쌍을 매칭해 duration을 계산하고,
 * setTempo 이벤트를 반영해 정확한 ms로 변환한다.
 */
export function parseMidiFile(filePath: string): { notes: NoteEvent[] } {
  const buffer = fs.readFileSync(filePath);
  const midi = parseMidi(Array.from(buffer));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ppq: number = (midi.header as any).ticksPerBeat ?? 480;

  // 모든 트랙의 이벤트를 절대 tick 기준으로 수집
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allEvents: { tick: number; event: any }[] = [];
  for (const track of midi.tracks) {
    let abs = 0;
    for (const event of track) {
      abs += event.deltaTime;
      allEvents.push({ tick: abs, event });
    }
  }
  allEvents.sort((a, b) => a.tick - b.tick);

  // tempo map 구성 (setTempo 이벤트 반영)
  const tempoMap: TempoEntry[] = [{ tick: 0, tempo: 500000, ms: 0 }];
  for (const { tick, event } of allEvents) {
    if (event.type === 'setTempo') {
      const last = tempoMap[tempoMap.length - 1];
      const ms = last.ms + (tick - last.tick) * last.tempo / ppq / 1000;
      tempoMap.push({ tick, tempo: event.microsecondsPerBeat as number, ms });
    }
  }

  function tickToMs(tick: number): number {
    let last = tempoMap[0];
    for (const entry of tempoMap) {
      if (entry.tick > tick) break;
      last = entry;
    }
    return last.ms + (tick - last.tick) * last.tempo / ppq / 1000;
  }

  // noteOn/noteOff 쌍 매칭으로 duration 계산
  const pending = new Map<number, number>(); // noteNumber -> startTick
  const notes: NoteEvent[] = [];

  for (const { tick, event } of allEvents) {
    if (event.type === 'noteOn' && event.velocity > 0) {
      pending.set(event.noteNumber as number, tick);
    } else if (
      event.type === 'noteOff' ||
      (event.type === 'noteOn' && event.velocity === 0)
    ) {
      const startTick = pending.get(event.noteNumber as number);
      if (startTick !== undefined) {
        const durationMs = Math.round(tickToMs(tick) - tickToMs(startTick));
        notes.push([event.noteNumber as number, Math.max(durationMs, 50)]);
        pending.delete(event.noteNumber as number);
      }
    }
  }

  return { notes };
}

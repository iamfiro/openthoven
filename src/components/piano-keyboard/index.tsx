import { useRef } from 'react';
import styles from './style.module.scss';

const WHITE_KEYS: { note: number; label: string }[] = [
  { note: 60, label: 'C4' },
  { note: 62, label: 'D4' },
  { note: 64, label: 'E4' },
  { note: 65, label: 'F4' },
  { note: 67, label: 'G4' },
  { note: 69, label: 'A4' },
  { note: 71, label: 'B4' },
  { note: 72, label: 'C5' },
];

const BLACK_KEYS: { note: number; label: string; offset: number }[] = [
  { note: 61, label: 'C#4', offset: 1 },
  { note: 63, label: 'D#4', offset: 2 },
  { note: 66, label: 'F#4', offset: 4 },
  { note: 68, label: 'G#4', offset: 5 },
  { note: 70, label: 'A#4', offset: 6 },
];

interface Props {
  onNoteInput: (note: number, durationMs: number) => void;
}

export function PianoKeyboard({ onNoteInput }: Props) {
  // 누른 시각을 키별로 기록
  const pressStart = useRef<Map<number, number>>(new Map());

  function handleDown(note: number) {
    pressStart.current.set(note, Date.now());
  }

  function handleUp(note: number) {
    const start = pressStart.current.get(note);
    const duration = start ? Math.max(Date.now() - start, 80) : 200;
    pressStart.current.delete(note);
    onNoteInput(note, duration);
  }

  function keyProps(note: number) {
    return {
      onMouseDown: () => handleDown(note),
      onMouseUp: () => handleUp(note),
      onMouseLeave: () => pressStart.current.delete(note),
      onTouchStart: (e: React.TouchEvent) => { e.preventDefault(); handleDown(note); },
      onTouchEnd: (e: React.TouchEvent) => { e.preventDefault(); handleUp(note); },
    };
  }

  return (
    <div className={styles.keyboard}>
      {WHITE_KEYS.map((k) => (
        <button key={k.note} className={styles.white} title={k.label} {...keyProps(k.note)}>
          <span>{k.label}</span>
        </button>
      ))}
      {BLACK_KEYS.map((k) => (
        <button
          key={k.note}
          className={styles.black}
          style={{ left: `calc(${k.offset} * var(--white-key-width) - var(--black-key-width) / 2)` }}
          title={k.label}
          {...keyProps(k.note)}
        >
          <span>{k.label}</span>
        </button>
      ))}
    </div>
  );
}

import { useState, useRef, useEffect, useCallback } from 'react';
import { BeethovenListener } from '../../components/beethoven-listener';
import { PianoKeyboard } from '../../components/piano-keyboard';
import { SearchResultPanel } from '../../components/search-result';
import { UploadModal } from '../../components/upload-modal';
import { SongListModal } from '../../components/song-list-modal';
import { searchSong } from '../../api/songs.api';
import { useMidi } from '../../hooks/useMidi';
import type { NoteEvent, SearchResult } from '../../types/song.type';
import styles from './style.module.scss';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
function midiToName(note: number) {
  return `${NOTE_NAMES[note % 12]}${Math.floor(note / 12) - 1}`;
}

const MIN_NOTES = 3;
const DEBOUNCE_MS = 700;
const MIN_LISTEN_MS = 4000;
const LOCK_THRESHOLD = 0.75;

const MSG_SEARCHING = [
  '잠깐만요, 더 들어볼게요...',
  '열심히 찾고 있어요!',
  '멜로디를 분석하는 중이에요',
  '조금만 더 연주해주세요',
  '음... 아직 확실하지 않아요',
  '비슷한 곡을 찾는 중이에요...',
];

const MSG_LOW = [
  '비슷한 곡이 있는 것 같아요! 조금만 더...',
  '점점 더 가까워지고 있어요!',
  '힌트가 보여요! 계속 연주해주세요',
  '거의 찾아가고 있어요!',
];

type Status = 'idle' | 'waiting' | 'searching' | 'low' | 'medium' | 'found' | 'error';

export function HomePage() {
  const [listening, setListening] = useState(false);
  const [notes, setNotes] = useState<NoteEvent[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [tentative, setTentative] = useState<SearchResult | null>(null);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showUpload, setShowUpload] = useState(false);
  const [showSongList, setShowSongList] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstNoteTimeRef = useRef<number | null>(null);
  const msgIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const msgIndexRef = useRef(0);

  function startMessageRotation(pool: string[]) {
    if (msgIntervalRef.current) clearInterval(msgIntervalRef.current);
    msgIndexRef.current = 0;
    setMessage(pool[0]);
    msgIntervalRef.current = setInterval(() => {
      msgIndexRef.current = (msgIndexRef.current + 1) % pool.length;
      setMessage(pool[msgIndexRef.current]);
    }, 2000);
  }

  function stopMessageRotation() {
    if (msgIntervalRef.current) clearInterval(msgIntervalRef.current);
  }

  const runSearch = useCallback(async (currentNotes: NoteEvent[]) => {
    setStatus('searching');
    startMessageRotation(MSG_SEARCHING);
    try {
      const res = await searchSong(currentNotes);
      if (res.similarity >= LOCK_THRESHOLD) {
        stopMessageRotation();
        setResult(res);
        setTentative(null);
        setStatus('found');
      } else if (res.similarity >= 0.4) {
        setTentative(res);
        setStatus('medium');
        startMessageRotation(MSG_LOW);
      } else {
        setTentative(res);
        setStatus('low');
        startMessageRotation(MSG_SEARCHING);
      }
    } catch {
      stopMessageRotation();
      setError('백엔드가 실행 중인지 확인하세요.');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    if (!listening || notes.length < MIN_NOTES || status === 'found') return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setStatus('waiting');

    const elapsed = firstNoteTimeRef.current ? Date.now() - firstNoteTimeRef.current : 0;
    const delay = Math.max(DEBOUNCE_MS, MIN_LISTEN_MS - elapsed + DEBOUNCE_MS);

    debounceRef.current = setTimeout(() => { void runSearch(notes); }, delay);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [notes, listening, status, runSearch]);

  useEffect(() => {
    if (!listening) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      stopMessageRotation();
    }
  }, [listening]);

  const handleNoteInput = useCallback((note: number, durationMs: number) => {
    if (!listening || status === 'found') return;
    if (firstNoteTimeRef.current === null) firstNoteTimeRef.current = Date.now();
    setNotes((prev) => [...prev, [note, durationMs]]);
  }, [listening, status]);

  const midi = useMidi(handleNoteInput, listening);

  function handleBeethovenClick() {
    const next = !listening;
    setListening(next);
    if (next) {
      firstNoteTimeRef.current = null;
      setNotes([]);
      setResult(null);
      setTentative(null);
      setError(null);
      setStatus('idle');
    }
  }

  function handleReset() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    stopMessageRotation();
    firstNoteTimeRef.current = null;
    setNotes([]);
    setResult(null);
    setTentative(null);
    setError(null);
    setStatus('idle');
  }

  const isSearching = status === 'waiting' || status === 'searching';
  const isTerminal = status === 'found' || status === 'error';

  return (
    <main className={styles.page}>

      {/* 오른쪽 상단 관리자 버튼 */}
      <div className={styles.topRight}>
        <button className={styles.adminBtn} onClick={() => setShowSongList(true)}>
          곡 목록
        </button>
        <button className={styles.adminBtn} onClick={() => setShowUpload(true)}>
          MIDI 업로드
        </button>
      </div>

      <h1 className={styles.heading}>Openthoven</h1>
      <p className={styles.sub}>Piano Melody Search</p>

      <BeethovenListener listening={listening} onClick={handleBeethovenClick} />

      {listening && (
        <section className={styles.section}>

          <div className={styles.midiStatus}>
            {!midi.supported && (
              <span className={styles.midiUnsupported}>이 브라우저는 Web MIDI를 지원하지 않습니다</span>
            )}
            {midi.supported && midi.permissionError && (
              <span className={styles.midiError}>MIDI 접근 권한이 거부되었습니다</span>
            )}
            {midi.supported && !midi.permissionError && midi.connected && (
              <span className={styles.midiConnected}>
                🎹 {midi.devices.map((d) => d.name).join(', ')} 연결됨
              </span>
            )}
            {midi.supported && !midi.permissionError && !midi.connected && (
              <span className={styles.midiDisconnected}>MIDI 기기 미연결 — 아래 건반을 사용하세요</span>
            )}
          </div>

          <PianoKeyboard onNoteInput={handleNoteInput} />

          {status !== 'idle' && status !== 'found' && status !== 'error' && (
            <div className={styles.statusBox}>
              <div className={`${styles.pulse} ${isSearching ? styles.active : ''}`} />
              <p className={styles.statusMsg}>{message || '분석 준비 중...'}</p>
              {(status === 'low' || status === 'medium') && tentative && (
                <p className={styles.tentative}>
                  혹시 <strong>{tentative.title}</strong>? ({Math.round(tentative.similarity * 100)}% 일치)
                </p>
              )}
            </div>
          )}

          {status === 'found' && (
            <SearchResultPanel result={result} loading={false} error={null} />
          )}

          {status === 'error' && (
            <p className={styles.errorMsg}>{error}</p>
          )}

          <div className={styles.noteDisplay}>
            <span className={styles.noteLabel}>입력된 음: </span>
            <span className={styles.noteValues}>
              {notes.length > 0
                ? notes.map(([n, d]) => `${midiToName(n)}(${d}ms)`).join(' → ')
                : '—'}
            </span>
          </div>

          {notes.length > 0 && !isTerminal && (
            <button className={styles.btnClear} onClick={handleReset}>초기화</button>
          )}
          {isTerminal && (
            <button className={styles.btnClear} onClick={handleReset}>다시 시도</button>
          )}
        </section>
      )}

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
      {showSongList && <SongListModal onClose={() => setShowSongList(false)} />}
    </main>
  );
}

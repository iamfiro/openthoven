import { useEffect, useState } from 'react';
import { fetchSongs } from '../../api/songs.api';
import type { Song } from '../../types/song.type';
import styles from './style.module.scss';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
function noteName(n: number) {
  return `${NOTE_NAMES[n % 12]}${Math.floor(n / 12) - 1}`;
}

interface Props {
  onClose: () => void;
}

export function SongListModal({ onClose }: Props) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSongs()
      .then(setSongs)
      .catch(() => setError('곡 목록을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>등록된 곡 목록 <span className={styles.count}>{!loading && !error ? `${songs.length}곡` : ''}</span></h2>
          <button className={styles.close} onClick={onClose}>✕</button>
        </div>

        <div className={styles.list}>
          {loading && <p className={styles.info}>불러오는 중...</p>}
          {error && <p className={styles.error}>{error}</p>}
          {!loading && !error && songs.length === 0 && (
            <p className={styles.info}>등록된 곡이 없습니다.</p>
          )}
          {songs.map((song) => (
            <div key={song.id} className={styles.item}>
              <div className={styles.itemMain}>
                <span className={styles.itemTitle}>{song.title}</span>
                <span className={styles.itemArtist}>{song.artist}</span>
              </div>
              <div className={styles.itemNotes}>
                {song.notes.slice(0, 8).map(([n]) => noteName(n)).join(' · ')}
                {song.notes.length > 8 && <span className={styles.more}> +{song.notes.length - 8}</span>}
              </div>
              <span className={styles.itemLen}>{song.notes.length}음</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

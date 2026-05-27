import { useState } from 'react';
import { uploadSong } from '../../api/songs.api';
import styles from './style.module.scss';

interface Props {
  onClose: () => void;
}

export function UploadModal({ onClose }: Props) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file || !title || !artist) {
      setMsg('제목, 작곡가, 파일을 모두 입력하세요.');
      return;
    }
    setLoading(true);
    setMsg(null);
    const fd = new FormData();
    fd.append('midi', file);
    fd.append('title', title);
    fd.append('artist', artist);
    try {
      await uploadSong(fd);
      setMsg('✅ 업로드 완료!');
      setTitle('');
      setArtist('');
      setFile(null);
    } catch {
      setMsg('❌ 업로드 실패. 백엔드를 확인하세요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>MIDI 업로드</h2>
          <button className={styles.close} onClick={onClose}>✕</button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label>
            곡 제목
            <input
              placeholder="Für Elise"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label>
            작곡가
            <input
              placeholder="Beethoven"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
            />
          </label>
          <label>
            MIDI 파일
            <input
              type="file"
              accept=".mid,.midi"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          {msg && <p className={msg.startsWith('✅') ? styles.success : styles.error}>{msg}</p>}
          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? '업로드 중...' : '업로드'}
          </button>
        </form>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import styles from './style.module.scss';

import beethoven1 from '../../assets/beethoven-1.png';
import beethoven2 from '../../assets/beethoven-2.png';
import beethoven3 from '../../assets/beethoven-3.png';

const IMAGES = [beethoven1, beethoven2, beethoven3];

interface Props {
  listening: boolean;
  onClick: () => void;
}

export function BeethovenListener({ listening, onClick }: Props) {
  const [imgIndex, setImgIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (listening) {
      intervalRef.current = setInterval(() => {
        setImgIndex((prev) => (prev + 1) % IMAGES.length);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setImgIndex(0);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [listening]);

  return (
    <div className={styles.wrapper}>
      <p className={styles.label}>{listening ? '🎵 듣는 중...' : '클릭해서 곡 찾기 시작'}</p>
      <img
        src={IMAGES[imgIndex]}
        alt="Beethoven"
        className={`${styles.image} ${listening ? styles.bounce : ''}`}
        onClick={onClick}
      />
      {!listening && (
        <div className={styles.bubble}>
          MIDI를 연결하고 나를 눌러봐!
        </div>
      )}
    </div>
  );
}

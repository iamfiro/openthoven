import type { SearchResult } from '../../types/song.type';
import styles from './style.module.scss';

interface Props {
  result: SearchResult | null;
  loading: boolean;
  error: string | null;
}

export function SearchResultPanel({ result, loading, error }: Props) {
  if (loading) {
    return <div className={styles.panel}><p className={styles.info}>검색 중...</p></div>;
  }
  if (error) {
    return <div className={styles.panel}><p className={styles.error}>{error}</p></div>;
  }
  if (!result) return null;

  const pct = Math.round(result.similarity * 100);

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>{result.title}</h3>
      <p className={styles.artist}>{result.artist}</p>
      <div className={styles.bar}>
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
      <p className={styles.score}>유사도 {pct}% · 거리 {result.distance}</p>
    </div>
  );
}

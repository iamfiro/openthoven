import { Request, Response } from 'express';
import { getDb } from '../db/database';
import { parseMidiFile } from '../services/midi.service';
import { findBestMatch } from '../services/search.service';
import type { SongRow, NoteEvent } from '../types/song.type';
import fs from 'fs';

export function getSongs(req: Request, res: Response): void {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM songs').all() as SongRow[];
  const songs = rows.map((r) => ({ ...r, notes: JSON.parse(r.notes) as NoteEvent[] }));
  res.json(songs);
}

export function uploadSong(req: Request, res: Response): void {
  const file = req.file;
  const { title, artist } = req.body as { title?: string; artist?: string };

  if (!file) {
    res.status(400).json({ error: 'MIDI 파일이 없습니다.' });
    return;
  }
  if (!title || !artist) {
    res.status(400).json({ error: 'title과 artist가 필요합니다.' });
    return;
  }

  try {
    const { notes } = parseMidiFile(file.path);

    if (notes.length === 0) {
      res.status(422).json({ error: 'MIDI에서 음표를 추출하지 못했습니다.' });
      return;
    }

    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO songs (title, artist, notes) VALUES (?, ?, ?)
      ON CONFLICT(title) DO UPDATE SET
        artist = excluded.artist,
        notes  = excluded.notes
    `);
    const result = stmt.run(title, artist, JSON.stringify(notes));

    fs.unlinkSync(file.path);

    res.status(201).json({ id: result.lastInsertRowid, title, artist, notes });
  } catch {
    res.status(500).json({ error: 'MIDI 파싱 중 오류가 발생했습니다.' });
  }
}

export function searchSong(req: Request, res: Response): void {
  const { notes } = req.body as { notes?: NoteEvent[] };

  if (!Array.isArray(notes) || notes.length === 0) {
    res.status(400).json({ error: 'notes 배열이 필요합니다.' });
    return;
  }

  const result = findBestMatch(notes);

  if (!result) {
    res.status(404).json({ error: '저장된 곡이 없습니다.' });
    return;
  }

  res.json(result);
}

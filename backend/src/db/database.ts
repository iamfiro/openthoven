import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '../../openthoven.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    initSchema();
  }
  return db;
}

function initSchema(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS songs (
      id     INTEGER PRIMARY KEY AUTOINCREMENT,
      title  TEXT    NOT NULL UNIQUE,
      artist TEXT    NOT NULL,
      notes  TEXT    NOT NULL
    );
  `);
}

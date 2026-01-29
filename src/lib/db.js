import Database from "better-sqlite3";

const db = new Database("notes.db");

db.prepare(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL
  )
`).run();



export default db;

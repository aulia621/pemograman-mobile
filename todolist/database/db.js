import * as SQLite from 'expo-sqlite';

let db = null;
let initPromise = null;

export const getDB = () => {
  if (!initPromise) {
    initPromise = SQLite.openDatabaseAsync('todoapp.db').then(async (database) => {
      await database.execAsync(`
        PRAGMA journal_mode = WAL;

        CREATE TABLE IF NOT EXISTS todos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          completed INTEGER DEFAULT 0,
          priority TEXT DEFAULT 'medium',
          created_at TEXT DEFAULT (datetime('now','localtime'))
        );

        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );

        INSERT OR IGNORE INTO settings (key, value) VALUES ('theme', 'light');
      `);
      db = database;
      return db;
    });
  }
  return initPromise;
};

export const getAllTodos = async () => {
  const database = await getDB();
  return await database.getAllAsync(
    'SELECT * FROM todos ORDER BY completed ASC, created_at DESC'
  );
};

export const addTodo = async (title, description = '', priority = 'medium') => {
  const database = await getDB();
  const result = await database.runAsync(
    'INSERT INTO todos (title, description, priority) VALUES (?, ?, ?)',
    [title, description, priority]
  );
  return result.lastInsertRowId;
};

export const updateTodo = async (id, title, description, priority) => {
  const database = await getDB();
  await database.runAsync(
    'UPDATE todos SET title = ?, description = ?, priority = ? WHERE id = ?',
    [title, description, priority, id]
  );
};

export const toggleTodo = async (id, completed) => {
  const database = await getDB();
  await database.runAsync(
    'UPDATE todos SET completed = ? WHERE id = ?',
    [completed ? 1 : 0, id]
  );
};

export const deleteTodo = async (id) => {
  const database = await getDB();
  await database.runAsync('DELETE FROM todos WHERE id = ?', [id]);
};

export const getSetting = async (key) => {
  const database = await getDB();
  const row = await database.getFirstAsync(
    'SELECT value FROM settings WHERE key = ?', [key]
  );
  return row ? row.value : null;
};

export const setSetting = async (key, value) => {
  const database = await getDB();
  await database.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]
  );
};
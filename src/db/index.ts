import { Database } from "bun:sqlite";
import { join } from "path";
import { homedir } from "os";
import { existsSync, mkdirSync } from "fs";
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
} from "@f/categories/lib/constants";
import { initCategories } from "@f/categories/use-cases/init-categories";

const DATA_DIR = join(homedir(), ".fin-cli");
const DB_PATH = join(DATA_DIR, "fin.db");

if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

function initDB() {
  db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        amount INTEGER NOT NULL,
        category TEXT NOT NULL,
        message TEXT,
        date TEXT NOT NULL,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
  db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        isDisabled INTEGER NOT NULL DEFAULT 0
      )
    `);

  initCategories(DEFAULT_EXPENSE_CATEGORIES, "expense");
  initCategories(DEFAULT_INCOME_CATEGORIES, "income");
}

export { db, initDB };

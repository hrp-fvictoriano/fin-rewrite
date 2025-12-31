import { db } from "@/db";
import type { Transaction } from "@/lib/types";

function initCategories(cat: readonly string[], type: Transaction["type"]) {
  const statement = db.prepare(
    "INSERT OR IGNORE INTO categories (name, type) VALUES (?, ?)",
  );

  for (const c of cat) {
    statement.run(c, type);
  }
}

export { initCategories };

import { db } from "@/db";
import type { Category } from "@/lib/types";

/**
Activates a category by default. To disable, pass TRUE as second argument.
*/
function toggleCategory(name: string, isDisabled: boolean = false) {
  const statement = db.prepare(`
      UPDATE categories SET disabled = ? WHERE name = ?
    `);
  return statement.run(isDisabled ? 1 : 0, name);
}

export { toggleCategory };

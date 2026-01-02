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

function isCategoryDisabled(name: string) {
  const statement = db.prepare(
    "SELECT disabled FROM categories WHERE name = ?",
  );

  const result = statement.get(name) as { disabled: number } | undefined;

  return result ? result.disabled === 1 : false;
}

export { toggleCategory, isCategoryDisabled };

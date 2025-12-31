import { db } from "@/db";
import type { Category } from "@/lib/types";

function addCategory(cat: Omit<Category, "id" | "disabled">) {
  const statement = db.prepare(
    "INSERT INTO categories (name, type) VALUES (?, ?)",
  );

  return statement.run(cat.name, cat.type);
}

export { addCategory };

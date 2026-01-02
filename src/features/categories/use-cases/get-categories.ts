import { db } from "@/db/index";
import type { Category } from "@/lib/types";

function getCategroies(type?: Category["type"]): Category[] {
  const query = type
    ? "SELECT * FROM categories WHERE type = ?"
    : "SELECT * FROM categories";

  const statement = db.prepare(query);

  return (type ? statement.all(type) : statement.all()) as Category[];
}

export { getCategroies };

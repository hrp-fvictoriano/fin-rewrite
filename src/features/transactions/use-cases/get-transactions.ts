import { db } from "@/db/index";
import type { Transaction } from "@/lib/types";

function getTransactions(
  startDate: string,
  endDate: string,
  categories?: string[],
): Transaction[] {
  let query = `
    SELECT * FROM transactions
    WHERE date >= ? AND date <= ?
  `;
  const params: string[] = [startDate, endDate];

  if (categories && categories.length > 0) {
    query += ` AND category IN (${categories.map(() => "?").join(",")})`;
    params.push(...categories);
  }

  const statement = db.prepare(query);

  return statement.all(...params) as Transaction[];
}

export { getTransactions };

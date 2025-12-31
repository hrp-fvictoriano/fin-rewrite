import { db } from "@/db/index";
import type { Transaction } from "@/lib/types";

function addTransaction(transaction: Omit<Transaction, "id" | "createdAt">) {
  const statement = db.prepare(
    "INSERT INTO transactions (type, amount, category, date) VALUE (?, ?, ?, ?)",
  );

  return statement.run(
    transaction.type,
    transaction.amount,
    transaction.category,
    transaction.date,
  );
}

export { addTransaction };

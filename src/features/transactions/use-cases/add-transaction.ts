import { db } from "@/db/index";
import type { Transaction } from "@/lib/types";

function addTransaction(transaction: Omit<Transaction, "id" | "createdAt">) {
  const statement = db.prepare(
    "INSERT INTO transactions (type, amount, category, message, date) VALUES (?, ?, ?, ?, ?)",
  );

  return statement.run(
    transaction.type,
    transaction.amount,
    transaction.category,
    transaction.message,
    transaction.date,
  );
}

export { addTransaction };

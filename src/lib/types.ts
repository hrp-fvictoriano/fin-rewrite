type TransactionType = "income" | "expense";

interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  category: string;
  message: string | null;
  date: string;
  createdAt: string;
}

interface Category {
  id: number;
  name: string;
  type: TransactionType;
  disabled: boolean;
}

interface CSVRow {
  amount: string;
  date: string;
  category: string;
  message: string | null;
}

export type { Category, CSVRow, Transaction };

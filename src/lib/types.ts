type TransactionType = "income" | "expense";

interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  category: string;
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
}

export type { Category, CSVRow, Transaction };

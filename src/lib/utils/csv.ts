import { writeFileSync, readFileSync } from "fs";
import { REQUIRED_CSV_INCOME_HEADERS } from "@f/transactions/lib/constants";
import { format, parseISO, isValid } from "date-fns";
import { getCategroies } from "@f/categories/use-cases/get-categories";
import { addTransaction } from "@f/transactions/use-cases/add-transaction";
import { DATE_STRING_FORMAT } from "@/lib/constants";
import type { CSVRow, Transaction } from "@/lib/types";

function parseCSV(filePath: string, delimiter: string = ";") {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.trim().split("\n");

  if (lines.length < 2) {
    throw new Error("CSV file must contain header and at least one row.");
  }
  //@ts-ignore
  const headers = lines[0].split(delimiter).map((h) => h.trim().toLowerCase());

  for (const h of REQUIRED_CSV_INCOME_HEADERS) {
    if (!headers.includes(h)) {
      throw new Error(`CSV missing required header: ${h}`);
    }
  }

  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    //@ts-ignore
    const values = lines[i].split(delimiter);
    const row: any = {};

    headers.forEach((h, idx) => {
      //@ts-ignore
      row[h] = values[idx] ? values[idx].trim() : null;
    });

    rows.push({
      amount: row.amount,
      date: row.date,
      message: row.message,
      category: row.category,
    });
  }

  return rows;
}

function generateCSV(data: any[], filePath: string, delimiter: string = ";") {
  if (data.length === 0) {
    throw new Error("No data to export");
  }

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(delimiter),
    ...data.map((r) => headers.map((h) => r[h] || "").join(delimiter)),
  ].join("\n");

  writeFileSync(filePath, csv, "utf-8");
}

async function importFromCSV(
  filePath: string,
  delimiter: string,
  type: Transaction["type"],
) {
  try {
    const rows = parseCSV(filePath, delimiter);
    const categories = getCategroies(type);
    let successCount = 0;

    for (const row of rows) {
      const cat = categories.find((c) => c.name === row.category);
      const amount = parseFloat(row.amount);
      if (isNaN(amount) || amount <= 0) {
        console.warn(`skipping invalid amount: ${row.amount}`);
        continue;
      }
      if (!isValid(parseISO(row.date))) {
        console.warn(`Skipping invalid date: ${row.date}`);
        continue;
      }
      if (!cat) {
        console.warn(`Skipping invalid category: ${row.category}`);
        continue;
      }
      if (cat.isDisabled) {
        console.warn(`Skipping disabled category: ${row.category}`);
        continue;
      }

      addTransaction({
        type,
        amount,
        category: row.category,
        date: format(parseISO(row.date), DATE_STRING_FORMAT),
        message: row.message,
      });
      successCount++;
    }
    console.log(`✓ Imported ${successCount} income(s) from ${filePath}`);
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(`Error importing CSV: ${error.message}`);
    process.exit(1);
  }
}

export { parseCSV, importFromCSV, generateCSV };

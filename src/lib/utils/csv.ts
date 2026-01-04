import { writeFileSync, readFileSync } from "fs";
import { REQUIRED_CSV_INCOME_HEADERS } from "@f/transactions/lib/constants";
import type { CSVRow } from "@/lib/types";

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
export { parseCSV, generateCSV };

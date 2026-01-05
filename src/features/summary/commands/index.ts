import { Command } from "commander";
import { getTransactions } from "@f/transactions/use-cases/get-transactions";
import {
  addMonths,
  endOfMonth,
  endOfYear,
  format,
  isValid,
  parseISO,
  startOfMonth,
  startOfToday,
} from "date-fns";
import { DATE_STRING_FORMAT } from "@/lib/constants";
import { generateCSV } from "@/lib/utils/csv";
import Table from "cli-table3";

function getSummaryCommand() {
  const base = new Command("summary")
    .name("summary")
    .description("Generate financial summary")
    .option(
      "-c, --categories <items>",
      "Filter by categories (comma-separated)",
    )
    .option("-p, --prev", "Summary for previous month")
    .option("-y, --year <YYYY>", "Get the summary for the specified year")
    .option("-s, --start <YYYY-MM-DD>", "Start date for the summary")
    .option("-e, --end <YYYY-MM-DD>", "End date for the summary")
    .option("-f, --file <filename>", "Export to CSV file")
    .option("--delimiter", "CSV delimiter", ";")
    .option("--verbose", "Show details for all transactions")
    .action((options) => generateSummary(options));
  return base;
}

function generateSummary(opts: any) {
  if (opts.year && (opts.start || opts.end || opts.prev)) {
    console.error("Error: Cannot use --year with --start, --end, or --prev");
    process.exit(1);
  }

  if (opts.prev && (opts.start || opts.end)) {
    console.error("Error: Cannot use --prev with --start or --end");
    process.exit(1);
  }

  /*----------------Get start & end dates----------------*/
  const today = startOfToday();
  let startDate: Date = startOfMonth(today);
  let endDate: Date = today;

  if (opts.prev) {
    startDate = addMonths(startDate, -1);
    endDate = endOfMonth(startDate);
  } else if (opts.year) {
    if (Number.isNaN(parseInt(opts.year))) {
      console.error(`Error: ${opts.year} is not a number`);
      process.exit(1);
    }
    startDate = parseISO(`${opts.year}-01-01`);
    endDate = endOfYear(startDate);
  } else {
    if (opts.start) {
      const start = parseISO(opts.start);
      if (!isValid(start)) {
        console.error(`Error: ${opts.start} is not a valid date`);
        process.exit(1);
      } else {
        startDate = start;
      }
    }
    if (opts.end) {
      const end = parseISO(opts.end);
      if (!isValid(end)) {
        console.error(`Error: ${opts.end} is not a valid date`);
        process.exit(1);
      } else {
        endDate = end;
      }
    }
  }
  /*-----------------------------------------------------*/
  /*-----------------Filter by categories----------------*/
  const catFilter = opts.categories
    ? opts.categories.split(",").map((c: string) => c.trim())
    : undefined;

  const trans = getTransactions(
    format(startDate, DATE_STRING_FORMAT),
    format(endDate, DATE_STRING_FORMAT),
    catFilter,
  );

  // 1. Calculate Summary Totals (needed for both UI and CSV)
  const summary: { [key: string]: { income: number; expense: number } } = {};
  trans.forEach((t) => {
    if (!summary[t.category]) summary[t.category] = { income: 0, expense: 0 };
    //@ts-ignore
    summary[t.category][t.type] += t.amount;
  });

  const summaryData = Object.entries(summary).map(([category, data]) => ({
    category,
    income: data.income.toFixed(2),
    expense: data.expense.toFixed(2),
    net: (data.income - data.expense).toFixed(2),
  }));

  const totalIncome = summaryData.reduce(
    (sum, r) => sum + parseFloat(r.income),
    0,
  );
  const totalExpense = summaryData.reduce(
    (sum, r) => sum + parseFloat(r.expense),
    0,
  );

  /*-------------------------EXPORT/DISPLAY-------------------------*/

  if (opts.file) {
    // If verbose and file, export individual transactions
    // If just file, export the category summary
    const dataToExport = opts.verbose
      ? trans.map((t) => ({
          date: t.date,
          category: t.category,
          message: t.message,
          type: t.type,
          amount: t.amount.toFixed(2),
        }))
      : [
          ...summaryData,
          {
            category: "TOTAL",
            income: totalIncome.toFixed(2),
            expense: totalExpense.toFixed(2),
            net: (totalIncome - totalExpense).toFixed(2),
          },
        ];

    generateCSV(dataToExport, opts.file, opts.delimiter);
    console.log(
      `✓ ${opts.verbose ? "Detailed Summary" : "Summary"} exported to ${opts.file}`,
    );
  } else {
    console.log(
      `\n📊 Financial Summary (${format(startDate, "EEE, MMM dd, yyyy")} to ${format(endDate, "EEE, MMM dd, yyyy")})\n`,
    );

    if (opts.verbose) {
      const categories = [...new Set(trans.map((t) => t.category))].sort();
      categories.forEach((cat) => {
        console.log(`\n📂 Category: ${cat.toUpperCase()}`);
        const catTable = new Table({
          head: ["Date", "Description", "Type", "Amount"],
          colWidths: [12, 30, 10, 12],
        });

        trans
          .filter((t) => t.category === cat)
          .forEach((t) => {
            catTable.push([
              t.date,
              t.message ?? "-",
              t.type,
              "$" + t.amount.toFixed(2),
            ]);
          });

        console.log(catTable.toString());
        //@ts-ignore
        console.log(
          //@ts-ignore
          `Subtotal: Income $${summary[cat].income.toFixed(2)} | Expense $${summary[cat].expense.toFixed(2)}`,
        );
      });
      console.log("\n" + "=".repeat(40));
    }

    // Always show summary table at bottom of console
    const table = new Table({ head: ["Category", "Income", "Expense", "Net"] });
    summaryData.forEach((row) => {
      table.push([
        row.category,
        "$" + row.income,
        "$" + row.expense,
        "$" + row.net,
      ]);
    });
    table.push([
      "TOTAL",
      "$" + totalIncome.toFixed(2),
      "$" + totalExpense.toFixed(2),
      "$" + (totalIncome - totalExpense).toFixed(2),
    ]);

    console.log(table.toString());
  }
}

export { getSummaryCommand };

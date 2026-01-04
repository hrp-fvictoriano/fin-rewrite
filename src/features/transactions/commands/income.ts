import { Command } from "commander";
import { addTransaction } from "@f/transactions/use-cases/add-transaction";
import { parseISO, isValid, format, startOfToday } from "date-fns";
import { DEFAULT_INCOME_CATEGORY } from "@f/categories/lib/constants";
import { getCategroies } from "@f/categories/use-cases/get-categories";
import { parseCSV } from "@/lib/utils/csv";
import { DATE_STRING_FORMAT } from "@/lib/constants";

function getIncomeCommand() {
  const base = new Command("income")
    .description("Record income")
    .argument("[amount]", "Income amount")
    .option("-f, --file <path>", "Import from CSV file")
    .option("--delimiter <char>", "CSV delimiter", ";")
    .option("-d, --date <YYYY-MM-DD>", "Transaction date")
    .option("-m, --message <string>", "Message attached to the transaction")
    .option("-c, --category <name>", "Income category", DEFAULT_INCOME_CATEGORY)
    .action(async (amount, options) => {
      if (options.file) {
        if (
          options.date ||
          options.category !== DEFAULT_INCOME_CATEGORY ||
          options.message
        ) {
          console.error(
            "Error: --date, --message, and --category cannot be used with --file",
          );
          process.exit(1);
        }
        await importFromCSV(options.file, options.delimiter);
      } else {
        if (!amount) {
          console.error("Error: amount is required.");
          process.exit(1);
        }
        await addSingleIncome(
          parseFloat(amount),
          options.category,
          options.date ?? null,
          options.message ?? null,
        );
      }
    });

  return base;
}

async function addSingleIncome(
  amount: number,
  category: string,
  date: string | null,
  message: string | null,
) {
  if (isNaN(amount) || amount <= 0) {
    console.error("Error: Invalid amount.");
    process.exit(1);
  }

  const categories = getCategroies("income");
  const validCategory = categories.find((c) => c.name === category);

  if (!validCategory) {
    console.error(`Error: Category ${category} does not exit in income type.`);
    process.exit(1);
  }

  //Booleans saved as ints in sqlite
  if (Boolean(validCategory.isDisabled)) {
    console.error(`Error: Category ${category} is disabled.`);
    process.exit(1);
  }

  if (date !== null && !isValid(parseISO(date))) {
    console.error(`Error: Invalid date format. Use ${DATE_STRING_FORMAT}`);
    process.exit(1);
  }

  addTransaction({
    type: "income",
    amount,
    category,
    date: date
      ? format(parseISO(date), DATE_STRING_FORMAT)
      : format(startOfToday(), DATE_STRING_FORMAT),
    message,
  });
}

async function importFromCSV(filePath: string, delimiter: string) {
  try {
    const rows = parseCSV(filePath, delimiter);
    const categories = getCategroies("income");
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
        type: "income",
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

export { getIncomeCommand };

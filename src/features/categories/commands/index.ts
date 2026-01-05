import { Command } from "commander";
import Table from "cli-table3";
import { addCategory } from "@f/categories/use-cases/add-category";
import { getCategroies } from "@f/categories/use-cases/get-categories";
import { toggleCategory } from "@f/categories/use-cases/toggle-category";
import type { Category } from "@/lib/types";

function getCategoryCommand() {
  const base = new Command("cat").description("Manage categories");

  base
    .option("-l, --list", "List all categories")
    .option("-d, --disable <name>", "Disable a category")
    .option("-e, --enable <name>", "Enable a disabled category")
    .action((opt) => {
      if (opt.list && (opt.disable || opt.enable)) {
        console.error(
          "Error: Options --list, --disable, and --enable are mutually exclusive.",
        );

        process.exit(1);
      }

      if (opt.list) listCategories();
      else if (opt.disable) toggleCategoryAction(opt.disable, true);
      else if (opt.enable) toggleCategoryAction(opt.enable, false);
      else base.help();
    });

  const add = new Command("add").description("Add a new category");

  add
    .command("income <name>")
    .description("Add a new income category")
    .action((name) => {
      addCategoryAction(name, "income");
    });
  add
    .command("expense <name>")
    .description("Add a new expense category")
    .action((name) => {
      addCategoryAction(name, "expense");
    });

  base.addCommand(add);

  return base;
}

function listCategories() {
  const categories = getCategroies();
  const incomeCategories: Category[] = [];
  const expenseCategories: Category[] = [];

  categories.map((c) =>
    c.type === "expense" ? expenseCategories.push(c) : incomeCategories.push(c),
  );

  console.log("\n📊 Income Categories:");
  const incomeTable = new Table({
    head: ["Name", "Status"],
  });

  incomeCategories.map((c) =>
    incomeTable.push([c.name, c.isDisabled ? "Disabled" : "Active"]),
  );

  console.log(incomeTable.toString());

  console.log("\n💰 Expense Categories:");
  const expenseTable = new Table({
    head: ["Name", "Status"],
  });

  expenseCategories.forEach((cat) => {
    expenseTable.push([cat.name, cat.isDisabled ? "Disabled" : "Active"]);
  });
  console.log(expenseTable.toString());
}

function addCategoryAction(name: string, type: Category["type"]) {
  try {
    addCategory({ name, type });
    console.log(`✓ Added ${type} category: ${name}`);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    if (err.message.includes("UNIQUE")) {
      console.error(`Error: Category ${name} already exists`);
      process.exit(1);
    }
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

function toggleCategoryAction(name: string, isDisabled: boolean) {
  try {
    const result = toggleCategory(name, isDisabled);
    if (result.changes === 0) {
      console.error(`Error: Category '${name}' not found`);
      process.exit(1);
    }
    console.log(`✓ ${isDisabled ? "Disabled" : "Enabled"} category: ${name}`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

export { getCategoryCommand };

#!/usr/bin/env bun

import { Command } from "commander";
import { initDB } from "@/db/index";
import { getCategoryCommand } from "@f/categories/commands";
import packageJSON from "../package.json" with { type: "json" };
import { getIncomeCommand } from "@f/transactions/commands/income";
import { getExpenseCommand } from "@f/transactions/commands/expense";
import { getSummaryCommand } from "@f/summary/commands";

initDB();

const program = new Command();

program
  .name("fin")
  .description("Personal finance tracker")
  .version(
    packageJSON.version,
    "-v, --version",
    "Current version of fin",
  );

program
  .addCommand(getCategoryCommand())
  .addCommand(getIncomeCommand())
  .addCommand(getExpenseCommand())
  .addCommand(getSummaryCommand());

program.parse();

const DEFAULT_EXPENSE_CATEGORIES = [
  "miscellaneous",
  "groceries",
  "outings",
  "entertainment",
  "groceries",
  "insurance",
  "transportation",
  "home",
  "utilities",
] as const;
const DEFAULT_EXPENSE_CATEGORY: (typeof DEFAULT_EXPENSE_CATEGORIES)[number] =
  "miscellaneous" as const;

const DEFAULT_INCOME_CATEGORIES = ["work", "business", "hustle"] as const;
const DEFAULT_INCOME_CATEGORY: (typeof DEFAULT_INCOME_CATEGORIES)[number] =
  "work";

export {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_EXPENSE_CATEGORY,
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_INCOME_CATEGORY,
};

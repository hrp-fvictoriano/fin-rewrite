const DEFAULT_EXPENSE_CATEGORIES = [
  "debt",
  "education",
  "entertainment",
  "gifts",
  "groceries",
  "health",
  "home",
  "insurance",
  "investments",
  "miscellaneous",
  "outings",
  "savings",
  "shopping",
  "subscriptions",
  "transportation",
  "utilities",
] as const;

const DEFAULT_EXPENSE_CATEGORY: (typeof DEFAULT_EXPENSE_CATEGORIES)[number] =
  "miscellaneous" as const;

const DEFAULT_INCOME_CATEGORIES = [
  "business",
  "gifts",
  "investments",
  "miscellaneous",
  "salary",
  "freelance",
] as const;
const DEFAULT_INCOME_CATEGORY: (typeof DEFAULT_INCOME_CATEGORIES)[number] =
  "salary" as const;

export {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_EXPENSE_CATEGORY,
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_INCOME_CATEGORY,
};

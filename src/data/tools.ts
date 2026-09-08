import {
  Calculator,
  CalendarDays,
  CarFront,
  Coins,
  FileText,
  Fuel,
  Hammer,
  LandPlot,
  Percent,
  Ruler,
  ScrollText,
  Timer,
  Type,
  Wallet,
  Landmark,
} from "lucide-react";

export const CATEGORIES = [
  { id: "calculators", label: "Calculators", to: "/calculators" },
  { id: "converters", label: "Converters", to: "/converters" },
  { id: "kenya", label: "Kenya Tools", to: "/kenya-tools" },
  { id: "productivity", label: "Productivity", to: "/productivity" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const TOOLS = [
  {
    slug: "acre-hectare-converter",
    to: "/tools/acre-hectare-converter",
    name: "Acre ↔ Hectare Converter",
    short: "Acre / Hectare",
    description: "Convert land size between acres and hectares with exact conversion factors.",
    categories: ["converters", "kenya"],
    keywords: ["acre", "hectare", "land", "area", "shamba", "plot", "size"],
    icon: LandPlot,
    popular: true,
  },
  {
    slug: "percentage-calculator",
    to: "/tools/percentage-calculator",
    name: "Percentage Calculator",
    short: "Percentage",
    description: "Work out percentages, increases, decreases and percentage difference.",
    categories: ["calculators"],
    keywords: ["percent", "percentage", "increase", "decrease", "discount", "difference"],
    icon: Percent,
    popular: true,
  },
  {
    slug: "age-calculator",
    to: "/tools/age-calculator",
    name: "Age Calculator",
    short: "Age",
    description: "Find an exact age in years, months and days, plus the next birthday.",
    categories: ["calculators"],
    keywords: ["age", "birthday", "date of birth", "dob", "years old"],
    icon: CalendarDays,
    popular: true,
  },
  {
    slug: "loan-calculator",
    to: "/tools/loan-calculator",
    name: "Loan Calculator",
    short: "Loan",
    description: "Estimate monthly repayments, total interest and total repayment on a loan.",
    categories: ["calculators"],
    keywords: ["loan", "mortgage", "repayment", "interest", "borrow", "emi"],
    icon: Coins,
    popular: true,
  },
  {
    slug: "paye-calculator",
    to: "/tools/paye-calculator",
    name: "Kenya PAYE Calculator",
    short: "PAYE",
    description: "Estimate PAYE, SHIF, NSSF, housing levy and net pay from a Kenyan salary.",
    categories: ["calculators", "kenya"],
    keywords: ["paye", "kra", "tax", "salary", "net pay", "kenya", "payslip"],
    icon: Landmark,
    popular: true,
  },
  {
    slug: "salary-calculator",
    to: "/tools/salary-calculator",
    name: "Salary Calculator",
    short: "Salary",
    description: "Turn gross pay, allowances and deductions into estimated take-home pay.",
    categories: ["calculators"],
    keywords: ["salary", "wage", "net pay", "take home", "gross", "annual", "monthly"],
    icon: Wallet,
    popular: true,
  },
  {
    slug: "house-construction-cost-calculator",
    to: "/tools/house-construction-cost-calculator",
    name: "House Construction Cost Calculator",
    short: "Construction Cost",
    description: "Estimate building cost from floor area and finish quality, with editable rates.",
    categories: ["calculators", "kenya"],
    keywords: ["construction", "building", "house", "cost", "sqm", "quantity", "bungalow"],
    icon: Hammer,
  },
  {
    slug: "car-import-duty-calculator",
    to: "/tools/car-import-duty-calculator",
    name: "Kenya Car Import Duty Calculator",
    short: "Car Import Duty",
    description: "Estimate duty, excise, VAT and landed cost for importing a vehicle to Kenya.",
    categories: ["calculators", "kenya"],
    keywords: ["car", "import", "duty", "vehicle", "customs", "kra", "excise", "vat"],
    icon: CarFront,
  },
  {
    slug: "cv-ats-checker",
    to: "/tools/cv-ats-checker",
    name: "CV ATS Checker",
    short: "CV ATS Checker",
    description: "Paste your CV text and get an ATS-style readability and structure score.",
    categories: ["productivity"],
    keywords: ["cv", "resume", "ats", "job", "application", "score", "keywords"],
    icon: FileText,
    popular: true,
  },
  {
    slug: "election-countdown",
    to: "/tools/election-countdown",
    name: "Kenya Election Countdown",
    short: "Election Countdown",
    description: "Live countdown to the Kenya General Election on 10 August 2027.",
    categories: ["kenya"],
    keywords: ["election", "2027", "kenya", "countdown", "voting", "general election"],
    icon: Timer,
  },
  {
    slug: "unit-converter",
    to: "/tools/unit-converter",
    name: "Unit Converter",
    short: "Unit Converter",
    description: "Convert length, weight, temperature, area, volume and speed units.",
    categories: ["converters"],
    keywords: ["unit", "convert", "metric", "imperial", "length", "weight", "temperature", "volume", "speed"],
    icon: Ruler,
    popular: true,
  },
  {
    slug: "word-counter",
    to: "/tools/word-counter",
    name: "Word Counter",
    short: "Word Counter",
    description: "Count words, characters, sentences, paragraphs and reading time as you type.",
    categories: ["productivity"],
    keywords: ["word", "count", "characters", "essay", "text", "reading time"],
    icon: Type,
    popular: true,
  },
  {
    slug: "pdf-tools",
    to: "/tools/pdf-tools",
    name: "PDF Tools",
    short: "PDF Tools",
    description: "Merge PDF files in your browser. More PDF tools are on the way.",
    categories: ["productivity"],
    keywords: ["pdf", "merge", "split", "compress", "document", "combine"],
    icon: ScrollText,
  },
  {
    slug: "kenya-fuel-cost-calculator",
    to: "/tools/kenya-fuel-cost-calculator",
    name: "Kenya Fuel Cost Calculator",
    short: "Fuel Cost",
    description: "Work out litres needed, trip fuel cost and cost per kilometre.",
    categories: ["calculators", "kenya"],
    keywords: ["fuel", "petrol", "diesel", "trip", "cost", "consumption", "kenya", "travel"],
    icon: Fuel,
  },
  {
    slug: "date-difference-calculator",
    to: "/tools/date-difference-calculator",
    name: "Date Difference Calculator",
    short: "Date Difference",
    description: "Count days, weeks, months and business days between two dates.",
    categories: ["calculators", "productivity"],
    keywords: ["date", "days between", "difference", "business days", "weeks", "duration"],
    icon: Calculator,
  },
] as const;

export type Tool = (typeof TOOLS)[number];
export type ToolSlug = Tool["slug"];

export function getTool(slug: ToolSlug): Tool {
  const tool = TOOLS.find((t) => t.slug === slug);
  if (!tool) throw new Error(`Unknown tool: ${slug}`);
  return tool;
}

export function toolsByCategory(category: CategoryId): Tool[] {
  return TOOLS.filter((t) => (t.categories as readonly string[]).includes(category));
}

export function categoryLabel(id: CategoryId): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

/** Client-side search across name, description, category and keywords. */
export function searchTools(query: string): Tool[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...TOOLS];
  const terms = q.split(/\s+/);
  return TOOLS.filter((tool) => {
    const haystack = [
      tool.name,
      tool.description,
      ...tool.keywords,
      ...tool.categories.map((c) => categoryLabel(c as CategoryId)),
    ]
      .join(" ")
      .toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}

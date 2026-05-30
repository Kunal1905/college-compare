export const DEGREE_CATEGORIES = [
  "Engineering",
  "MBA",
  "Medical",
  "Law",
  "Design",
  "Commerce",
  "Computer Science",
  "AI & ML",
] as const;

export type DegreeCategory = (typeof DEGREE_CATEGORIES)[number];

export const DEGREE_FILTER_OPTIONS = [
  {
    label: "All Degrees",
    value: "",
  },
  ...DEGREE_CATEGORIES.map((category) => ({
    label: category,
    value: category,
  })),
];

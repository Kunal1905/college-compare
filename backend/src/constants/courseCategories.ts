export const COURSE_CATEGORY_PATTERNS: Record<string, string[]> = {
  Engineering: [
    "%B.Tech%",
    "%B.E%",
    "%Engineering%",
    "%Electronics%",
    "%Electrical%",
    "%Mechanical%",
    "%Information Technology%",
    "%ICT%",
    "%Mechatronics%",
  ],
  MBA: ["%MBA%", "%PGDM%"],
  Medical: ["%MBBS%", "%BDS%", "%Nursing%", "%MD%"],
  Law: ["%LLB%", "%LLM%"],
  Design: [
    "%B.Des%",
    "%M.Des%",
    "%Fashion Design%",
    "%UI/UX Design%",
    "%Textile Design%",
    "%Product Design%",
  ],
  Commerce: ["%B.Com%", "%BBA%", "%BMS%", "%M.Com%", "%Economics%"],
  "Computer Science": [
    "%Computer Science%",
    "%Computer Engineering%",
    "%BCA%",
    "%MCA%",
    "%ICT%",
    "%Data Science%",
  ],
  "AI & ML": [
    "%AI & ML%",
    "%Artificial Intelligence%",
    "%Machine Learning%",
    "%M.Tech AI%",
    "%Data Science%",
  ],
};

export const getCourseCategoryPatterns = (course: string) =>
  COURSE_CATEGORY_PATTERNS[course] ?? [`%${course}%`];

import { formatIndianCurrency } from "@/lib/utils";
import type { Course } from "@/types";

export const CourseTable = ({ courses }: { courses: Course[] }) => {
  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
      <table className="min-w-full text-left">
        <thead className="bg-surface-container-low text-[11px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
          <tr>
            <th className="px-6 py-4">
              Course
            </th>
            <th className="px-6 py-4">
              Duration
            </th>
            <th className="px-6 py-4 text-right">
              Annual Fees
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {courses.map((course) => (
            <tr key={course.id}>
              <td className="px-6 py-5 text-sm font-semibold text-on-surface">
                {course.name}
              </td>
              <td className="px-6 py-5 text-sm text-on-surface-variant">
                {course.duration}
              </td>
              <td className="px-6 py-5 text-right text-sm font-semibold text-secondary">
                {formatIndianCurrency(course.fees)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

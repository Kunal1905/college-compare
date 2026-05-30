export type AuthUser = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
};

export type Placement = {
  averagePackage: number;
  highestPackage: number;
  placementRate: number;
  topRecruiters: string[];
};

export type Course = {
  id: number;
  name: string;
  duration: string;
  fees: number;
};

export type Review = {
  id: number;
  student: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type CollegeSummary = {
  id: number;
  name: string;
  slug: string;
  location: string;
  state: string;
  fees: number;
  rating: number;
  imageUrl: string | null;
  overview: string;
  averagePackage: number;
  highestPackage: number;
  placementRate: number;
  courses: string[];
};

export type CollegeDetail = {
  id: number;
  name: string;
  slug: string;
  location: string;
  state: string;
  fees: number;
  rating: number;
  imageUrl: string | null;
  overview: string;
  createdAt: string;
  courses: Course[];
  placement: Placement | null;
  reviews: Review[];
};

export type SavedCollegeItem = CollegeSummary & {
  savedId: number;
  savedAt: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type CollegeFilterValues = {
  search: string;
  location: string[];
  minRating: string;
  maxFees: string;
  course: string;
  sort: "rating_desc" | "fees_asc";
};

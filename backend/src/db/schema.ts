import { relations } from "drizzle-orm";
import {
  doublePrecision,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const colleges = pgTable("colleges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  location: text("location").notNull(),
  state: text("state").notNull(),
  fees: integer("fees").notNull(),
  rating: doublePrecision("rating").notNull(),
  imageUrl: text("image_url"),
  overview: text("overview").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  duration: text("duration").notNull(),
  fees: integer("fees").notNull(),
  collegeId: integer("college_id")
    .notNull()
    .references(() => colleges.id, { onDelete: "cascade" }),
});

export const placements = pgTable("placements", {
  id: serial("id").primaryKey(),
  averagePackage: doublePrecision("average_package").notNull(),
  highestPackage: doublePrecision("highest_package").notNull(),
  placementRate: doublePrecision("placement_rate").notNull(),
  topRecruiters: text("top_recruiters").array().notNull(),
  collegeId: integer("college_id")
    .notNull()
    .unique()
    .references(() => colleges.id, { onDelete: "cascade" }),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  student: text("student").notNull(),
  rating: doublePrecision("rating").notNull(),
  comment: text("comment").notNull(),
  collegeId: integer("college_id")
    .notNull()
    .references(() => colleges.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const savedColleges = pgTable(
  "saved_colleges",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    collegeId: integer("college_id")
      .notNull()
      .references(() => colleges.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueUserCollege: unique().on(table.userId, table.collegeId),
  })
);

export const usersRelations = relations(users, ({ many }) => ({
  savedColleges: many(savedColleges),
}));

export const collegesRelations = relations(colleges, ({ many, one }) => ({
  courses: many(courses),
  placement: one(placements, {
    fields: [colleges.id],
    references: [placements.collegeId],
  }),
  reviews: many(reviews),
  savedByUsers: many(savedColleges),
}));

export const coursesRelations = relations(courses, ({ one }) => ({
  college: one(colleges, {
    fields: [courses.collegeId],
    references: [colleges.id],
  }),
}));

export const placementsRelations = relations(placements, ({ one }) => ({
  college: one(colleges, {
    fields: [placements.collegeId],
    references: [colleges.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  college: one(colleges, {
    fields: [reviews.collegeId],
    references: [colleges.id],
  }),
}));

export const savedCollegesRelations = relations(savedColleges, ({ one }) => ({
  user: one(users, {
    fields: [savedColleges.userId],
    references: [users.id],
  }),
  college: one(colleges, {
    fields: [savedColleges.collegeId],
    references: [colleges.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type College = typeof colleges.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Placement = typeof placements.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type SavedCollege = typeof savedColleges.$inferSelect;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.savedCollegesRelations = exports.reviewsRelations = exports.placementsRelations = exports.coursesRelations = exports.collegesRelations = exports.usersRelations = exports.savedColleges = exports.reviews = exports.placements = exports.courses = exports.colleges = exports.users = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    email: (0, pg_core_1.text)("email").notNull().unique(),
    password: (0, pg_core_1.text)("password").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.colleges = (0, pg_core_1.pgTable)("colleges", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    slug: (0, pg_core_1.text)("slug").notNull().unique(),
    location: (0, pg_core_1.text)("location").notNull(),
    state: (0, pg_core_1.text)("state").notNull(),
    fees: (0, pg_core_1.integer)("fees").notNull(),
    rating: (0, pg_core_1.doublePrecision)("rating").notNull(),
    imageUrl: (0, pg_core_1.text)("image_url"),
    overview: (0, pg_core_1.text)("overview").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.courses = (0, pg_core_1.pgTable)("courses", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    duration: (0, pg_core_1.text)("duration").notNull(),
    fees: (0, pg_core_1.integer)("fees").notNull(),
    collegeId: (0, pg_core_1.integer)("college_id")
        .notNull()
        .references(() => exports.colleges.id, { onDelete: "cascade" }),
});
exports.placements = (0, pg_core_1.pgTable)("placements", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    averagePackage: (0, pg_core_1.doublePrecision)("average_package").notNull(),
    highestPackage: (0, pg_core_1.doublePrecision)("highest_package").notNull(),
    placementRate: (0, pg_core_1.doublePrecision)("placement_rate").notNull(),
    topRecruiters: (0, pg_core_1.text)("top_recruiters").array().notNull(),
    collegeId: (0, pg_core_1.integer)("college_id")
        .notNull()
        .unique()
        .references(() => exports.colleges.id, { onDelete: "cascade" }),
});
exports.reviews = (0, pg_core_1.pgTable)("reviews", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    student: (0, pg_core_1.text)("student").notNull(),
    rating: (0, pg_core_1.doublePrecision)("rating").notNull(),
    comment: (0, pg_core_1.text)("comment").notNull(),
    collegeId: (0, pg_core_1.integer)("college_id")
        .notNull()
        .references(() => exports.colleges.id, { onDelete: "cascade" }),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.savedColleges = (0, pg_core_1.pgTable)("saved_colleges", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id")
        .notNull()
        .references(() => exports.users.id, { onDelete: "cascade" }),
    collegeId: (0, pg_core_1.integer)("college_id")
        .notNull()
        .references(() => exports.colleges.id, { onDelete: "cascade" }),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
}, (table) => ({
    uniqueUserCollege: (0, pg_core_1.unique)().on(table.userId, table.collegeId),
}));
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many }) => ({
    savedColleges: many(exports.savedColleges),
}));
exports.collegesRelations = (0, drizzle_orm_1.relations)(exports.colleges, ({ many, one }) => ({
    courses: many(exports.courses),
    placement: one(exports.placements, {
        fields: [exports.colleges.id],
        references: [exports.placements.collegeId],
    }),
    reviews: many(exports.reviews),
    savedByUsers: many(exports.savedColleges),
}));
exports.coursesRelations = (0, drizzle_orm_1.relations)(exports.courses, ({ one }) => ({
    college: one(exports.colleges, {
        fields: [exports.courses.collegeId],
        references: [exports.colleges.id],
    }),
}));
exports.placementsRelations = (0, drizzle_orm_1.relations)(exports.placements, ({ one }) => ({
    college: one(exports.colleges, {
        fields: [exports.placements.collegeId],
        references: [exports.colleges.id],
    }),
}));
exports.reviewsRelations = (0, drizzle_orm_1.relations)(exports.reviews, ({ one }) => ({
    college: one(exports.colleges, {
        fields: [exports.reviews.collegeId],
        references: [exports.colleges.id],
    }),
}));
exports.savedCollegesRelations = (0, drizzle_orm_1.relations)(exports.savedColleges, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.savedColleges.userId],
        references: [exports.users.id],
    }),
    college: one(exports.colleges, {
        fields: [exports.savedColleges.collegeId],
        references: [exports.colleges.id],
    }),
}));

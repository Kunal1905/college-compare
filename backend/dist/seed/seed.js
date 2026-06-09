"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const reviewerNames = [
    ["Aarav Menon", "Priyanka Shah"],
    ["Ritika Sen", "Karan Arora"],
    ["Niharika Das", "Vivek Rao"],
    ["Muskan Gupta", "Soham Patil"],
    ["Ananya Iyer", "Raghav Bedi"],
    ["Sana Khan", "Tanish Verma"],
    ["Ishita Nair", "Dev Malhotra"],
    ["Mehul Jain", "Pallavi Roy"],
    ["Shruti Desai", "Harsh Vardhan"],
    ["Tanvi Kulkarni", "Arjun Seth"],
];
const inferDuration = (courseName) => {
    if (courseName === "MBBS") {
        return "5.5 Years";
    }
    if (courseName === "BDS") {
        return "5 Years";
    }
    if (courseName === "MD") {
        return "3 Years";
    }
    if (courseName.includes("Nursing")) {
        return "4 Years";
    }
    if (courseName === "BA LLB" || courseName === "BBA LLB") {
        return "5 Years";
    }
    if (courseName === "LLB") {
        return "3 Years";
    }
    if (courseName === "LLM") {
        return "2 Years";
    }
    if (courseName.startsWith("MBA") ||
        courseName === "PGDM" ||
        courseName.startsWith("M.Tech") ||
        courseName.startsWith("M.Des") ||
        courseName === "MCA" ||
        courseName === "M.Com") {
        return "2 Years";
    }
    if (courseName.startsWith("B.Tech") || courseName.startsWith("B.E")) {
        return "4 Years";
    }
    if (courseName.startsWith("B.Des")) {
        return "4 Years";
    }
    return "3 Years";
};
const inferCourseFee = (baseFees, courseName, index) => {
    let multiplier = 1;
    if (courseName.startsWith("MBA") ||
        courseName === "PGDM" ||
        courseName.startsWith("M.Tech") ||
        courseName.startsWith("M.Des") ||
        courseName === "MCA" ||
        courseName === "MD" ||
        courseName === "LLM") {
        multiplier = 1.06;
    }
    else if (courseName.startsWith("B.Com") ||
        courseName.startsWith("BBA") ||
        courseName.startsWith("BMS") ||
        courseName.startsWith("B.A") ||
        courseName.startsWith("B.Sc") ||
        courseName === "BCA" ||
        courseName.includes("Nursing")) {
        multiplier = 0.92;
    }
    const fee = Math.round((baseFees * (multiplier + index * 0.02 - 0.02)) / 1000) * 1000;
    return Math.max(5000, fee);
};
const clampRating = (rating) => Math.max(3.5, Math.min(5, Number(rating.toFixed(1))));
const collegeDefinitions = [
    {
        name: "IIT Bombay",
        slug: "iit-bombay",
        location: "Mumbai",
        state: "Maharashtra",
        fees: 220000,
        rating: 4.8,
        imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
        overview: "A premier public engineering institute with standout research culture, exceptional CSE outcomes, and a deeply competitive student ecosystem.",
        courseNames: [
            "B.Tech Computer Science",
            "B.Tech AI & ML",
            "B.Tech Electrical Engineering",
        ],
        placement: {
            averagePackage: 21.5,
            highestPackage: 120,
            placementRate: 92,
            topRecruiters: ["Google", "Microsoft", "Amazon", "Goldman Sachs"],
        },
        reviewComments: [
            "Academics are intense, but the startup and placement ecosystem is unmatched for engineering students.",
            "Strong faculty mentorship and an excellent alumni network make internships and research access much easier.",
        ],
    },
    {
        name: "IIT Delhi",
        slug: "iit-delhi",
        location: "New Delhi",
        state: "Delhi",
        fees: 230000,
        rating: 4.8,
        imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
        overview: "Known for cutting-edge labs, high-impact research, and top-tier placements across software, consulting, and core engineering roles.",
        courseNames: [
            "B.Tech Computer Science",
            "B.Tech Mechanical Engineering",
            "M.Tech AI",
        ],
        placement: {
            averagePackage: 22,
            highestPackage: 125,
            placementRate: 93,
            topRecruiters: ["Google", "Microsoft", "BCG", "McKinsey"],
        },
        reviewComments: [
            "The academic pace is demanding, but the exposure to research and product companies is worth it.",
            "Campus life is vibrant and the technical clubs add a lot beyond the classroom.",
        ],
    },
    {
        name: "IIT Madras",
        slug: "iit-madras",
        location: "Chennai",
        state: "Tamil Nadu",
        fees: 215000,
        rating: 4.7,
        imageUrl: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1200&q=80",
        overview: "A research-forward campus celebrated for strong engineering fundamentals, innovation support, and elite hiring outcomes.",
        courseNames: [
            "B.Tech Computer Science",
            "B.Tech Data Science",
            "B.Tech Electrical Engineering",
        ],
        placement: {
            averagePackage: 20.8,
            highestPackage: 115,
            placementRate: 91,
            topRecruiters: ["Google", "Amazon", "JP Morgan", "Deloitte"],
        },
        reviewComments: [
            "The institute balances theory and practical exposure very well, especially for software-focused students.",
            "Research opportunities are a real strength here, and the placement support stays consistently strong.",
        ],
    },
    {
        name: "VIT Vellore",
        slug: "vit-vellore",
        location: "Vellore",
        state: "Tamil Nadu",
        fees: 198000,
        rating: 4.3,
        imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
        overview: "A large private university with strong infrastructure, active coding culture, and wide access to internships and campus hiring.",
        courseNames: [
            "B.Tech Computer Science",
            "B.Tech AI & ML",
            "B.Tech Information Technology",
        ],
        placement: {
            averagePackage: 9.9,
            highestPackage: 75,
            placementRate: 86,
            topRecruiters: ["Amazon", "Microsoft", "TCS", "Infosys"],
        },
        reviewComments: [
            "There are plenty of opportunities if you stay proactive with projects, clubs, and internships.",
            "The campus is modern and the placement process is structured well for software roles.",
        ],
    },
    {
        name: "COEP Technological University",
        slug: "coep-technological-university",
        location: "Pune",
        state: "Maharashtra",
        fees: 110000,
        rating: 4.4,
        imageUrl: "https://images.unsplash.com/photo-1568792923760-d70635a89fdc?auto=format&fit=crop&w=1200&q=80",
        overview: "One of Maharashtra's most respected engineering campuses, offering strong value, legacy, and dependable placements.",
        courseNames: [
            "B.Tech Computer Engineering",
            "B.Tech Electronics",
            "B.Tech Mechanical Engineering",
        ],
        placement: {
            averagePackage: 11.2,
            highestPackage: 50,
            placementRate: 88,
            topRecruiters: ["Goldman Sachs", "Accenture", "Tata", "Capgemini"],
        },
        reviewComments: [
            "COEP delivers solid academics and good placements while still feeling affordable compared with many private colleges.",
            "Strong alumni support and a good Pune location help a lot during internship season.",
        ],
    },
    {
        name: "Manipal Institute of Technology",
        slug: "manipal-institute-of-technology",
        location: "Manipal",
        state: "Karnataka",
        fees: 320000,
        rating: 4.2,
        imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
        overview: "A student-friendly engineering school with strong campus life, global exposure, and stable placement outcomes across multiple tech tracks.",
        courseNames: [
            "B.Tech Computer Science",
            "B.Tech AI & ML",
            "B.Tech Mechatronics",
        ],
        placement: {
            averagePackage: 10.1,
            highestPackage: 44,
            placementRate: 82,
            topRecruiters: ["Microsoft", "Amazon", "Deloitte", "Bosch"],
        },
        reviewComments: [
            "The campus experience is excellent and there is enough flexibility to build a strong project portfolio.",
            "Placements reward students who use the labs, clubs, and hackathons consistently.",
        ],
    },
    {
        name: "SRM Institute of Science and Technology",
        slug: "srm-institute-of-science-and-technology",
        location: "Chennai",
        state: "Tamil Nadu",
        fees: 250000,
        rating: 4.1,
        imageUrl: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1200&q=80",
        overview: "A large multidisciplinary university with strong intake diversity, growing tech programs, and visible recruiter participation.",
        courseNames: [
            "B.Tech Computer Science",
            "B.Tech AI & ML",
            "B.Tech Electronics",
        ],
        placement: {
            averagePackage: 7.5,
            highestPackage: 52,
            placementRate: 80,
            topRecruiters: ["Amazon", "TCS", "Infosys", "Wipro"],
        },
        reviewComments: [
            "The university gives you exposure to many clubs and industry events if you take initiative early.",
            "Software placement opportunities are decent, especially for students with good project work.",
        ],
    },
    {
        name: "IIM Ahmedabad",
        slug: "iim-ahmedabad",
        location: "Ahmedabad",
        state: "Gujarat",
        fees: 2500000,
        rating: 4.9,
        imageUrl: "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?auto=format&fit=crop&w=1200&q=80",
        overview: "India's flagship management school known for case-based learning, elite consulting placements, and a powerful alumni network.",
        courseNames: ["MBA", "MBA Finance", "PGDM"],
        placement: {
            averagePackage: 35,
            highestPackage: 115,
            placementRate: 100,
            topRecruiters: ["BCG", "McKinsey", "Goldman Sachs", "Amazon"],
        },
        reviewComments: [
            "The learning curve is steep, but the classroom discussions and recruiter access are exceptional.",
            "Peer quality is outstanding and the alumni network opens doors in consulting, finance, and product roles.",
        ],
    },
    {
        name: "IIM Bangalore",
        slug: "iim-bangalore",
        location: "Bangalore",
        state: "Karnataka",
        fees: 2450000,
        rating: 4.8,
        imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
        overview: "A highly selective MBA destination with top corporate partnerships, a polished campus experience, and outstanding final placements.",
        courseNames: ["MBA", "MBA Marketing", "PGDM"],
        placement: {
            averagePackage: 33.8,
            highestPackage: 110,
            placementRate: 100,
            topRecruiters: ["BCG", "McKinsey", "JP Morgan", "Deloitte"],
        },
        reviewComments: [
            "The corporate exposure here is fantastic and the city location adds a lot for internships and networking.",
            "Faculty quality and peer learning stand out across almost every specialization.",
        ],
    },
    {
        name: "IIM Calcutta",
        slug: "iim-calcutta",
        location: "Kolkata",
        state: "West Bengal",
        fees: 2400000,
        rating: 4.8,
        imageUrl: "https://images.unsplash.com/photo-1568792923760-d70635a89fdc?auto=format&fit=crop&w=1200&q=80",
        overview: "A top-tier business school especially respected for finance, analytics, and high-value consulting placements.",
        courseNames: ["MBA", "MBA Finance", "PGDM"],
        placement: {
            averagePackage: 34,
            highestPackage: 115,
            placementRate: 100,
            topRecruiters: ["Goldman Sachs", "BCG", "McKinsey", "JP Morgan"],
        },
        reviewComments: [
            "Finance exposure is especially strong and the campus draws top recruiters year after year.",
            "The academics are intense, but the quality of outcomes makes the workload feel justified.",
        ],
    },
    {
        name: "XLRI Jamshedpur",
        slug: "xlri-jamshedpur",
        location: "Jamshedpur",
        state: "Jharkhand",
        fees: 2350000,
        rating: 4.7,
        imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
        overview: "A reputed management institute with standout HR and business management programs and very strong placement consistency.",
        courseNames: ["PGDM", "MBA HR", "MBA Business Management"],
        placement: {
            averagePackage: 30.5,
            highestPackage: 75,
            placementRate: 100,
            topRecruiters: ["Deloitte", "Accenture", "BCG", "HDFC Bank"],
        },
        reviewComments: [
            "The people and culture are a big strength, especially if you want leadership-oriented MBA exposure.",
            "Placement outcomes are strong and the institute's HR reputation is clearly reflected in recruiter quality.",
        ],
    },
    {
        name: "SPJIMR Mumbai",
        slug: "spjimr-mumbai",
        location: "Mumbai",
        state: "Maharashtra",
        fees: 2200000,
        rating: 4.6,
        imageUrl: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1200&q=80",
        overview: "A Mumbai-based management institute valued for industry immersion, strong finance and marketing outcomes, and a collaborative learning model.",
        courseNames: ["PGDM", "MBA Finance", "MBA Marketing"],
        placement: {
            averagePackage: 28,
            highestPackage: 80,
            placementRate: 99,
            topRecruiters: ["HDFC Bank", "JP Morgan", "Deloitte", "Amazon"],
        },
        reviewComments: [
            "The location creates real industry exposure and the programs are tightly aligned with business roles.",
            "Great batch diversity and strong placement support throughout the year.",
        ],
    },
    {
        name: "AIIMS Delhi",
        slug: "aiims-delhi",
        location: "New Delhi",
        state: "Delhi",
        fees: 6500,
        rating: 4.9,
        imageUrl: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=1200&q=80",
        overview: "India's benchmark public medical institution, recognised for clinical training depth, research output, and national-level prestige.",
        courseNames: ["MBBS", "B.Sc Nursing", "MD"],
        placement: {
            averagePackage: 12,
            highestPackage: 30,
            placementRate: 95,
            topRecruiters: ["AIIMS", "Tata", "HDFC Bank", "Deloitte"],
        },
        reviewComments: [
            "Clinical exposure is exceptional and the academic environment pushes you to grow very quickly.",
            "Facilities, reputation, and patient volume make it one of the best places to train in medicine.",
        ],
    },
    {
        name: "Christian Medical College Vellore",
        slug: "christian-medical-college-vellore",
        location: "Vellore",
        state: "Tamil Nadu",
        fees: 48000,
        rating: 4.8,
        imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
        overview: "A respected medical college known for patient-centric training, outstanding clinical exposure, and a deeply service-oriented culture.",
        courseNames: ["MBBS", "B.Sc Nursing", "MD"],
        placement: {
            averagePackage: 10,
            highestPackage: 28,
            placementRate: 94,
            topRecruiters: ["Tata", "Amazon", "HDFC Bank", "Accenture"],
        },
        reviewComments: [
            "The patient exposure is huge and the teaching culture feels rigorous but very supportive.",
            "CMC stands out for clinical depth and the sense of purpose built into the training experience.",
        ],
    },
    {
        name: "Armed Forces Medical College",
        slug: "armed-forces-medical-college",
        location: "Pune",
        state: "Maharashtra",
        fees: 90000,
        rating: 4.7,
        imageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
        overview: "A disciplined and respected medical college combining strong academics with service-focused professional development.",
        courseNames: ["MBBS", "B.Sc Nursing", "MD"],
        placement: {
            averagePackage: 11,
            highestPackage: 25,
            placementRate: 93,
            topRecruiters: ["Tata", "Wipro", "Accenture", "Deloitte"],
        },
        reviewComments: [
            "Training is structured and demanding, but the medical exposure and discipline are excellent.",
            "The Pune ecosystem and institutional support help students stay focused and career-ready.",
        ],
    },
    {
        name: "National Law School of India University",
        slug: "national-law-school-of-india-university",
        location: "Bangalore",
        state: "Karnataka",
        fees: 350000,
        rating: 4.8,
        imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
        overview: "A top national law university with strong academics, moot court culture, and elite corporate law and policy opportunities.",
        courseNames: ["BA LLB", "LLM"],
        placement: {
            averagePackage: 18,
            highestPackage: 45,
            placementRate: 90,
            topRecruiters: ["Goldman Sachs", "JP Morgan", "Deloitte", "McKinsey"],
        },
        reviewComments: [
            "The legal training is rigorous and the quality of classroom debate is one of the best parts of the experience.",
            "Corporate placements are strong, but the institute also opens great paths into litigation and policy.",
        ],
    },
    {
        name: "NALSAR University of Law",
        slug: "nalsar-university-of-law",
        location: "Hyderabad",
        state: "Telangana",
        fees: 320000,
        rating: 4.7,
        imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
        overview: "A highly regarded law campus with strong litigation, corporate law, and public policy exposure backed by a focused academic environment.",
        courseNames: ["BA LLB", "LLM", "BBA LLB"],
        placement: {
            averagePackage: 16.5,
            highestPackage: 40,
            placementRate: 88,
            topRecruiters: ["Deloitte", "JP Morgan", "Accenture", "HDFC Bank"],
        },
        reviewComments: [
            "The academics are serious and the moot court culture pushes students to become much more polished.",
            "Good recruiter access and strong peer quality make the overall learning environment very effective.",
        ],
    },
    {
        name: "Symbiosis Law School",
        slug: "symbiosis-law-school",
        location: "Pune",
        state: "Maharashtra",
        fees: 420000,
        rating: 4.3,
        imageUrl: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1200&q=80",
        overview: "A popular private law school with strong student activities, strong Pune industry access, and consistent internship opportunities.",
        courseNames: ["BA LLB", "BBA LLB", "LLB"],
        placement: {
            averagePackage: 9.5,
            highestPackage: 20,
            placementRate: 78,
            topRecruiters: ["Deloitte", "HDFC Bank", "Accenture", "Tata"],
        },
        reviewComments: [
            "The environment is active and there is good support for moots, events, and internships.",
            "It works well for students who want a private-campus experience with decent legal recruiter access.",
        ],
    },
    {
        name: "National Institute of Design Ahmedabad",
        slug: "national-institute-of-design-ahmedabad",
        location: "Ahmedabad",
        state: "Gujarat",
        fees: 390000,
        rating: 4.7,
        imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
        overview: "A design-first institution with strong studio culture, brand visibility, and solid outcomes across digital, product, and communication design.",
        courseNames: ["B.Des", "M.Des", "UI/UX Design"],
        placement: {
            averagePackage: 12.5,
            highestPackage: 35,
            placementRate: 85,
            topRecruiters: ["Amazon", "Microsoft", "Deloitte", "Accenture"],
        },
        reviewComments: [
            "The studio culture is intense in a good way and the feedback you get from faculty is extremely valuable.",
            "NID stands out for design thinking and the quality of projects students graduate with.",
        ],
    },
    {
        name: "NIFT Delhi",
        slug: "nift-delhi",
        location: "New Delhi",
        state: "Delhi",
        fees: 300000,
        rating: 4.5,
        imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
        overview: "A strong choice for fashion and textile design students looking for established industry connections and brand visibility.",
        courseNames: ["Fashion Design", "B.Des", "Textile Design"],
        placement: {
            averagePackage: 8.5,
            highestPackage: 22,
            placementRate: 82,
            topRecruiters: ["Amazon", "Deloitte", "Accenture", "Tata"],
        },
        reviewComments: [
            "The Delhi location helps with events, internships, and industry exposure in fashion and retail.",
            "A strong fit for students who want a structured design curriculum with visible placement outcomes.",
        ],
    },
    {
        name: "MIT Institute of Design",
        slug: "mit-institute-of-design",
        location: "Pune",
        state: "Maharashtra",
        fees: 450000,
        rating: 4.2,
        imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
        overview: "A private design institute with hands-on project work, interdisciplinary exposure, and a student portfolio-driven learning model.",
        courseNames: ["B.Des", "UI/UX Design", "Product Design"],
        placement: {
            averagePackage: 7.5,
            highestPackage: 18,
            placementRate: 76,
            topRecruiters: ["Accenture", "Capgemini", "Amazon", "Wipro"],
        },
        reviewComments: [
            "The project-based learning format is strong, especially for UI/UX and product design students.",
            "Industry interaction is good, and Pune gives students a practical setting for internships and collaborations.",
        ],
    },
    {
        name: "Shri Ram College of Commerce",
        slug: "shri-ram-college-of-commerce",
        location: "New Delhi",
        state: "Delhi",
        fees: 45000,
        rating: 4.8,
        imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
        overview: "One of India's most sought-after commerce colleges, with strong academics, finance-oriented culture, and excellent brand equity.",
        courseNames: ["B.Com", "B.A Economics", "M.Com"],
        placement: {
            averagePackage: 10.5,
            highestPackage: 35,
            placementRate: 90,
            topRecruiters: ["Goldman Sachs", "JP Morgan", "Deloitte", "HDFC Bank"],
        },
        reviewComments: [
            "The student societies and internship culture make SRCC feel very career-focused from the first year.",
            "For commerce and economics, the peer quality and recruiter attention are both major advantages.",
        ],
    },
    {
        name: "St. Xavier's College Mumbai",
        slug: "st-xaviers-college-mumbai",
        location: "Mumbai",
        state: "Maharashtra",
        fees: 50000,
        rating: 4.6,
        imageUrl: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1200&q=80",
        overview: "A legacy institution with strong academics, a vibrant campus culture, and good undergraduate outcomes across commerce and economics.",
        courseNames: ["B.Com", "BMS", "B.A Economics"],
        placement: {
            averagePackage: 7.5,
            highestPackage: 21,
            placementRate: 84,
            topRecruiters: ["Deloitte", "HDFC Bank", "Accenture", "JP Morgan"],
        },
        reviewComments: [
            "The Mumbai location and strong college brand help students build good internship profiles.",
            "Campus life is lively, and the balance between academics and extracurriculars works very well.",
        ],
    },
    {
        name: "Christ University",
        slug: "christ-university",
        location: "Bangalore",
        state: "Karnataka",
        fees: 175000,
        rating: 4.4,
        imageUrl: "https://images.unsplash.com/photo-1568792923760-d70635a89fdc?auto=format&fit=crop&w=1200&q=80",
        overview: "A multidisciplinary university with polished student systems, strong undergraduate programs, and dependable placement support.",
        courseNames: ["B.Com", "BBA", "BCA"],
        placement: {
            averagePackage: 6.8,
            highestPackage: 18,
            placementRate: 82,
            topRecruiters: ["Deloitte", "Accenture", "Wipro", "Infosys"],
        },
        reviewComments: [
            "The structure and discipline help students stay consistent, especially in business and commerce programs.",
            "Placement support is reliable and the Bangalore location adds clear value for internships.",
        ],
    },
    {
        name: "IIIT Hyderabad",
        slug: "iiit-hyderabad",
        location: "Hyderabad",
        state: "Telangana",
        fees: 360000,
        rating: 4.7,
        imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
        overview: "A highly specialized technology institute known for deep computer science rigor, strong research output, and elite software placements.",
        courseNames: ["B.Tech Computer Science", "B.Tech AI & ML", "M.Tech AI"],
        placement: {
            averagePackage: 32,
            highestPackage: 85,
            placementRate: 96,
            topRecruiters: ["Google", "Microsoft", "Amazon", "Goldman Sachs"],
        },
        reviewComments: [
            "The coding culture is intense and the research-driven environment benefits serious CS students immensely.",
            "Placements are outstanding, especially for students interested in systems, AI, and product engineering.",
        ],
    },
    {
        name: "IIIT Bangalore",
        slug: "iiit-bangalore",
        location: "Bangalore",
        state: "Karnataka",
        fees: 384000,
        rating: 4.5,
        imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
        overview: "A focused technology campus with strong software, AI, and analytics outcomes backed by Bangalore's tech ecosystem.",
        courseNames: [
            "B.Tech Computer Science",
            "M.Tech AI",
            "M.Tech Data Science",
        ],
        placement: {
            averagePackage: 24,
            highestPackage: 65,
            placementRate: 94,
            topRecruiters: ["Microsoft", "Amazon", "Goldman Sachs", "Deloitte"],
        },
        reviewComments: [
            "The program quality is strong and the tech-industry proximity helps a lot with internships and interviews.",
            "A great fit if you want a compact, focused institute with strong software and AI outcomes.",
        ],
    },
    {
        name: "DAIICT Gandhinagar",
        slug: "daiict-gandhinagar",
        location: "Gandhinagar",
        state: "Gujarat",
        fees: 210000,
        rating: 4.3,
        imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
        overview: "An ICT-focused campus with a strong coding ecosystem, thoughtful academics, and dependable placement results.",
        courseNames: [
            "B.Tech ICT",
            "B.Tech Computer Science",
            "M.Tech Data Science",
        ],
        placement: {
            averagePackage: 14,
            highestPackage: 45,
            placementRate: 90,
            topRecruiters: ["Amazon", "Microsoft", "TCS", "Infosys"],
        },
        reviewComments: [
            "The academic setup is strong for students who want CS and data-centric learning without a huge campus size.",
            "Placements are consistent and the institute has a good reputation among technology recruiters.",
        ],
    },
    {
        name: "Delhi University",
        slug: "delhi-university",
        location: "New Delhi",
        state: "Delhi",
        fees: 35000,
        rating: 4.5,
        imageUrl: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1200&q=80",
        overview: "A broad public university system with strong undergraduate commerce, economics, and computer science programs across multiple colleges.",
        courseNames: ["B.Com", "B.A Economics", "B.Sc Computer Science"],
        placement: {
            averagePackage: 6.5,
            highestPackage: 20,
            placementRate: 80,
            topRecruiters: ["Deloitte", "Accenture", "HDFC Bank", "Capgemini"],
        },
        reviewComments: [
            "The value for money is excellent, especially when paired with strong societies and internships.",
            "DU gives students a wide range of academic and extracurricular options with great city exposure.",
        ],
    },
    {
        name: "Mumbai University",
        slug: "mumbai-university",
        location: "Mumbai",
        state: "Maharashtra",
        fees: 30000,
        rating: 4.1,
        imageUrl: "https://images.unsplash.com/photo-1568792923760-d70635a89fdc?auto=format&fit=crop&w=1200&q=80",
        overview: "A large public university with strong city access, broad undergraduate options, and good affordability for commerce and CS students.",
        courseNames: ["B.Com", "BMS", "B.Sc Computer Science"],
        placement: {
            averagePackage: 4.5,
            highestPackage: 12,
            placementRate: 70,
            topRecruiters: ["HDFC Bank", "TCS", "Infosys", "Accenture"],
        },
        reviewComments: [
            "The affordability is a major plus, and the city location helps students build internship exposure on their own.",
            "A practical option for students who want a broad set of degree choices with flexible pathways.",
        ],
    },
    {
        name: "Amity University Noida",
        slug: "amity-university-noida",
        location: "Noida",
        state: "Uttar Pradesh",
        fees: 280000,
        rating: 4,
        imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
        overview: "A broad private university with strong infrastructure, wide program diversity, and visible placement support across disciplines.",
        courseNames: ["B.Tech Computer Science", "MBA", "BBA", "B.Des"],
        placement: {
            averagePackage: 6,
            highestPackage: 30,
            placementRate: 75,
            topRecruiters: ["TCS", "Infosys", "Wipro", "Deloitte"],
        },
        reviewComments: [
            "The university offers a lot of program choice, and students can shape their own path with internships and extracurriculars.",
            "Infrastructure is strong and placements are reasonable for students who stay proactive.",
        ],
    },
    {
        name: "IIT Kanpur",
        slug: "iit-kanpur",
        location: "Kanpur",
        state: "Uttar Pradesh",
        fees: 225000,
        rating: 4.7,
        imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
        overview: "A research-led IIT with excellent technical depth, high-quality faculty, and strong outcomes in core engineering and software roles.",
        courseNames: [
            "B.Tech Computer Science",
            "B.Tech Aerospace Engineering",
            "M.Tech AI",
        ],
        placement: {
            averagePackage: 19.8,
            highestPackage: 95,
            placementRate: 90,
            topRecruiters: ["Google", "Microsoft", "Amazon", "Goldman Sachs"],
        },
        reviewComments: [
            "The institute is academically rigorous and especially strong for students interested in research or advanced technical work.",
            "Placements are consistently strong and the peer group pushes you to aim much higher.",
        ],
    },
    {
        name: "ISB Hyderabad",
        slug: "isb-hyderabad",
        location: "Hyderabad",
        state: "Telangana",
        fees: 3800000,
        rating: 4.8,
        imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
        overview: "A globally visible business school with strong executive-facing pedagogy, premium recruiter access, and standout leadership outcomes.",
        courseNames: ["MBA", "MBA Finance", "MBA Marketing"],
        placement: {
            averagePackage: 34.5,
            highestPackage: 78,
            placementRate: 99,
            topRecruiters: ["BCG", "McKinsey", "Amazon", "Goldman Sachs"],
        },
        reviewComments: [
            "The one-year MBA format is intense, but the quality of peers and recruiter access is genuinely impressive.",
            "A great option for professionals looking for a premium management program with strong brand value.",
        ],
    },
    {
        name: "King George's Medical University",
        slug: "king-georges-medical-university",
        location: "Lucknow",
        state: "Uttar Pradesh",
        fees: 54000,
        rating: 4.6,
        imageUrl: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=1200&q=80",
        overview: "A respected public medical institution with strong hospital exposure, robust training systems, and a long-standing clinical reputation.",
        courseNames: ["MBBS", "B.Sc Nursing", "MD"],
        placement: {
            averagePackage: 9.8,
            highestPackage: 24,
            placementRate: 91,
            topRecruiters: ["Tata", "Deloitte", "HDFC Bank", "Accenture"],
        },
        reviewComments: [
            "The patient load gives students a huge amount of practical learning, especially in clinical years.",
            "The academic structure is demanding, but the real-world medical exposure is a major strength.",
        ],
    },
    {
        name: "The West Bengal National University of Juridical Sciences",
        slug: "nujs-kolkata",
        location: "Kolkata",
        state: "West Bengal",
        fees: 330000,
        rating: 4.6,
        imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
        overview: "A leading national law university with a strong reputation in corporate law, moots, and competitive internships.",
        courseNames: ["BA LLB", "BBA LLB", "LLM"],
        placement: {
            averagePackage: 15.8,
            highestPackage: 38,
            placementRate: 87,
            topRecruiters: ["JP Morgan", "Deloitte", "Accenture", "HDFC Bank"],
        },
        reviewComments: [
            "Mooting and legal writing culture are both very strong, which really improves student confidence over time.",
            "Good balance between academics, internships, and campus activities for a national law university.",
        ],
    },
    {
        name: "Pearl Academy Delhi",
        slug: "pearl-academy-delhi",
        location: "New Delhi",
        state: "Delhi",
        fees: 520000,
        rating: 4.1,
        imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
        overview: "A design-focused private institution with strong industry-led curriculum and practical portfolio development.",
        courseNames: ["Fashion Design", "UI/UX Design", "B.Des"],
        placement: {
            averagePackage: 6.8,
            highestPackage: 16,
            placementRate: 74,
            topRecruiters: ["Accenture", "Amazon", "Capgemini", "Deloitte"],
        },
        reviewComments: [
            "The portfolio-driven learning model helps students build work that actually feels industry-ready.",
            "A good option for students who want design exposure with strong event and studio participation.",
        ],
    },
    {
        name: "Loyola College Chennai",
        slug: "loyola-college-chennai",
        location: "Chennai",
        state: "Tamil Nadu",
        fees: 85000,
        rating: 4.5,
        imageUrl: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1200&q=80",
        overview: "A respected autonomous college known for strong undergraduate teaching, vibrant student life, and solid placements in commerce and computer applications.",
        courseNames: ["B.Com", "BBA", "BCA"],
        placement: {
            averagePackage: 5.8,
            highestPackage: 15,
            placementRate: 79,
            topRecruiters: ["TCS", "Infosys", "Deloitte", "Accenture"],
        },
        reviewComments: [
            "The college has a strong reputation locally and gives students a well-rounded academic environment.",
            "Good value for students looking for commerce or BCA pathways with decent placements.",
        ],
    },
    {
        name: "PSG College of Technology",
        slug: "psg-college-of-technology",
        location: "Coimbatore",
        state: "Tamil Nadu",
        fees: 95000,
        rating: 4.4,
        imageUrl: "https://images.unsplash.com/photo-1568792923760-d70635a89fdc?auto=format&fit=crop&w=1200&q=80",
        overview: "A highly regarded engineering college in Tamil Nadu with strong academic discipline and reliable technical placements.",
        courseNames: [
            "B.Tech Computer Science",
            "B.Tech Electrical Engineering",
            "B.Tech Mechanical Engineering",
        ],
        placement: {
            averagePackage: 8.9,
            highestPackage: 28,
            placementRate: 86,
            topRecruiters: ["TCS", "Infosys", "Amazon", "Capgemini"],
        },
        reviewComments: [
            "A strong choice for students who want disciplined academics and consistent engineering placements.",
            "The value for money is excellent and the college has a long-standing reputation in the region.",
        ],
    },
    {
        name: "NMIMS Mumbai",
        slug: "nmims-mumbai",
        location: "Mumbai",
        state: "Maharashtra",
        fees: 2100000,
        rating: 4.5,
        imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
        overview: "A strong private management destination in Mumbai with corporate exposure, polished infrastructure, and wide recruiter participation.",
        courseNames: ["MBA", "MBA Finance", "BBA"],
        placement: {
            averagePackage: 26.2,
            highestPackage: 67,
            placementRate: 97,
            topRecruiters: ["JP Morgan", "Deloitte", "HDFC Bank", "Amazon"],
        },
        reviewComments: [
            "The location really helps with industry exposure and the institute runs placements in a highly organized way.",
            "A good fit for students looking for strong management branding with Mumbai-based opportunities.",
        ],
    },
    {
        name: "JIPMER Puducherry",
        slug: "jipmer-puducherry",
        location: "Puducherry",
        state: "Tamil Nadu",
        fees: 12000,
        rating: 4.7,
        imageUrl: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=1200&q=80",
        overview: "A top public medical institute known for excellent clinical exposure, affordability, and strong academic systems.",
        courseNames: ["MBBS", "B.Sc Nursing", "MD"],
        placement: {
            averagePackage: 10.8,
            highestPackage: 27,
            placementRate: 94,
            topRecruiters: ["Tata", "Deloitte", "Accenture", "HDFC Bank"],
        },
        reviewComments: [
            "JIPMER offers strong medical training with an excellent cost-to-quality balance.",
            "The patient exposure and faculty quality together make it a very attractive option for medical aspirants.",
        ],
    },
    {
        name: "National Institute of Fashion Technology Mumbai",
        slug: "nift-mumbai",
        location: "Mumbai",
        state: "Maharashtra",
        fees: 315000,
        rating: 4.3,
        imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
        overview: "A fashion and design institute with strong city exposure, brand visibility, and industry-linked design projects.",
        courseNames: ["Fashion Design", "B.Des", "UI/UX Design"],
        placement: {
            averagePackage: 7.2,
            highestPackage: 17,
            placementRate: 78,
            topRecruiters: ["Amazon", "Accenture", "Capgemini", "Deloitte"],
        },
        reviewComments: [
            "The Mumbai location is a major strength for students interested in fashion and creative industry exposure.",
            "Projects and showcases help build strong portfolios if you stay engaged throughout the course.",
        ],
    },
];
const collegeSeedData = collegeDefinitions.map((college, index) => {
    const [firstReviewer, secondReviewer] = reviewerNames[index % reviewerNames.length];
    return {
        name: college.name,
        slug: college.slug,
        location: college.location,
        state: college.state,
        fees: college.fees,
        rating: college.rating,
        imageUrl: college.imageUrl,
        overview: college.overview,
        courses: college.courseNames.map((courseName, courseIndex) => ({
            name: courseName,
            duration: inferDuration(courseName),
            fees: inferCourseFee(college.fees, courseName, courseIndex),
        })),
        placement: college.placement,
        reviews: [
            {
                student: firstReviewer,
                rating: clampRating(college.rating + 0.1),
                comment: college.reviewComments[0],
            },
            {
                student: secondReviewer,
                rating: clampRating(college.rating - 0.1),
                comment: college.reviewComments[1],
            },
        ],
    };
});
const seed = async () => {
    console.log("Starting database seed...");
    await db_1.db.transaction(async (tx) => {
        await tx.delete(schema_1.savedColleges);
        await tx.delete(schema_1.reviews);
        await tx.delete(schema_1.placements);
        await tx.delete(schema_1.courses);
        await tx.delete(schema_1.colleges);
        const hashedPassword = await bcryptjs_1.default.hash("password123", 12);
        const [existingDemoUser] = await tx
            .select({ id: schema_1.users.id })
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.email, "demo@example.com"))
            .limit(1);
        if (existingDemoUser) {
            await tx
                .update(schema_1.users)
                .set({
                name: "Demo User",
                password: hashedPassword,
            })
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, existingDemoUser.id));
        }
        else {
            await tx.insert(schema_1.users).values({
                name: "Demo User",
                email: "demo@example.com",
                password: hashedPassword,
            });
        }
        for (const college of collegeSeedData) {
            const [createdCollege] = await tx
                .insert(schema_1.colleges)
                .values({
                name: college.name,
                slug: college.slug,
                location: college.location,
                state: college.state,
                fees: college.fees,
                rating: college.rating,
                imageUrl: college.imageUrl,
                overview: college.overview,
            })
                .returning({ id: schema_1.colleges.id });
            await tx.insert(schema_1.courses).values(college.courses.map((course) => ({
                ...course,
                collegeId: createdCollege.id,
            })));
            await tx.insert(schema_1.placements).values({
                ...college.placement,
                collegeId: createdCollege.id,
            });
            await tx.insert(schema_1.reviews).values(college.reviews.map((review) => ({
                ...review,
                collegeId: createdCollege.id,
            })));
        }
    });
    console.log(`Seed completed successfully with ${collegeSeedData.length} colleges and 1 demo user.`);
};
seed()
    .catch((error) => {
    console.error("Database seed failed.", error);
    process.exitCode = 1;
})
    .finally(async () => {
    await db_1.pool.end();
});

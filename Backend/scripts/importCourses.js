require("dotenv").config();
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const mongoose = require("mongoose");

const Course = require("../models/Course");
const User = require("../models/User");

const departmentOptions = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL"];
const colorPalette = ["#E75480", "#4F46E5", "#10B981", "#F59E0B", "#8B5CF6", "#14B8A6"];

const normalizeLevel = (level) => {
  const value = String(level || "All Levels").trim().toLowerCase();

  if (value.includes("advanced") || value.includes("expert")) return "Advanced";
  if (value.includes("intermediate")) return "Intermediate";
  return "Beginner";
};

const toDurationString = (value) => {
  const hours = Number(value);

  if (!Number.isFinite(hours) || hours <= 0) return "4 weeks";
  if (hours < 2) return "1 week";
  if (hours < 12) return `${Math.max(1, Math.round(hours))} weeks`;
  return `${Math.max(1, Math.round(hours / 4))} months`;
};

const mapDepartment = (subject, courseId) => {
  const text = String(subject || "").toLowerCase();

  if (text.includes("business") || text.includes("finance") || text.includes("trade")) {
    return "CSE";
  }

  if (text.includes("programming") || text.includes("software") || text.includes("code")) {
    return "CSE";
  }

  if (text.includes("electronics") || text.includes("circuit")) {
    return "ECE";
  }

  if (text.includes("mechanic") || text.includes("manufact")) {
    return "MECH";
  }

  if (text.includes("civil") || text.includes("construction")) {
    return "CIVIL";
  }

  return departmentOptions[(Number(courseId) || 0) % departmentOptions.length];
};

const buildModuleTitle = (courseTitle, subject, moduleIndex, totalModules) => {
  const moduleNames = [
    "Foundations and Core Concepts",
    "Application and Practice",
    "Advanced Techniques and Strategy",
    "Real-World Scenarios",
    "Analysis and Optimization",
    "Project Workflow and Review",
  ];

  const titleBase = (courseTitle || "Course").trim();
  const label = (subject || "Learning").trim();
  const index = Math.min(moduleIndex, moduleNames.length - 1);

  return `${label} ${moduleNames[index]}${totalModules > 1 ? ` ${moduleIndex + 1}` : ""}`.replace(/\s+/g, " ").trim() || `${titleBase} Foundation`;
};

const buildLessonTitle = (courseTitle, subject, lessonIndex, totalLessons, level) => {
  const titleBase = (courseTitle || "Course").trim();
  const subjectLabel = (subject || "Learning").trim();
  const levelLabel = String(level || "Beginner").trim();
  const patterns = [
    "Fundamentals",
    "Key Concepts",
    "Practical Application",
    "Hands-on Strategy",
    "Problem Solving",
    "Review and Reflection",
    "Implementation Patterns",
    "Optimization Techniques",
  ];

  const pattern = patterns[lessonIndex % patterns.length];
  const number = totalLessons > 1 ? ` ${lessonIndex + 1}` : "";

  return `${subjectLabel} ${pattern}${number} — ${levelLabel}`.replace(/\s+/g, " ").trim() || `${titleBase} ${pattern}`;
};

const buildDetailedLessonContent = (courseTitle, subject, lessonIndex, totalLessons, level, duration) => {
  const title = buildLessonTitle(courseTitle, subject, lessonIndex, totalLessons, level);
  const durationText = duration || "30 min";
  const subjectText = String(subject || "learning").trim();
  const levelText = String(level || "Beginner").trim();
  const exampleCode = [
    "// Example workflow",
    "const objective = 'apply the lesson concept confidently';",
    "const steps = ['explain', 'practice', 'review'];",
    "console.log(objective, steps.length);",
  ].join("\n");

  const shouldIncludeExample = /finance|trading|programming|code|analysis|model|algorithm|excel|python|javascript|css|html|data|sql|database|ai|ml|machine/i.test(subjectText);

  const lessonDescription = `In this lesson, learners explore the key ideas behind ${title.toLowerCase()} and understand how they connect to ${subjectText.toLowerCase()} practice in a ${levelText.toLowerCase()} learning path.`;

  const content = [
    `This lesson introduces the essential principles behind ${courseTitle} and shows how they are applied in a structured ${subjectText.toLowerCase()} workflow.`,
    `Students will review the most important concepts, connect them to realistic examples, and build confidence through guided practice across ${durationText} of focused learning.`,
    `The session emphasizes clarity, practical execution, and consistent review so that learners can apply the concepts in projects, assignments, and everyday problem solving.`,
    `By the end of the lesson, the learner should be able to explain the concept, recognize common scenarios, and confidently organize the next steps in a ${levelText.toLowerCase()} context.`,
  ].join(" ");

  return {
    title,
    description: lessonDescription,
    content,
    videoUrl: "",
    resources: [
      `${courseTitle} quick reference`,
      `${subjectText} learning checklist`,
      `Practice activity for ${title}`,
    ],
    quiz: [
      {
        question: `What is the main goal of ${title}?`,
        options: [
          "To memorize without context",
          "To understand and apply the concept effectively",
          "To avoid practice",
          "To skip review and summary",
        ],
        answer: "To understand and apply the concept effectively",
      },
    ],
    exampleCode: shouldIncludeExample ? exampleCode : "",
  };
};

const buildModules = (lectureCount, courseTitle, subject, level, duration) => {
  const lessonTotal = Math.max(1, Number(lectureCount) || 1);
  const totalModules = Math.min(3, Math.max(1, Math.ceil(lessonTotal / 4)));

  return Array.from({ length: totalModules }, (_, moduleIndex) => {
    const start = moduleIndex * Math.ceil(lessonTotal / totalModules);
    const end = Math.min(start + Math.ceil(lessonTotal / totalModules), lessonTotal);
    const lessons = Array.from({ length: Math.max(1, end - start) }, (_, lessonOffset) => {
      const lessonIndex = start + lessonOffset;
      const lessonMeta = buildDetailedLessonContent(courseTitle, subject, lessonIndex, lessonTotal, level, duration);

      return {
        id: `lesson-${lessonIndex + 1}`,
        title: lessonMeta.title,
        duration: `${Math.max(15, 25 + ((lessonIndex + 1) % 6) * 10)} min`,
        done: false,
        codeFile: lessonMeta.exampleCode ? `lesson-${lessonIndex + 1}.js` : "",
        description: lessonMeta.description,
        content: lessonMeta.content,
        videoUrl: lessonMeta.videoUrl,
        resources: lessonMeta.resources,
        quiz: lessonMeta.quiz,
      };
    });

    return {
      id: `module-${moduleIndex + 1}`,
      title: buildModuleTitle(courseTitle, subject, moduleIndex, totalModules),
      lessons,
    };
  });
};

const buildFirstCourseModules = (courseTitle, subject) => {
  const title = String(courseTitle || "Course").trim();
  const subjectLabel = String(subject || "Finance").trim();

  const exampleSnippet = `const dealSummary = {
  company: "Target Corp",
  sector: "Consumer",
  valuation: 1400000000,
  leverage: 3.2,
  rationale: "Strong market position and stable cash flow"
};

console.log(dealSummary.rationale);`;

  const modules = [
    {
      id: "module-1",
      title: "Industry Landscape and Deal Fundamentals",
      lessons: [
        {
          id: "lesson-1",
          title: "Understanding the Investment Banking Context",
          duration: "30 min",
          done: false,
          codeFile: "lesson-1.js",
          description: `This lesson introduces the core investment banking environment behind ${title} and explains how transactions are structured in ${subjectLabel}.`,
          content: `Investment banking is not only about raising capital; it is also about advising companies, structuring deals, and creating value for stakeholders. In this lesson, you will study the market actors, the purpose of financing, and the relationship between client goals and transaction execution. The focus is on understanding why banks assist with mergers, acquisitions, debt issuance, and advisory work. By the end of the lesson, you should be able to explain the role of investment banks in major financial decisions and how those decisions affect company strategy and investor confidence.`,
          videoUrl: "",
          resources: ["Investment banking overview", "Deal lifecycle checklist", "Capital markets primer"],
          quiz: [
            {
              question: "Why do companies engage investment banks for major transactions?",
              options: ["To avoid regulation", "To access expertise and market access", "To reduce taxes automatically", "To remove competition"],
              answer: "To access expertise and market access",
            },
          ],
        },
        {
          id: "lesson-2",
          title: "Core Financial Statements and Deal Drivers",
          duration: "40 min",
          done: false,
          codeFile: "lesson-2.js",
          description: `Learn how income statements, balance sheets, and cash flow statements help explain valuation and transaction decisions in ${subjectLabel}.`,
          content: `Financial statements give analysts a structured view of a company’s operations, leverage, and liquidity. In this lesson, you review revenue trends, operating margins, debt capacity, and cash generation. These metrics are essential when evaluating whether a deal is strategic, financially feasible, and value-accretive. This lesson connects accounting fundamentals to real-world investment banking decisions and shows why quality financial reporting matters for buyers, sellers, and lenders.`,
          videoUrl: "",
          resources: ["Financial statement checklist", "Valuation signal guide", "Balance sheet interpretation notes"],
          quiz: [
            {
              question: "Which financial statement is most useful for evaluating a company’s cash generating ability?",
              options: ["Income statement", "Cash flow statement", "Statement of retained earnings", "Notes to accounts"],
              answer: "Cash flow statement",
            },
          ],
        },
      ],
    },
    {
      id: "module-2",
      title: "Valuation, Modeling, and Decision Making",
      lessons: [
        {
          id: "lesson-3",
          title: "Building a Valuation Framework",
          duration: "35 min",
          done: false,
          codeFile: "lesson-3.js",
          description: `Study the main valuation logic behind ${title}, including comparables, precedent transactions, and discounted cash flow reasoning.`,
          content: `Valuation is central to investment banking because it tells stakeholders whether a price is fair, attractive, or too expensive. This lesson walks through the main methods analysts use to estimate value, including market comparables and discounted cash flow analysis. You will learn how to interpret the output of a model and how assumptions such as growth, margin, and discount rate can change the outcome.`,
          videoUrl: "",
          resources: ["Valuation methods summary", "DCF walkthrough", "Comparable company template"],
          quiz: [
            {
              question: "What is the main purpose of valuation in a deal context?",
              options: ["To predict exact stock prices", "To estimate fair value for negotiation", "To replace due diligence", "To delay financial decisions"],
              answer: "To estimate fair value for negotiation",
            },
          ],
        },
        {
          id: "lesson-4",
          title: "Example Deal Modeling Walkthrough",
          duration: "45 min",
          done: false,
          codeFile: "lesson-4.js",
          description: `Use a practical example to apply valuation logic to a realistic transaction case in ${subjectLabel}.`,
          content: `In this lesson, you review a simplified deal scenario and build a structured approach for translating business performance into valuation assumptions. The example includes a target company, a market benchmark, and a financing structure. You will see how a banker connects the story of the company to the numbers used in a transaction model. A short code example is included to illustrate how a simple deal summary can be organized for analysis.\n\n${exampleSnippet}`,
          videoUrl: "",
          resources: ["Deal summary template", "Model assumptions checklist", "Negotiation framework notes"],
          quiz: [
            {
              question: "Why is a deal summary useful before valuation work begins?",
              options: ["It replaces financial statements", "It clarifies the strategic and financial context", "It eliminates the need for market research", "It removes all uncertainty"],
              answer: "It clarifies the strategic and financial context",
            },
          ],
        },
      ],
    },
    {
      id: "module-3",
      title: "Execution, Communication, and Client Advisory",
      lessons: [
        {
          id: "lesson-5",
          title: "Preparing the Client Story",
          duration: "30 min",
          done: false,
          codeFile: "lesson-5.js",
          description: `This lesson shows how investment bankers turn business performance into a compelling narrative for clients and investors.`,
          content: `The best financial advice is built on both numbers and communication. This lesson covers how to organize a recommendation, explain strategic rationale, and present a value case in a clear and persuasive way. You will learn how a client-facing story ties together market trends, financial performance, and the transaction rationale so that decision makers can act with confidence.`,
          videoUrl: "",
          resources: ["Client pitch outline", "Executive briefing template", "Stakeholder communication tips"],
          quiz: [
            {
              question: "What is the strongest reason to present a clear client narrative in finance work?",
              options: ["It ensures numbers are ignored", "It helps stakeholders understand the logic behind the recommendation", "It replaces analysis", "It limits stakeholder questions"],
              answer: "It helps stakeholders understand the logic behind the recommendation",
            },
          ],
        },
        {
          id: "lesson-6",
          title: "Reviewing Risks and Next Steps",
          duration: "35 min",
          done: false,
          codeFile: "lesson-6.js",
          description: `Learn how to evaluate risk, conclude a transaction plan, and prioritize the next actions in a finance-driven strategy.`,
          content: `A strong financial recommendation does not end with the model. It must also consider risk, timing, execution, and client readiness. This lesson explains how to review risks such as market conditions, leverage, and execution complexity, then convert them into a practical next-step plan. It should help you understand how investment banking decisions are communicated and implemented in a realistic advisory environment.`,
          videoUrl: "",
          resources: ["Risk review checklist", "Execution plan template", "Board-ready summary notes"],
          quiz: [
            {
              question: "Why is risk review important in investment banking work?",
              options: ["It removes all uncertainty", "It helps decision makers prepare for execution realities", "It makes the model easier to ignore", "It eliminates the need for a recommendation"],
              answer: "It helps decision makers prepare for execution realities",
            },
          ],
        },
      ],
    },
  ];

  return modules;
};

const ensureFacultyExists = async () => {
  let faculty = await User.findOne({ email: "faculty@studybuddy.com" });

  if (!faculty) {
    faculty = await User.create({
      fullName: "Study Buddy Faculty",
      email: "faculty@studybuddy.com",
      password: "Faculty@123",
      role: "faculty",
    });
  }

  return faculty;
};

const sanitizeDescription = (title, subject, url) => {
  const parts = [
    title,
    subject ? `Subject: ${subject}.` : "",
    url ? `Course URL: ${url}` : "",
  ].filter(Boolean);

  return parts.join(" ").slice(0, 500);
};

const importCourses = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const faculty = await ensureFacultyExists();
    const csvPath = path.join(__dirname, "..", "data", "course.csv");

    if (!fs.existsSync(csvPath)) {
      throw new Error(`Dataset not found at ${csvPath}`);
    }

    const rows = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on("data", (row) => rows.push(row))
        .on("end", resolve)
        .on("error", reject);
    });

    const uniqueRows = Object.values(
      rows.reduce((acc, row) => {
        const courseId = String(row.course_id || row.courseId || "").trim();
        if (!courseId) return acc;
        if (!acc[courseId]) acc[courseId] = row;
        return acc;
      }, {})
    );

    const mappedCourses = uniqueRows.map((row, index) => {
      const courseId = Number(row.course_id || row.courseId || index + 1);
      const courseCode = `COURSE-${String(courseId).trim()}`.toUpperCase();
      const title = String(row.course_title || `Course ${courseId}`).trim();
      const safeTitle = title.length > 100 ? title.slice(0, 100).trim() : title;
      const subject = String(row.subject || "Business Finance").trim();
      const level = normalizeLevel(row.level);
      const department = mapDepartment(subject, courseId);
      const students = Math.max(0, Number(row.num_subscribers || 0));
      const reviewsCount = Math.max(0, Number(row.num_reviews || 0));
      const lessonsCount = Math.max(1, Number(row.num_lectures || 1));
      const rating = reviewsCount > 0 ? Number((Math.min(4.9, 3.6 + (students % 10) / 10)).toFixed(2)) : 4.1;

      const mappedCourse = {
        courseName: safeTitle,
        courseCode,
        department,
        semester: ((courseId % 8) + 1),
        description: sanitizeDescription(title, subject, row.url),
        thumbnail: "📘",
        category: subject || "Business",
        level,
        duration: toDurationString(row.content_duration),
        color: colorPalette[(courseId + index) % colorPalette.length],
        skills: [subject || "Business", level, "Career growth"],
        outcomes: [
          "Understand the fundamentals clearly",
          "Apply concepts with real-world examples",
          "Track progress and build confidence",
        ],
        modules: buildModules(lessonsCount, title, subject, level, toDurationString(row.content_duration)),
        rating,
        students,
        reviewsCount,
        certificate: Boolean(row.is_paid),
        faculty: faculty._id,
        status: "Active",
      };

      if (index === 0) {
        mappedCourse.modules = buildFirstCourseModules(title, subject);
      }

      return mappedCourse;
    });

<<<<<<< HEAD
    // Re-importing deletes and recreates every imported course with new
    // _ids, which orphans student progress, quizzes, assignments and any
    // enriched content (see scripts/enrichCourses.js). Require an explicit
    // opt-in when imported courses already exist.
    const existingImported = await Course.countDocuments({ courseCode: { $regex: /^COURSE-/i } });
    if (existingImported > 0 && !process.argv.includes("--replace-existing")) {
      throw new Error(
        `${existingImported} imported courses already exist. Re-importing would replace them (new ids, enriched content lost). ` +
          "Use `npm run content:enrich` to improve content instead, or pass --replace-existing if you really want to wipe and re-import."
      );
    }

=======
>>>>>>> origin/main
    await Course.deleteMany({ courseCode: { $regex: /^COURSE-/i } });
    const insertedCourses = await Course.insertMany(mappedCourses);

    console.log(`✅ Imported ${insertedCourses.length} courses from ${csvPath}`);
    console.log(`Faculty used: ${faculty.email}`);

    return insertedCourses;
  } catch (error) {
    console.error("❌ Course import failed:", error.message);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
};

if (require.main === module) {
  importCourses()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { importCourses };

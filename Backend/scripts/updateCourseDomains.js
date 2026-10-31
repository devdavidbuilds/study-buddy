const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const Course = require("../models/Course");
const { determineDomain, DOMAIN_DEFINITIONS } = require("../utils/domainHelper");

const ATLAS_URI =
  "mongodb+srv://davidxprincexj_db_user:mqj9tIm17wHOzXNs@mycluster.g4bxtwy.mongodb.net/studybuddy";

const FLAGSHIP_COURSES = [
  // --- DATA SCIENCE & AI ---
  {
    courseCode: "DS-AI-101",
    courseName: "Machine Learning & Deep Learning with Python",
    department: "CSE",
    semester: 5,
    category: "Data Science",
    domain: "Data Science & AI",
    level: "Intermediate",
    duration: "8 weeks",
    rating: 4.9,
    students: 12450,
    color: "#6366F1",
    thumbnail: "🤖",
    certificate: true,
    status: "Active",
    description:
      "Master end-to-end Machine Learning and Deep Learning with Python. Covers regression, classification, clustering, neural networks, PyTorch, Scikit-learn, and model deployment.",
    skills: ["Python", "Machine Learning", "Deep Learning", "PyTorch", "Scikit-Learn", "Neural Networks"],
    outcomes: [
      "Build, train, and evaluate predictive machine learning models",
      "Implement deep neural networks for computer vision and NLP using PyTorch",
      "Deploy ML models into production REST APIs",
    ],
    modules: [
      {
        id: "ds101-mod-1",
        moduleNumber: 1,
        title: "Foundations of Machine Learning",
        summary: "Supervised and unsupervised learning principles, cost functions, gradient descent, and evaluation metrics.",
        lessons: [
          {
            id: "ds101-m1-l1",
            title: "Introduction to Machine Learning & Scikit-Learn",
            duration: "45 min",
            done: false,
            content: "Understand how machine learning differs from traditional algorithmic programming. Set up your Python environment with NumPy, Pandas, and Scikit-learn.",
          },
          {
            id: "ds101-m1-l2",
            title: "Linear & Logistic Regression from Scratch",
            duration: "50 min",
            done: false,
            content: "Dive deep into linear regression, loss functions, gradient descent optimization, and classification using logistic sigmoid functions.",
          },
        ],
      },
      {
        id: "ds101-mod-2",
        moduleNumber: 2,
        title: "Deep Learning & Neural Architectures",
        summary: "Multilayer perceptrons, backpropagation, convolutional networks, and PyTorch tensors.",
        lessons: [
          {
            id: "ds101-m2-l1",
            title: "Neural Networks & Backpropagation with PyTorch",
            duration: "60 min",
            done: false,
            content: "Understand forward passes, activation functions (ReLU, GELU), loss functions, and backpropagation mechanics in PyTorch.",
          },
        ],
      },
    ],
  },
  {
    courseCode: "DS-AI-102",
    courseName: "Data Science & Big Data Analytics Masterclass",
    department: "IT",
    semester: 4,
    category: "Data Science",
    domain: "Data Science & AI",
    level: "Beginner",
    duration: "6 weeks",
    rating: 4.8,
    students: 9820,
    color: "#06B6D4",
    thumbnail: "📊",
    certificate: true,
    status: "Active",
    description:
      "A complete guide to data wrangling, exploratory data analysis (EDA), statistical inference, Pandas, NumPy, Seaborn, and Apache Spark for big data pipelines.",
    skills: ["Data Analysis", "Pandas", "NumPy", "Statistics", "Data Visualization", "SQL"],
    outcomes: [
      "Clean, transform, and wrangle complex messy datasets using Pandas",
      "Extract statistical insights and design publication-quality visualizations",
      "Query analytical databases using high-performance SQL",
    ],
    modules: [
      {
        id: "ds102-mod-1",
        moduleNumber: 1,
        title: "Data Manipulation & Statistical Analysis",
        summary: "Vectorized operations in NumPy, Pandas DataFrames, handling null values, and summary statistics.",
        lessons: [
          {
            id: "ds102-m1-l1",
            title: "Vectorized Data Wrangling with Pandas & NumPy",
            duration: "40 min",
            done: false,
            content: "Learn index slicing, grouping, aggregating, joining, and pivoting DataFrames cleanly.",
          },
        ],
      },
    ],
  },
  {
    courseCode: "DS-AI-103",
    courseName: "Artificial Intelligence & Generative AI Systems",
    department: "CSE",
    semester: 6,
    category: "AI & ML",
    domain: "Data Science & AI",
    level: "Advanced",
    duration: "10 weeks",
    rating: 4.95,
    students: 15300,
    color: "#8B5CF6",
    thumbnail: "🧠",
    certificate: true,
    status: "Active",
    description:
      "Build real-world GenAI applications using Large Language Models (LLMs), Transformer architectures, Retrieval-Augmented Generation (RAG), vector databases, and LangChain.",
    skills: ["Generative AI", "LLMs", "RAG", "Vector Databases", "LangChain", "Prompt Engineering"],
    outcomes: [
      "Understand Transformer attention mechanisms and token embeddings",
      "Build production RAG pipelines with ChromaDB and semantic search",
      "Fine-tune lightweight open-source models for specialized domain tasks",
    ],
    modules: [
      {
        id: "ds103-mod-1",
        moduleNumber: 1,
        title: "Transformers & Vector Embeddings",
        summary: "Self-attention mechanics, positional encodings, embeddings, and similarity metrics.",
        lessons: [
          {
            id: "ds103-m1-l1",
            title: "Attention Mechanisms & Modern LLM Architecture",
            duration: "55 min",
            done: false,
            content: "Dissect how transformer encoders and decoders process language tokens using multi-head attention.",
          },
        ],
      },
    ],
  },

  // --- PROGRAMMING & CS ---
  {
    courseCode: "CS-PROG-201",
    courseName: "Data Structures & Algorithms in C++ and Java",
    department: "CSE",
    semester: 3,
    category: "Programming",
    domain: "Programming & CS",
    level: "Intermediate",
    duration: "12 weeks",
    rating: 4.9,
    students: 21800,
    color: "#10B981",
    thumbnail: "💻",
    certificate: true,
    status: "Active",
    description:
      "Master core computer science algorithms: arrays, linked lists, binary search trees, graphs, dynamic programming, sorting, and Big-O computational complexity analysis.",
    skills: ["Data Structures", "Algorithms", "C++", "Java", "Dynamic Programming", "Graph Theory"],
    outcomes: [
      "Analyze time and space complexity with Big-O notation",
      "Implement and manipulate trees, heaps, graphs, and hash maps",
      "Solve hard dynamic programming and recursive search problems",
    ],
    modules: [
      {
        id: "prog201-mod-1",
        moduleNumber: 1,
        title: "Linear Data Structures & Sorting",
        summary: "Dynamic arrays, linked lists, stacks, queues, and divide-and-conquer sorting.",
        lessons: [
          {
            id: "prog201-m1-l1",
            title: "Time & Space Complexity with Big-O Notation",
            duration: "45 min",
            done: false,
            content: "Understand algorithmic efficiency, amortized analysis, worst-case vs average-case behavior.",
          },
          {
            id: "prog201-m1-l2",
            title: "Trees, Binary Search Trees & Balanced Rotations",
            duration: "50 min",
            done: false,
            content: "Explore tree traversals (inorder, preorder, postorder) and self-balancing AVL/Red-Black trees.",
          },
        ],
      },
    ],
  },
  {
    courseCode: "CS-PROG-202",
    courseName: "Complete Python Programming & Software Architecture",
    department: "CSE",
    semester: 2,
    category: "Programming",
    domain: "Programming & CS",
    level: "Beginner",
    duration: "8 weeks",
    rating: 4.85,
    students: 18900,
    color: "#3B82F6",
    thumbnail: "🐍",
    certificate: true,
    status: "Active",
    description:
      "From zero to professional software engineering in Python: object-oriented design, decorators, generators, concurrency, unit testing with PyTest, and clean code principles.",
    skills: ["Python 3", "Object-Oriented Programming", "Design Patterns", "Clean Code", "PyTest"],
    outcomes: [
      "Write modular, scalable object-oriented software in Python",
      "Leverage advanced language features: context managers, decorators, and generators",
      "Write comprehensive unit test suites ensuring zero regression",
    ],
    modules: [
      {
        id: "prog202-mod-1",
        moduleNumber: 1,
        title: "Core Python & Object-Oriented Principles",
        summary: "Data structures, functions, classes, inheritance, polymorphism, and encapsulation.",
        lessons: [
          {
            id: "prog202-m1-l1",
            title: "OOP Principles: Classes, Inheritance & Encapsulation",
            duration: "45 min",
            done: false,
            content: "Design clean class hierarchies and understand Python's dunder methods and data model.",
          },
        ],
      },
    ],
  },
  {
    courseCode: "CS-PROG-203",
    courseName: "Database Management Systems & Advanced SQL",
    department: "IT",
    semester: 4,
    category: "Programming",
    domain: "Programming & CS",
    level: "Intermediate",
    duration: "6 weeks",
    rating: 4.8,
    students: 11400,
    color: "#EC4899",
    thumbnail: "🗄️",
    certificate: true,
    status: "Active",
    description:
      "Deep dive into relational database architecture, ACID transactions, normalization up to BCNF, B-Tree index optimization, query execution plans, and PostgreSQL.",
    skills: ["SQL", "PostgreSQL", "Database Design", "Indexing", "Query Optimization", "ACID Transactions"],
    outcomes: [
      "Design normalized relational schemas that prevent data anomalies",
      "Optimize complex queries using EXPLAIN ANALYZE and proper indexing",
      "Manage concurrent transactions with row-level locks and isolation levels",
    ],
    modules: [
      {
        id: "prog203-mod-1",
        moduleNumber: 1,
        title: "Relational Models & Schema Normalization",
        summary: "Entity-Relationship modeling, functional dependencies, 1NF, 2NF, 3NF, and BCNF.",
        lessons: [
          {
            id: "prog203-m1-l1",
            title: "Normalization & Schema Design Patterns",
            duration: "50 min",
            done: false,
            content: "Master lossless decomposition, dependency preservation, and enterprise database modeling.",
          },
        ],
      },
    ],
  },

  // --- ENGINEERING ---
  {
    courseCode: "ENG-ROB-301",
    courseName: "Robotics & Autonomous Systems Engineering",
    department: "ECE",
    semester: 6,
    category: "Engineering",
    domain: "Engineering",
    level: "Advanced",
    duration: "10 weeks",
    rating: 4.92,
    students: 7600,
    color: "#F59E0B",
    thumbnail: "🦾",
    certificate: true,
    status: "Active",
    description:
      "Design, model, and program autonomous robots. Covers forward/inverse kinematics, Robot Operating System (ROS 2), LiDAR mapping, SLAM, and PID trajectory control.",
    skills: ["Robotics", "ROS 2", "Kinematics", "Sensors", "Control Systems", "SLAM"],
    outcomes: [
      "Compute kinematic transformations and Denavit-Hartenberg parameters",
      "Implement localization and mapping (SLAM) algorithms using LiDAR and IMU sensors",
      "Control physical actuators with tuned PID feedback loops",
    ],
    modules: [
      {
        id: "eng301-mod-1",
        moduleNumber: 1,
        title: "Robotic Kinematics & Coordinate Frames",
        summary: "Homogeneous transformations, rotation matrices, forward kinematics, and workspace analysis.",
        lessons: [
          {
            id: "eng301-m1-l1",
            title: "Spatial Descriptions & Homogeneous Transforms",
            duration: "50 min",
            done: false,
            content: "Learn how robotic manipulators compute end-effector positions in 3D Cartesian coordinates.",
          },
        ],
      },
    ],
  },
  {
    courseCode: "ENG-IOT-302",
    courseName: "Embedded Systems & IoT with Arduino and ESP32",
    department: "EEE",
    semester: 4,
    category: "Engineering",
    domain: "Engineering",
    level: "Beginner",
    duration: "6 weeks",
    rating: 4.88,
    students: 13900,
    color: "#14B8A6",
    thumbnail: "⚡",
    certificate: true,
    status: "Active",
    description:
      "Hands-on embedded systems development: microcontrollers, GPIO, I2C/SPI communication, sensor interfacing, Wi-Fi networking with ESP32, and cloud IoT dashboards.",
    skills: ["Embedded C++", "Arduino", "ESP32", "IoT Protocols", "Sensors", "Microcontrollers"],
    outcomes: [
      "Program microcontrollers directly with low-level register and GPIO control",
      "Interface analog and digital sensors using I2C, SPI, and UART protocols",
      "Build connected IoT devices streaming telemetry over MQTT to cloud dashboards",
    ],
    modules: [
      {
        id: "eng302-mod-1",
        moduleNumber: 1,
        title: "Microcontroller Hardware & Digital I/O",
        summary: "Microcontroller pinouts, pulse-width modulation (PWM), analog-to-digital conversion, and timers.",
        lessons: [
          {
            id: "eng302-m1-l1",
            title: "Interfacing Sensors with Microcontrollers",
            duration: "40 min",
            done: false,
            content: "Read temperature, ultrasonic distance, and accelerometer sensors with debounced hardware interrupts.",
          },
        ],
      },
    ],
  },
  {
    courseCode: "ENG-CKT-303",
    courseName: "Digital Electronics & Circuit Analysis Fundamentals",
    department: "ECE",
    semester: 3,
    category: "Engineering",
    domain: "Engineering",
    level: "Intermediate",
    duration: "8 weeks",
    rating: 4.79,
    students: 8400,
    color: "#E11D48",
    thumbnail: "🔌",
    certificate: true,
    status: "Active",
    description:
      "Foundational hardware engineering: Ohm's and Kirchhoff's circuit laws, RLC transient response, semiconductor diodes, MOSFET transistors, logic gates, and Boolean algebra.",
    skills: ["Circuit Analysis", "Digital Logic", "Semiconductors", "Boolean Algebra", "Electronics"],
    outcomes: [
      "Analyze complex DC and AC circuits using nodal and mesh analysis",
      "Design combinational and sequential digital logic circuits",
      "Understand transistor switching circuits for modern digital computing",
    ],
    modules: [
      {
        id: "eng303-mod-1",
        moduleNumber: 1,
        title: "Circuit Theorems & Transient Analysis",
        summary: "Kirchhoff's laws, Thévenin and Norton equivalents, and operational amplifiers.",
        lessons: [
          {
            id: "eng303-m1-l1",
            title: "Nodal & Mesh Analysis in Linear Circuits",
            duration: "45 min",
            done: false,
            content: "Master matrix-based circuit solving methods for complex multi-source electric circuits.",
          },
        ],
      },
    ],
  },
];

const updateCourseDomains = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI && !process.env.MONGODB_URI.includes("localhost")
        ? process.env.MONGODB_URI
        : ATLAS_URI;

    console.log(`Connecting to database at ${mongoUri.split("@").pop()}...`);
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB successfully!");

    // 1. Find default faculty for flagship courses
    const faculty = await mongoose.connection
      .collection("users")
      .findOne({ role: "faculty" });
    const facultyId = faculty ? faculty._id : null;

    // 2. Upsert flagship courses to ensure top-quality academic offerings
    console.log("Checking & seeding flagship courses for underserved domains...");
    for (const c of FLAGSHIP_COURSES) {
      const exists = await Course.findOne({ courseCode: c.courseCode });
      if (!exists) {
        await Course.create({
          ...c,
          faculty: facultyId,
        });
        console.log(`+ Seeded flagship course: [${c.domain}] ${c.courseName}`);
      } else {
        await Course.updateOne(
          { courseCode: c.courseCode },
          { $set: { domain: c.domain, category: c.category, status: "Active" } }
        );
      }
    }

    // 3. Normalize all existing courses
    const courses = await Course.find(
      {},
      "courseName courseCode category department domain status"
    ).lean();

    console.log(`Total courses in database: ${courses.length}`);

    let updatedCount = 0;
    const domainCounts = {};
    const bulkOps = [];

    for (const c of courses) {
      const computedDomain = determineDomain(c.category, c.department, c.courseName);
      domainCounts[computedDomain] = (domainCounts[computedDomain] || 0) + 1;

      if (c.domain !== computedDomain) {
        bulkOps.push({
          updateOne: {
            filter: { _id: c._id },
            update: { $set: { domain: computedDomain } },
          },
        });
        updatedCount++;
      }
    }

    if (bulkOps.length > 0) {
      console.log(`Updating ${bulkOps.length} courses in batches...`);
      // Run bulkWrite in chunks of 500
      const chunkSize = 500;
      for (let i = 0; i < bulkOps.length; i += chunkSize) {
        const chunk = bulkOps.slice(i, i + chunkSize);
        await Course.bulkWrite(chunk);
      }
      console.log(`✅ Successfully updated ${updatedCount} courses with normalized domains.`);
    } else {
      console.log("All courses already have up-to-date domain values.");
    }

    // 4. Build/ensure database indexes
    console.log("Ensuring database indexes...");
    await Course.syncIndexes();
    console.log("✅ Synced database indexes (including domain index).");

    // 5. Print summary distribution
    console.log("\n--- Live Domain Distribution ---");
    for (const [dom, count] of Object.entries(domainCounts).sort((a, b) => b[1] - a[1])) {
      console.log(` ${dom.padEnd(22)} : ${count} courses`);
    }
    console.log("--------------------------------\n");

    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to update course domains:", err);
    process.exit(1);
  }
};

updateCourseDomains();

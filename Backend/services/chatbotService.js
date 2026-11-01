// ========================================
// STUDY BUDDY – CHATBOT SERVICE
// ========================================
// Two modes:
//   1. createTutorResponse  — course-aware (uses course material as context)
//   2. createGeneralResponse — general-purpose tutor (answers any question)

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "be", "can", "does", "explain", "for", "give",
  "how", "i", "is", "it", "me", "of", "on", "or", "please", "the", "this",
  "to", "what", "why", "with", "about", "does", "happen", "mean", "need",
  "course", "lesson", "concept", "simply", "simple", "detail", "detailed",
]);

const normalize = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

const meaningfulTerms = (value) =>
  normalize(value).filter((term) => term.length > 2 && !STOP_WORDS.has(term));

const lessonText = (module, lesson) =>
  [module?.title, lesson?.title, lesson?.description, lesson?.content]
    .filter(Boolean)
    .join(" ");

const buildCourseText = (course) => [
  course?.courseName,
  course?.courseCode,
  course?.description,
  course?.category,
  ...(course?.skills || []),
  ...(course?.outcomes || []),
  ...(course?.modules || []).flatMap((module) => [
    module.title,
    ...(module.lessons || []).flatMap((lesson) => [
      lesson.title,
      lesson.description,
      lesson.content,
    ]),
  ]),
].filter(Boolean).join(" ");

const buildMaterial = (module, lesson) => {
  const parts = [
    lesson?.description,
    lesson?.content,
  ];
  return parts.filter(Boolean).join("\n");
};

const scoreLesson = (module, lesson, terms) => {
  const tokens = normalize(lessonText(module, lesson));
  return terms.reduce((score, term) => {
    const matches = tokens.filter((token) => token === term).length;
    return score + matches;
  }, 0);
};

const findRelevantLesson = (course, question, history = []) => {
  const terms = meaningfulTerms(`${question} ${recentConversation(history)}`);
  let best = null;
  let bestScore = 0;

  for (const module of course?.modules || []) {
    for (const lesson of module.lessons || []) {
      const score = scoreLesson(module, lesson, terms);

      if (score > bestScore) {
        best = { module, lesson };
        bestScore = score;
      }
    }
  }

  return best;
};

const findCurrentLesson = (course, courseContext) =>
  (course?.modules || [])
    .flatMap((module) => (module.lessons || []).map((lesson) => ({ module, lesson })))
    .find(({ lesson }) => lesson.id === courseContext?.lessonId);

const recentConversation = (history) =>
  (Array.isArray(history) ? history : [])
    .filter((message) => message && (message.role === "user" || message.role === "assistant"))
    .slice(-8)
    .map((message) => `${message.role}: ${String(message.content || "").slice(0, 800)}`)
    .join("\n");

const isAmbiguous = (question, history) => {
  const terms = meaningfulTerms(question);
  const hasReference = /\b(this|that|it|they|these|those)\b/i.test(question);
  const hasPriorTopic = meaningfulTerms(recentConversation(history)).length > 0;

  return (
    (terms.length === 0 && !hasPriorTopic) ||
    (hasReference && terms.length < 2 && !hasPriorTopic)
  );
};

const questionMatchesCourse = (question, course) => {
  const terms = meaningfulTerms(question);
  if (!terms.length) return false;
  const courseWords = normalize(buildCourseText(course));
  return terms.some((term) => courseWords.includes(term));
};

const examMarkCount = (question) => {
  const match = String(question).match(/\b(2|5|8|15)\s*marks?\b/i);
  return match ? Number(match[1]) : null;
};

// ==============================
// Course-Aware Answer Builder
// ==============================
const answerFromMaterial = (question, material, context) => {
  const markCount = examMarkCount(question);
  const simple = /\b(simple|simply|beginner|easy|don't understand|do not understand)\b/i.test(question);
  const detailed = /\b(detail|detailed|step by step|steps)\b/i.test(question);
  const example = /\b(example|illustrate|instance)\b/i.test(question);
  const sentences = material
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const lead = sentences.slice(0, detailed || markCount >= 8 ? 4 : 2);
  const topic = context.lesson?.title || context.module?.title || context.course.courseName;

  if (example) {
    return `**Example**\nUse the examples and practice described in **${topic}** as the course-specific starting point. The current lesson material does not include a concrete worked example for this question, so I do not want to invent one.`;
  }

  const prefix = simple ? `**Simple Explanation**\n` : "";
  const body = lead.join(" ") || "The available course material does not define this clearly.";
  const suffix = markCount
    ? `\n\n**Exam format (${markCount} marks)**\n${markCount <= 2 ? "State the definition and one key point." : markCount <= 5 ? "Give the definition, explain the idea, and include a relevant example." : "Use a structured answer with the definition, reasoning, key points, and an example."}`
    : "";

  return `${prefix}${body}${suffix}`;
};

// ==============================
// General-Purpose Answer Builder
// ==============================
// Produces intelligent responses to any student question without
// requiring course material. Detects question intent and formats
// the response appropriately.

const SUBJECT_KNOWLEDGE = {
  // Data Structures
  recursion: "**Recursion** is a technique where a function calls itself to solve smaller sub-problems of the same kind. Every recursive function needs:\n\n1. **Base case** — the condition that stops the recursion\n2. **Recursive case** — the function calling itself with a simpler input\n\n**Example (factorial in Python):**\n```python\ndef factorial(n):\n    if n <= 1:        # base case\n        return 1\n    return n * factorial(n - 1)  # recursive case\n```\n\n`factorial(4)` → 4 × 3 × 2 × 1 = **24**\n\nRecursion is used in tree traversals, divide-and-conquer algorithms, backtracking, and many more.",
  "binary search": "**Binary Search** works by repeatedly dividing a **sorted** array in half.\n\n**Why sorted?** It compares the target with the middle element. If the target is smaller, it discards the right half; if larger, it discards the left half. This only works if elements are in order.\n\n**Steps:**\n1. Set `low = 0`, `high = n-1`\n2. Find `mid = (low + high) / 2`\n3. If `arr[mid] == target` → found\n4. If `arr[mid] < target` → search right half (`low = mid + 1`)\n5. If `arr[mid] > target` → search left half (`high = mid - 1`)\n6. Repeat until `low > high`\n\n**Time complexity:** O(log n) — much faster than linear search O(n).",
  stack: "A **stack** is a linear data structure that follows **LIFO** (Last In, First Out).\n\n**Operations:**\n- `push(x)` — add element to the top\n- `pop()` — remove element from the top\n- `peek()/top()` — view the top element without removing it\n- `isEmpty()` — check if the stack is empty\n\n**Applications:** function call stack, undo/redo, expression evaluation, backtracking, browser history.",
  queue: "A **queue** is a linear data structure that follows **FIFO** (First In, First Out).\n\n**Operations:**\n- `enqueue(x)` — add element at the rear\n- `dequeue()` — remove element from the front\n- `front()/peek()` — view the front element\n- `isEmpty()` — check if queue is empty\n\n**Types:** Simple queue, Circular queue, Priority queue, Deque (double-ended)\n\n**Applications:** CPU scheduling, BFS, printer queue, message queues.",
  "stack and queue": "| Feature | Stack | Queue |\n|---------|-------|-------|\n| Order | LIFO (Last In, First Out) | FIFO (First In, First Out) |\n| Insert | `push()` at top | `enqueue()` at rear |\n| Remove | `pop()` from top | `dequeue()` from front |\n| Example | Undo button, call stack | Printer queue, BFS |\n| Access | Only the top element | Only the front element |",
  pointer: "A **pointer** is a variable that stores the **memory address** of another variable.\n\n**In C/C++:**\n```cpp\nint x = 10;\nint *ptr = &x;  // ptr stores the address of x\ncout << *ptr;   // dereferencing — prints 10\n```\n\n**Why use pointers?**\n- Dynamic memory allocation\n- Efficient array/string manipulation\n- Pass-by-reference in functions\n- Data structures (linked lists, trees)",
  "linked list": "A **linked list** is a linear data structure where elements (nodes) are not stored contiguously. Each node contains:\n- **Data** — the value\n- **Next** — pointer to the next node\n\n**Types:**\n1. Singly linked list → each node points to the next\n2. Doubly linked list → each node points to both next and previous\n3. Circular linked list → last node points back to the first\n\n**vs Array:** Dynamic size, efficient insertion/deletion, but no random access.",
  // DBMS
  normalization: "**Normalization** is the process of organizing a database to reduce **redundancy** and **dependency**.\n\n**Normal Forms:**\n1. **1NF** — Eliminate repeating groups; each cell has a single value\n2. **2NF** — 1NF + remove partial dependencies (non-key columns depend on the full primary key)\n3. **3NF** — 2NF + remove transitive dependencies (non-key columns depend only on the primary key)\n4. **BCNF** — Every determinant is a candidate key\n\n**Why normalize?**\n- Reduces data redundancy\n- Prevents update, insert, and delete anomalies\n- Improves data integrity",
  deadlock: "**Deadlock** occurs when two or more processes are waiting for each other to release resources, creating a circular wait.\n\n**Four necessary conditions (Coffman):**\n1. **Mutual Exclusion** — at least one resource is non-sharable\n2. **Hold and Wait** — a process holds resources while waiting for others\n3. **No Preemption** — resources cannot be forcibly taken\n4. **Circular Wait** — a cycle exists in the resource-allocation graph\n\n**Handling:**\n- Prevention — break one of the four conditions\n- Avoidance — Banker's Algorithm\n- Detection — resource-allocation graph\n- Recovery — terminate or rollback processes",
  // Networks
  "tcp": "**TCP (Transmission Control Protocol)** is a connection-oriented transport layer protocol.\n\n**Three-Way Handshake:**\n1. **SYN** — Client sends a synchronization request\n2. **SYN-ACK** — Server acknowledges and sends its own SYN\n3. **ACK** — Client acknowledges the server's SYN\n\nConnection is now established.\n\n**Key features:** reliable delivery, in-order packets, flow control, congestion control, error detection.",
  "three-way handshake": "**TCP Three-Way Handshake** establishes a reliable connection:\n\n```\nClient              Server\n  |--- SYN ------------>|\n  |<--- SYN + ACK ------|\n  |--- ACK ------------>|\n  |   Connection Open   |\n```\n\n1. **SYN** — Client initiates, sends sequence number\n2. **SYN-ACK** — Server acknowledges, sends its own sequence number\n3. **ACK** — Client confirms, connection is established\n\nThis ensures both sides are ready before data transfer begins.",
  // OOP
  polymorphism: "**Polymorphism** means \"many forms\" — the ability of an object to take different forms.\n\n**Two types in Java:**\n\n1. **Compile-time (method overloading)**\n```java\nint add(int a, int b) { return a + b; }\ndouble add(double a, double b) { return a + b; }\n```\n\n2. **Runtime (method overriding)**\n```java\nclass Animal {\n    void sound() { System.out.println(\"Some sound\"); }\n}\nclass Dog extends Animal {\n    void sound() { System.out.println(\"Bark\"); }\n}\n```\n\n**Benefits:** code reusability, flexibility, cleaner design.",
  photosynthesis: "**Photosynthesis** is the process by which green plants convert sunlight into food.\n\n**Equation:**\n6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂\n\n**Two stages:**\n1. **Light reactions** (thylakoid) — capture light energy, produce ATP and NADPH\n2. **Calvin cycle** (stroma) — use ATP and NADPH to fix CO₂ into glucose\n\n**Requirements:** sunlight, water, carbon dioxide, chlorophyll",
};

// Detect question intent
function detectIntent(question) {
  const q = question.toLowerCase();

  if (/\b(debug|error|fix|bug|wrong|doesn.t work|not working|issue)\b/i.test(q)) return "debug";
  if (/\b(write|create|build|make|generate)\b.*\b(program|code|function|script|class)\b/i.test(q)) return "code";
  if (/\b(code|program|function|script)\b.*\b(write|create|build|make|generate)\b/i.test(q)) return "code";
  if (/\b(solve|calculate|evaluate|find the value|simplify)\b/i.test(q)) return "math";
  if (/\b(compare|difference|vs|versus|distinguish)\b/i.test(q)) return "compare";
  if (/\b(2|5|8|15)\s*marks?\b/i.test(q)) return "exam";
  if (/\b(like i.?m \d|like a (kid|child|beginner|12|10|5))\b/i.test(q)) return "simplify";
  if (/\b(summarize|summary|tldr|short|brief)\b/i.test(q)) return "summarize";
  if (/\b(step.by.step|steps|procedure|algorithm)\b/i.test(q)) return "stepbystep";
  if (/\b(advantage|disadvantage|pros|cons|benefit|drawback)\b/i.test(q)) return "proscons";

  return "explain";
}

// Find the best matching knowledge entry
function findKnowledgeMatch(question) {
  const q = question.toLowerCase();
  let bestKey = null;
  let bestScore = 0;

  for (const key of Object.keys(SUBJECT_KNOWLEDGE)) {
    const keyTerms = key.split(/\s+/);
    let score = 0;

    for (const term of keyTerms) {
      if (q.includes(term)) score += term.length;
    }

    if (score > bestScore) {
      bestScore = score;
      bestKey = key;
    }
  }

  return bestScore >= 3 ? bestKey : null;
}

// Format exam-style response
function formatExamAnswer(question, baseAnswer) {
  const marks = examMarkCount(question);
  if (!marks) return baseAnswer;

  if (marks <= 2) {
    // Extract first 2 sentences
    const sentences = baseAnswer.split(/(?<=[.!?])\s+/).filter(Boolean);
    const short = sentences.slice(0, 2).join(" ");
    return `${short}\n\n*(${marks}-mark answer: state the definition and one key point)*`;
  }
  if (marks <= 5) {
    return `${baseAnswer}\n\n*(${marks}-mark answer: include definition, explanation, and one example)*`;
  }
  return `${baseAnswer}\n\n*(${marks}-mark answer: use a structured format with definition, reasoning, detailed points, diagram if applicable, and examples)*`;
}

// Build a general response
function createGeneralResponse({ question, history }) {
  const q = question.trim();
  const intent = detectIntent(q);
  const recentCtx = recentConversation(history);

  // Handle ambiguous questions with conversation context
  if (isAmbiguous(q, history)) {
    if (recentCtx) {
      return "Could you clarify what you're referring to? You can send the topic name, the specific question, or paste the code you need help with.";
    }
    return "Could you tell me what you'd like help with? You can ask about any topic, send a question, or paste code you need help with.";
  }

  // Check knowledge base
  const knowledgeKey = findKnowledgeMatch(q);
  if (knowledgeKey) {
    let answer = SUBJECT_KNOWLEDGE[knowledgeKey];

    if (intent === "simplify") {
      // Simplify: take first paragraph only
      const first = answer.split("\n\n")[0];
      return `**In simple terms:**\n${first.replace(/\*\*/g, "")}`;
    }

    if (intent === "exam") {
      return formatExamAnswer(q, answer);
    }

    return answer;
  }

  // Intent-based responses for questions not in the knowledge base
  if (intent === "debug") {
    return "Please share the code you need help debugging. Include:\n\n1. The code\n2. The error message (if any)\n3. What you expected it to do\n\nI'll identify the issue and provide the fix.";
  }

  if (intent === "code") {
    const lang = detectLanguage(q);
    return `I can help you write that${lang ? ` in **${lang}**` : ""}. Could you describe what the program should do in more detail? For example:\n\n- What input does it take?\n- What output should it produce?\n- Any specific requirements?`;
  }

  if (intent === "math") {
    // Simple linear equation solver
    const linearMatch = q.match(/(\d+)\s*x\s*([+-])\s*(\d+)\s*=\s*(\d+)/i);
    if (linearMatch) {
      const a = parseInt(linearMatch[1]);
      const op = linearMatch[2];
      const b = parseInt(linearMatch[3]);
      const c = parseInt(linearMatch[4]);
      const rhs = op === "+" ? c - b : c + b;
      const x = rhs / a;
      return `**Solving: ${a}x ${op} ${b} = ${c}**\n\nStep 1: ${a}x = ${c} ${op === "+" ? "-" : "+"} ${b} = ${rhs}\nStep 2: x = ${rhs} / ${a} = **${x}**`;
    }
    return "Please share the complete mathematical expression or equation, and I'll solve it step by step.";
  }

  // Follow-up questions — use conversation context
  if (/\b(its|their|this|that|it)\b/i.test(q) && recentCtx) {
    // Try to find topic from recent context
    const recentTerms = meaningfulTerms(recentCtx);
    const contextKey = findKnowledgeMatchFromTerms(recentTerms);
    if (contextKey && SUBJECT_KNOWLEDGE[contextKey]) {
      const baseAnswer = SUBJECT_KNOWLEDGE[contextKey];
      if (/\b(advantage|disadvantage|pros|cons|benefit)\b/i.test(q)) {
        return `Regarding **${contextKey}**:\n\nThe main advantages come from the concepts described above. Could you specify which aspect you'd like me to elaborate on?`;
      }
      return `Continuing on **${contextKey}**:\n\n${baseAnswer.split("\n\n").slice(1).join("\n\n") || baseAnswer}`;
    }
  }

  // Generic helpful response for unrecognized topics
  const terms = meaningfulTerms(q);
  const topic = terms.slice(0, 3).join(" ");

  if (topic) {
    return `**${capitalizeWords(topic)}**\n\nI understand you're asking about **${topic}**. While I don't have pre-loaded material on this specific topic, I can help you if you:\n\n1. Ask a more specific question about it\n2. Share code or text you need help with\n3. Tell me what aspect you'd like explained\n\nI'm here to help with any academic subject, programming question, or concept explanation.`;
  }

  return "I'm Buddy, your personal AI study companion — I can help with any subject, programming question, or concept. Just type your question!";
}

function findKnowledgeMatchFromTerms(terms) {
  for (const key of Object.keys(SUBJECT_KNOWLEDGE)) {
    const keyTerms = key.split(/\s+/);
    if (keyTerms.some((kt) => terms.includes(kt))) return key;
  }
  return null;
}

function detectLanguage(question) {
  const q = question.toLowerCase();
  if (/\b(c\+\+|cpp)\b/.test(q)) return "C++";
  if (/\bjava\b/.test(q) && !/\bjavascript\b/.test(q)) return "Java";
  if (/\bpython\b/.test(q)) return "Python";
  if (/\bjavascript\b|\bjs\b/.test(q)) return "JavaScript";
  if (/\b(c programming|c language|\bc\b program)\b/.test(q)) return "C";
  if (/\bsql\b/.test(q)) return "SQL";
  if (/\bhtml\b/.test(q)) return "HTML";
  if (/\bcss\b/.test(q)) return "CSS";
  return null;
}

function capitalizeWords(str) {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

// ==============================
// Course-Aware Response (existing, improved)
// ==============================
const createTutorResponse = ({ course, question, history, courseContext }) => {
  const requestedLesson = findCurrentLesson(course, courseContext);
  const relevant = findRelevantLesson(course, question, history) || requestedLesson;
  const questionHasCourseSignal = questionMatchesCourse(question, course);
  const isFollowUp = meaningfulTerms(question).length === 0 ||
    /\b(this|that|it|they|these|those|why|how|what about)\b/i.test(question);
  const usableLesson = relevant && (
    questionHasCourseSignal ||
    isFollowUp
  ) ? relevant : null;
  const material = buildMaterial(usableLesson?.module, usableLesson?.lesson);

  // If the question is clearly outside the course, answer it normally
  // instead of refusing — use general mode as fallback
  if (!usableLesson || !material.trim()) {
    // Try the general response engine first
    const generalAnswer = createGeneralResponse({ question, history });
    const courseName = course?.courseName || "your course";

    // If we got a good general answer, return it with a note
    if (generalAnswer && !generalAnswer.includes("I don't have pre-loaded material")) {
      return generalAnswer;
    }

    // Fallback
    return `I couldn't find specific material about this in **${courseName}**, but here's what I know:\n\n${generalAnswer}`;
  }

  if (isAmbiguous(question, history)) {
    const options = (course.modules || [])
      .slice(0, 3)
      .map((module) => module.title)
      .filter(Boolean)
      .join(", ");
    return options
      ? `Which concept are you referring to — ${options}? You can send the topic name, sentence, or screenshot.`
      : "Which part would you like me to explain? Send the topic name, sentence, or screenshot.";
  }

  return answerFromMaterial(question, material, {
    course,
    module: usableLesson?.module,
    lesson: usableLesson?.lesson,
  });
};

module.exports = {
  createTutorResponse,
  createGeneralResponse,
  findRelevantLesson,
  recentConversation,
};

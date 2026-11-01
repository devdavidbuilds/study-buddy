// ========================================
// STUDY BUDDY – MOCK DATA
// ========================================

export const currentUser = {
  id: 1,
  name: 'David Chen',
  email: 'david.chen@university.edu',
  avatar: null,
  role: 'student',
  streak: 12,
  xp: 4850,
  level: 15,
  joinedDate: '2025-09-01',
  bio: 'Computer Science Major • Class of 2027',
  university: 'Stanford University',
};

export const courses = [
  { id: 1, title: 'Data Structures & Algorithms', instructor: 'Dr. Sarah Mitchell', instructorTitle: 'Senior Instructor, Computer Science', progress: 72, totalLessons: 48, completedLessons: 35, category: 'Computer Science', color: '#E75480', thumbnail: '🧮', rating: 4.8, students: 1243, reviewsCount: 312, duration: '16 weeks', nextLesson: 'Binary Search Trees', bookmarked: true, level: 'Advanced', certificate: true, skills: ['Big-O Analysis', 'Recursion', 'Tree Traversal'], description: 'Master the core data structures and algorithms that power technical interviews and efficient software — from arrays and linked lists to trees, graphs, and sorting.', outcomes: ['Analyze time and space complexity with Big-O notation', 'Implement trees, graphs, and hash maps from scratch', 'Solve classic interview-style algorithm problems', 'Choose the right data structure for real-world problems'] },
  { id: 2, title: 'Machine Learning Fundamentals', instructor: 'Prof. James Liu', instructorTitle: 'Lead Instructor, AI & ML', progress: 45, totalLessons: 36, completedLessons: 16, category: 'AI & ML', color: '#C9B6E4', thumbnail: '🤖', rating: 4.9, students: 2105, reviewsCount: 498, duration: '12 weeks', nextLesson: 'Neural Networks Intro', bookmarked: true, level: 'Intermediate', certificate: true, skills: ['Python', 'NumPy', 'Model Training'], description: 'A hands-on introduction to machine learning — build, train, and evaluate models while learning the math and intuition behind them.', outcomes: ['Understand supervised vs. unsupervised learning', 'Train regression and classification models', 'Build a basic neural network from scratch', 'Evaluate models with real-world metrics'] },
  { id: 3, title: 'Web Development with React', instructor: 'Ms. Elena Rodriguez', instructorTitle: 'Senior Instructor, Web Development', progress: 88, totalLessons: 32, completedLessons: 28, category: 'Web Dev', color: '#F4B3CE', thumbnail: '⚛️', rating: 4.7, students: 3456, reviewsCount: 721, duration: '10 weeks', nextLesson: 'State Management', bookmarked: false, level: 'Beginner', certificate: true, skills: ['JSX', 'Hooks', 'Component Design'], description: 'Learn to build modern, interactive web applications with React — components, hooks, routing, and state management, all from first principles.', outcomes: ['Build reusable components with JSX', 'Manage state and side effects with hooks', 'Handle client-side routing and navigation', 'Ship a production-ready React project'] },
  { id: 4, title: 'Database Systems', instructor: 'Dr. Alan Park', instructorTitle: 'Associate Professor, Databases', progress: 30, totalLessons: 28, completedLessons: 8, category: 'Computer Science', color: '#5BB974', thumbnail: '🗄️', rating: 4.5, students: 890, reviewsCount: 156, duration: '14 weeks', nextLesson: 'SQL Joins', bookmarked: false, level: 'Intermediate', certificate: true, skills: ['SQL', 'Normalization', 'Indexing'], description: 'Understand how databases work under the hood, and get fluent in designing schemas and writing efficient SQL queries.', outcomes: ['Design normalized relational schemas', 'Write complex SQL joins and subqueries', 'Understand indexing and query performance', 'Model real-world data with ER diagrams'] },
  { id: 5, title: 'Computer Networks', instructor: 'Prof. Maria Santos', instructorTitle: 'Instructor, Networking & Security', progress: 15, totalLessons: 40, completedLessons: 6, category: 'Computer Science', color: '#F0A94E', thumbnail: '🌐', rating: 4.6, students: 1567, reviewsCount: 203, duration: '14 weeks', nextLesson: 'TCP/IP Protocol', bookmarked: true, level: 'Intermediate', certificate: false, skills: ['TCP/IP', 'Routing', 'Network Security'], description: 'Explore how data travels across networks — from physical cabling to the protocols that power the internet.', outcomes: ['Explain the OSI and TCP/IP models', 'Trace how packets are routed across networks', 'Identify common network security threats', 'Set up and troubleshoot basic network configs'] },
  { id: 6, title: 'Operating Systems', instructor: 'Dr. Kevin Brown', instructorTitle: 'Senior Instructor, Systems', progress: 60, totalLessons: 36, completedLessons: 22, category: 'Computer Science', color: '#E2685E', thumbnail: '💻', rating: 4.4, students: 1120, reviewsCount: 187, duration: '16 weeks', nextLesson: 'Process Scheduling', bookmarked: false, level: 'Advanced', certificate: true, skills: ['Process Scheduling', 'Memory Management', 'Concurrency'], description: 'Go under the hood of modern operating systems — processes, memory, file systems, and the scheduling that keeps it all running.', outcomes: ['Explain process scheduling algorithms', 'Reason about memory management and paging', 'Understand deadlocks and concurrency control', 'Navigate file systems and I/O management'] },
  { id: 7, title: 'Python for Data Science', instructor: 'Dr. Priya Sharma', instructorTitle: 'Lead Instructor, Data Science', progress: 92, totalLessons: 24, completedLessons: 22, category: 'Data Science', color: '#6FA8DC', thumbnail: '🐍', rating: 4.8, students: 4200, reviewsCount: 892, duration: '8 weeks', nextLesson: 'Data Visualization', bookmarked: true, level: 'Beginner', certificate: true, skills: ['Pandas', 'Data Visualization', 'NumPy'], description: 'Get productive with Python for data analysis — cleaning, transforming, and visualizing real datasets with pandas and friends.', outcomes: ['Clean and transform data with pandas', 'Perform numerical computing with NumPy', 'Create clear, compelling data visualizations', 'Analyze a real-world dataset end to end'] },
  { id: 8, title: 'Discrete Mathematics', instructor: 'Prof. Thomas Wright', instructorTitle: 'Associate Professor, Mathematics', progress: 55, totalLessons: 30, completedLessons: 17, category: 'Mathematics', color: '#E8955A', thumbnail: '📐', rating: 4.3, students: 780, reviewsCount: 98, duration: '12 weeks', nextLesson: 'Graph Theory', bookmarked: false, level: 'Intermediate', certificate: false, skills: ['Graph Theory', 'Logic', 'Combinatorics'], description: 'Build the mathematical foundation behind computer science — logic, proofs, graph theory, and combinatorics.', outcomes: ['Construct and evaluate formal logical proofs', 'Apply graph theory to real problems', 'Solve counting and combinatorics problems', 'Reason formally about algorithms and sets'] },
];

export const categories = ['All', 'Computer Science', 'AI & ML', 'Web Dev', 'Data Science', 'Mathematics'];

export const schedule = [
  { id: 1, title: 'DSA Lecture', time: '09:00 AM', duration: '1h 30m', type: 'lecture', course: 'Data Structures & Algorithms', color: '#E75480' },
  { id: 2, title: 'ML Lab Session', time: '11:00 AM', duration: '2h', type: 'lab', course: 'Machine Learning', color: '#C9B6E4' },
  { id: 3, title: 'React Project Review', time: '02:00 PM', duration: '45m', type: 'review', course: 'Web Development', color: '#F4B3CE' },
  { id: 4, title: 'Database Quiz', time: '04:00 PM', duration: '30m', type: 'quiz', course: 'Database Systems', color: '#5BB974' },
];

export const assignments = [
  { id: 1, title: 'Binary Tree Implementation', course: 'Data Structures & Algorithms', dueDate: '2026-07-28', status: 'pending', priority: 'high', progress: 60 },
  { id: 2, title: 'Linear Regression Model', course: 'Machine Learning', dueDate: '2026-07-30', status: 'pending', priority: 'medium', progress: 25 },
  { id: 3, title: 'Portfolio Website', course: 'Web Development', dueDate: '2026-08-02', status: 'in-progress', priority: 'low', progress: 80 },
  { id: 4, title: 'ER Diagram Design', course: 'Database Systems', dueDate: '2026-08-05', status: 'pending', priority: 'medium', progress: 0 },
  { id: 5, title: 'Network Packet Analysis', course: 'Computer Networks', dueDate: '2026-07-27', status: 'submitted', priority: 'high', progress: 100 },
];

export const recentNotes = [
  { id: 1, title: 'BST Traversal Methods', course: 'DSA', updatedAt: '2 hours ago', color: '#E75480', preview: 'Inorder, Preorder, Postorder traversal implementations...' },
  { id: 2, title: 'Gradient Descent Notes', course: 'ML', updatedAt: '5 hours ago', color: '#C9B6E4', preview: 'Learning rate optimization and batch processing...' },
  { id: 3, title: 'React Hooks Cheatsheet', course: 'Web Dev', updatedAt: '1 day ago', color: '#F4B3CE', preview: 'useState, useEffect, useContext, useReducer...' },
  { id: 4, title: 'SQL Query Optimization', course: 'DB', updatedAt: '2 days ago', color: '#5BB974', preview: 'Index strategies and query execution plans...' },
];

export const weeklyProgress = [
  { day: 'Mon', hours: 4.5, problems: 8 },
  { day: 'Tue', hours: 3.2, problems: 5 },
  { day: 'Wed', hours: 5.1, problems: 12 },
  { day: 'Thu', hours: 2.8, problems: 4 },
  { day: 'Fri', hours: 6.0, problems: 15 },
  { day: 'Sat', hours: 4.0, problems: 9 },
  { day: 'Sun', hours: 3.5, problems: 7 },
];

export const monthlyActivity = [
  { week: 'W1', study: 22, coding: 15, quizzes: 8 },
  { week: 'W2', study: 28, coding: 20, quizzes: 12 },
  { week: 'W3', study: 18, coding: 25, quizzes: 6 },
  { week: 'W4', study: 32, coding: 18, quizzes: 14 },
];

export const codingActivity = Array.from({ length: 52 * 7 }, (_, i) => ({
  date: new Date(2026, 0, 1 + i).toISOString().split('T')[0],
  count: Math.random() > 0.3 ? Math.floor(Math.random() * 8) : 0,
}));

export const recentActivity = [
  { id: 1, action: 'Completed lesson', detail: 'Binary Search Trees', course: 'DSA', time: '30 min ago', icon: '✅' },
  { id: 2, action: 'Submitted assignment', detail: 'Network Packet Analysis', course: 'Networks', time: '2 hours ago', icon: '📝' },
  { id: 3, action: 'Earned badge', detail: 'Code Warrior – 50 problems solved', course: null, time: '5 hours ago', icon: '🏆' },
  { id: 4, action: 'Started quiz', detail: 'SQL Fundamentals', course: 'Database', time: '1 day ago', icon: '📋' },
  { id: 5, action: 'New note created', detail: 'React Hooks Cheatsheet', course: 'Web Dev', time: '1 day ago', icon: '📒' },
];

export const learningGoals = [
  { id: 1, title: 'Complete DSA Course', progress: 72, target: 100 },
  { id: 2, title: 'Solve 100 LeetCode Problems', progress: 67, target: 100 },
  { id: 3, title: 'Build 3 Full-Stack Projects', progress: 33, target: 100 },
  { id: 4, title: 'Read 5 Research Papers', progress: 40, target: 100 },
];

export const quizzes = [
  { id: 1, title: 'Array & String Manipulation', course: 'DSA', questions: 20, duration: '30 min', difficulty: 'Medium', score: 85, status: 'completed', date: '2026-07-20' },
  { id: 2, title: 'SQL Fundamentals', course: 'Database Systems', questions: 15, duration: '20 min', difficulty: 'Easy', score: null, status: 'upcoming', date: '2026-07-28' },
  { id: 3, title: 'Neural Networks Basics', course: 'Machine Learning', questions: 25, duration: '45 min', difficulty: 'Hard', score: 72, status: 'completed', date: '2026-07-18' },
  { id: 4, title: 'React Component Lifecycle', course: 'Web Development', questions: 18, duration: '25 min', difficulty: 'Medium', score: 92, status: 'completed', date: '2026-07-15' },
  { id: 5, title: 'OS Process Management', course: 'Operating Systems', questions: 20, duration: '30 min', difficulty: 'Hard', score: null, status: 'upcoming', date: '2026-08-01' },
  { id: 6, title: 'Graph Algorithms', course: 'DSA', questions: 15, duration: '25 min', difficulty: 'Hard', score: null, status: 'available', date: null },
];

export const projects = [
  { id: 1, title: 'E-Commerce Platform', description: 'Full-stack e-commerce with React, Node.js & MongoDB', status: 'in-progress', progress: 65, tech: ['React', 'Node.js', 'MongoDB'], team: 3, dueDate: '2026-08-15', color: '#E75480' },
  { id: 2, title: 'ML Image Classifier', description: 'CNN-based image classification using TensorFlow', status: 'completed', progress: 100, tech: ['Python', 'TensorFlow', 'Flask'], team: 2, dueDate: '2026-07-10', color: '#5BB974' },
  { id: 3, title: 'Chat Application', description: 'Real-time chat app with WebSocket support', status: 'in-progress', progress: 40, tech: ['React', 'Socket.io', 'Express'], team: 4, dueDate: '2026-08-20', color: '#C9B6E4' },
  { id: 4, title: 'Task Management API', description: 'RESTful API with authentication and CRUD operations', status: 'review', progress: 90, tech: ['Node.js', 'PostgreSQL', 'JWT'], team: 1, dueDate: '2026-07-30', color: '#F0A94E' },
];

export const achievements = [
  { id: 1, title: 'Code Warrior', description: 'Solved 50 coding problems', icon: '⚔️', earned: true, date: '2026-07-20' },
  { id: 2, title: 'Speed Learner', description: 'Completed 5 courses', icon: '🚀', earned: false, progress: 60 },
  { id: 3, title: 'Night Owl', description: 'Studied past midnight 10 times', icon: '🦉', earned: true, date: '2026-07-15' },
  { id: 4, title: 'Perfect Score', description: 'Got 100% on any quiz', icon: '💯', earned: true, date: '2026-06-28' },
  { id: 5, title: 'Streak Master', description: 'Maintained a 30-day streak', icon: '🔥', earned: false, progress: 40 },
  { id: 6, title: 'Team Player', description: 'Collaborated on 5 projects', icon: '🤝', earned: false, progress: 80 },
  { id: 7, title: 'Bug Hunter', description: 'Fixed 20 bugs in projects', icon: '🐛', earned: true, date: '2026-07-05' },
  { id: 8, title: 'Knowledge Seeker', description: 'Read 10 research papers', icon: '📚', earned: false, progress: 20 },
];

export const notifications = [
  { id: 1, title: 'Assignment Due Tomorrow', message: 'Binary Tree Implementation is due on July 28', type: 'warning', time: '10 min ago', read: false, priority: 'urgent' },
  { id: 2, title: 'New Course Available', message: 'Cloud Computing Essentials has been added', type: 'info', time: '1 hour ago', read: false, priority: 'normal' },
  { id: 3, title: 'Quiz Results Published', message: 'Your Neural Networks quiz score: 72%', type: 'success', time: '3 hours ago', read: false, priority: 'normal' },
  { id: 4, title: 'Project Review Scheduled', message: 'React Project review at 2:00 PM today', type: 'info', time: '5 hours ago', read: true, priority: 'normal' },
  { id: 5, title: 'Achievement Unlocked!', message: 'You earned the Code Warrior badge!', type: 'success', time: '1 day ago', read: true, priority: 'low' },
  { id: 6, title: 'System Maintenance', message: 'Platform will be down for maintenance on Aug 1', type: 'warning', time: '2 days ago', read: true, priority: 'low' },
];

export const codeLabFiles = [
  { id: 1, name: 'main.py', language: 'python', icon: '🐍', content: `# Two Sum Problem\n# Given an array of integers and a target,\n# return indices of two numbers that add up to target.\n\ndef two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []\n\n# Test\nnums = [2, 7, 11, 15]\ntarget = 9\nprint(f"Input: nums={nums}, target={target}")\nprint(f"Output: {two_sum(nums, target)}")` },
  { id: 2, name: 'solution.js', language: 'javascript', icon: '📜', content: `// Binary Search Implementation\nfunction binarySearch(arr, target) {\n  let left = 0;\n  let right = arr.length - 1;\n\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}\n\nconst arr = [1, 3, 5, 7, 9, 11, 13];\nconsole.log(binarySearch(arr, 7)); // Output: 3` },
  { id: 3, name: 'styles.css', language: 'css', icon: '🎨', content: `/* Modern Card Component */\n.card {\n  background: rgba(23, 17, 38, 0.8);\n  border: 1px solid rgba(255,255,255,0.08);\n  border-radius: 24px;\n  padding: 2rem;\n  backdrop-filter: blur(20px);\n  transition: transform 0.3s ease;\n}\n\n.card:hover {\n  transform: translateY(-4px);\n  border-color: rgba(157, 92, 255, 0.4);\n}` },
];

export const codeChallenge = {
  title: 'Two Sum',
  difficulty: 'Easy',
  description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
  examples: [
    { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
    { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].' },
  ],
  hints: ['Try using a hash map to store values you\'ve seen.', 'For each number, check if target - number exists in the map.'],
  constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', 'Only one valid answer exists.'],
};

export const leaderboard = [
  { rank: 1, name: 'Alex Kim', xp: 8920, problems: 234, avatar: '🧑‍💻' },
  { rank: 2, name: 'Sarah Johnson', xp: 8540, problems: 221, avatar: '👩‍💻' },
  { rank: 3, name: 'David Chen', xp: 4850, problems: 67, avatar: '👨‍💻' },
  { rank: 4, name: 'Priya Patel', xp: 4200, problems: 58, avatar: '👩‍🔬' },
  { rank: 5, name: 'Marcus Williams', xp: 3890, problems: 52, avatar: '🧑‍🎓' },
];

export const platformStats = [
  { label: 'Courses Available', value: '8+', icon: 'BookOpen' },
  { label: 'Practice Quizzes', value: '50+', icon: 'Code2' },
  { label: 'Study Questions', value: '200+', icon: 'HelpCircle' },
  { label: 'Active Learners', value: '12K+', icon: 'FolderGit2' },
];

export const testimonials = [
  { id: 1, name: 'Emma Watson', role: 'CS Student, MIT', text: 'Study Buddy transformed how I learn. Buddy is incredible — it feels like having a personal teacher.', avatarColor: '#E75480', rating: 5 },
  { id: 2, name: 'Ryan Park', role: 'Engineering, Stanford', text: 'The workspace is so calm and well designed. I went from disorganized to genuinely excited to study.', avatarColor: '#C9B6E4', rating: 5 },
  { id: 3, name: 'Aisha Malik', role: 'Data Science, Berkeley', text: 'Finally a learning platform that feels peaceful instead of overwhelming. The progress tracking keeps me motivated daily.', avatarColor: '#F4B3CE', rating: 5 },
];

export const features = [
  { title: 'Personalized Study Planner', description: 'Organize every course, deadline, and study session in one calm, focused workspace.', icon: 'LayoutDashboard' },
  { title: 'Buddy AI', description: 'Ask questions, generate notes, and get concepts explained by Buddy in plain language, any time.', icon: 'Terminal' },
  { title: 'Smart Recommendations', description: 'Personalized learning paths and course suggestions based on how you actually study.', icon: 'Brain' },
  { title: 'Progress Insights', description: 'Beautiful, gentle analytics that show your growth without the pressure.', icon: 'BarChart3' },
  { title: 'Guided Courses', description: 'Bite-sized lessons, quizzes, and resources designed by subject experts.', icon: 'Users' },
  { title: 'Achievements & Streaks', description: 'Earn badges and build study streaks that keep you motivated every day.', icon: 'Trophy' },
];

export const languages = ['Python', 'JavaScript', 'Java', 'C++', 'TypeScript', 'Go', 'Rust'];

export const facultyCourses = [
  { id: 1, title: 'Data Structures & Algorithms', students: 156, assignments: 12, avgScore: 78, status: 'active' },
  { id: 2, title: 'Operating Systems', students: 98, assignments: 8, avgScore: 72, status: 'active' },
  { id: 3, title: 'Computer Architecture', students: 120, assignments: 10, avgScore: 81, status: 'draft' },
];

export const adminStats = {
  totalUsers: 12543, activeUsers: 8921, totalCourses: 234, totalRevenue: '$124,500',
  newUsersThisMonth: 456, courseCompletionRate: 68, avgSessionTime: '42 min', supportTickets: 23,
};

export const courseModules = {
  1: [
    { id: 1, title: 'Foundations of Data Structures', lessons: [
      { id: 1, title: 'Arrays & Memory Layout', duration: '12 min', done: true },
      { id: 2, title: 'Linked Lists Deep Dive', duration: '18 min', done: true },
      { id: 3, title: 'Stacks & Queues', duration: '15 min', done: true },
    ] },
    { id: 2, title: 'Trees & Graphs', lessons: [
      { id: 4, title: 'Binary Search Trees', duration: '20 min', done: false },
      { id: 5, title: 'Tree Traversals', duration: '16 min', done: false },
      { id: 6, title: 'Intro to Graphs', duration: '22 min', done: false },
    ] },
    { id: 3, title: 'Algorithms', lessons: [
      { id: 7, title: 'Sorting Algorithms', duration: '25 min', done: false },
      { id: 8, title: 'Searching Algorithms', duration: '14 min', done: false },
    ] },
  ],
};

export const courseResources = {
  1: [
    { id: 1, title: 'Lecture Slides — Week 1-4', type: 'PDF', size: '2.4 MB' },
    { id: 2, title: 'Practice Problem Set', type: 'PDF', size: '850 KB' },
    { id: 3, title: 'Reference Cheat Sheet', type: 'PDF', size: '410 KB' },
  ],
};

export const courseDiscussion = {
  1: [
    { id: 1, name: 'Priya Patel', avatarColor: '#F4B3CE', time: '2 hours ago', message: 'Can someone explain why we use a hash map for the Two Sum problem instead of nested loops?' },
    { id: 2, name: 'Marcus Williams', avatarColor: '#C9B6E4', time: '1 hour ago', message: 'The hash map gives O(n) time instead of O(n²) — you trade a bit of memory for speed.' },
    { id: 3, name: 'Dr. Sarah Mitchell', avatarColor: '#E75480', time: '40 min ago', message: 'Great explanation Marcus! Also check the lesson notes for a walk-through with diagrams.' },
  ],
};

export const courseReviews = {
  1: [
    { id: 1, name: 'Priya Patel', avatarColor: '#F4B3CE', rating: 5, date: '2 weeks ago', text: 'The way trees and graphs are explained finally made recursion click for me. The practice problems after every module were exactly what I needed.' },
    { id: 2, name: 'Marcus Williams', avatarColor: '#C9B6E4', rating: 5, date: '1 month ago', text: 'Genuinely the best DSA course I have taken. Dr. Mitchell breaks down Big-O in a way that actually sticks, and the pacing never feels rushed.' },
    { id: 3, name: 'Aisha Malik', avatarColor: '#6FA8DC', rating: 4, date: '1 month ago', text: 'Really solid course overall. Would love a few more graph theory problems, but the foundations here are excellent for interview prep.' },
    { id: 4, name: 'Ryan Park', avatarColor: '#5BB974', rating: 5, date: '2 months ago', text: 'Went from struggling with basic loops to comfortably implementing binary search trees. The instructor genuinely cares about students understanding, not just memorizing.' },
  ],
};

export const aiSuggestedPrompts = [
  'Explain recursion like I\'m 12 years old',
  'Summarize my Machine Learning notes from this week',
  'Make me 5 flashcards on Binary Search Trees',
  'Quiz me on SQL joins',
  'Help me plan study time before Friday\'s DSA quiz',
];

export const studyPlannerTasks = [
  { id: 1, day: 'Mon', title: 'DSA — Binary Trees', time: '9:00 AM', done: true },
  { id: 2, day: 'Mon', title: 'Read ML Chapter 4', time: '4:00 PM', done: true },
  { id: 3, day: 'Tue', title: 'Web Dev project work', time: '10:00 AM', done: false },
  { id: 4, day: 'Wed', title: 'Database Quiz prep', time: '2:00 PM', done: false },
  { id: 5, day: 'Thu', title: 'Networks reading', time: '9:00 AM', done: false },
  { id: 6, day: 'Fri', title: 'DSA Quiz', time: '11:00 AM', done: false },
  { id: 7, day: 'Sat', title: 'Review weekly notes', time: '5:00 PM', done: false },
];

export const adminUsers = [
  { id: 1, name: 'David Chen', email: 'david@uni.edu', role: 'student', status: 'active', lastLogin: '2026-07-25' },
  { id: 2, name: 'Dr. Sarah Mitchell', email: 'sarah@uni.edu', role: 'faculty', status: 'active', lastLogin: '2026-07-25' },
  { id: 3, name: 'Prof. James Liu', email: 'james@uni.edu', role: 'faculty', status: 'active', lastLogin: '2026-07-24' },
  { id: 4, name: 'Emma Watson', email: 'emma@uni.edu', role: 'student', status: 'inactive', lastLogin: '2026-07-10' },
  { id: 5, name: 'Admin User', email: 'admin@uni.edu', role: 'admin', status: 'active', lastLogin: '2026-07-25' },
];

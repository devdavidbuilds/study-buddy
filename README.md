# 🎓 Study Buddy – A Unified Academic Learning & Practice Platform

<p align="center">
  <b>Learn Smarter. Practice Better. Grow Together.</b>
</p>

<p align="center">
  An all-in-one academic platform that brings learning materials, coding practice, AI assistance, assessments, and study management together in one place.
</p>

---

## 📌 About the Project

**Study Buddy** is a unified academic learning and practice platform designed to improve the learning experience of students while simplifying academic management for faculty members.

Students often depend on multiple applications for accessing study materials, practising programming, clearing doubts, managing schedules, and tracking their academic progress.

Study Buddy addresses this problem by bringing these essential activities into a single platform.

It provides a collaborative learning environment with role-based access for Students, Faculty, and Administrators, along with AI-powered assistance and Machine Learning-based recommendations.

## ✨ Key Features

### 👨‍🎓 Student Module
- Interactive student dashboard with XP, levels, streaks, and study statistics.
- Browse and explore 3,672 educational courses.
- Enroll in courses with faculty approval.
- Access structured modules, lessons, and learning materials.
- Attempt lesson checks and module quizzes.
- Submit assignments in PDF format.
- Track course completion and learning progress.
- Earn dynamically generated course completion certificates.

### 👩‍🏫 Faculty Module
- Dedicated faculty dashboard.
- Create and manage courses.
- Upload lecture materials and learning resources.
- Approve or reject student enrollments.
- Create quizzes with custom questions, marks, and time limits.
- Publish assignments with deadlines.
- Review student PDF submissions.
- Evaluate assignments and provide feedback.
- Monitor student performance and progress.

### 💻 Interactive CodeLab
- Browser-based coding environment.
- Integrated Monaco Code Editor.
- Python execution using Pyodide and WebAssembly.
- Judge0 API integration for supported programming languages.
- Practice programming problems without installing a local IDE.

### 🤖 AI-Powered Learning
- AI Tutor for instant doubt clarification.
- AI-based study material summarisation.
- Gemini API integration.
- Summary history and cached responses.

### 📅 Study Planner
- Organise daily study activities.
- Manage personal study notes.
- Built-in study session timer.
- Track study habits and learning consistency.

### 🏆 Achievements & Certificates
- XP and level-based gamification.
- Learning streak tracking.
- Course completion tracking.
- Dynamically generated PDF certificates.
- Unique certificate IDs with public verification.

### 🧠 Machine Learning Integration

**1. Content-Based Course Recommendation**

- Implemented using Python and Scikit-learn.
- Uses TF-IDF vectorisation.
- Uses Cosine Similarity to identify related courses.
- Recommends the five most relevant courses based on course content.

**2. Student Performance Prediction**

- Implemented using a Random Forest Regressor.
- Analyses previous student learning and quiz performance.
- Predicts potential upcoming quiz scores.
- Designed to support personalised learning insights.

---

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React 19, Vite, JavaScript |
| UI & Styling | CSS, Responsive Design |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| File Storage | MongoDB GridFS |
| Authentication | JWT, bcrypt |
| Code Editor | Monaco Editor |
| Python Execution | Pyodide, WebAssembly |
| Code Execution API | Judge0 |
| AI Integration | Google Gemini API |
| Machine Learning | Python, Scikit-learn |
| Recommendation Algorithm | TF-IDF, Cosine Similarity |
| Prediction Model | Random Forest Regressor |
| PDF Generation | PDFKit |
| Deployment | Vercel, Render |
| Version Control | Git, GitHub |

---

## 🏗️ System Architecture

Study Buddy follows a client-server architecture.

```text
                 STUDY BUDDY
                      |
          +-----------+-----------+
          |                       |
      FRONTEND                BACKEND
      React + Vite          Node.js + Express
          |                       |
          |                 REST APIs
          |                       |
          +-----------+-----------+
                      |
                 DATABASE
                MongoDB Atlas
                      |
          +-----------+-----------+
          |           |           |
        GridFS      JWT Auth    Application
        Storage                 Data
                      |
             EXTERNAL SERVICES
                      |
          +-----------+-----------+
          |           |           |
        Gemini      Judge0      ML Models
          API        API       Scikit-learn
```

---

## 📂 Main Modules

The application is organised into the following functional modules:

1. Authentication and Role Management
2. Course Management
3. Student Enrollment
4. Learning Materials and Lessons
5. Lesson Checks and Module Quizzes
6. Assignment Submission and Evaluation
7. Interactive CodeLab
8. AI Tutor and Summarisation
9. Study Planner and Notes
10. Achievements and Certification
11. Faculty Dashboard
12. Course Recommendation System
13. Student Performance Prediction

---

## ⚙️ Installation and Setup

Follow these steps to run the project locally.

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- MongoDB Atlas account or MongoDB instance
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
```

### 2. Navigate to the Project Directory

```bash
cd YOUR_REPOSITORY
```

### 3. Install Dependencies

Navigate to the frontend and backend directories and install their dependencies.

```bash
npm install
```

Repeat this in each application directory containing a `package.json`.

### 4. Configure Environment Variables

Create a `.env` file in the backend directory.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

Add any other environment variables required by your implementation.

**Important:** Never upload API keys, database credentials, or secret environment variables to GitHub.

### 5. Start the Application

Start the backend:

```bash
npm run dev
```

Start the frontend in its respective directory:

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

---

## 🔐 Security Features

- JWT-based authentication.
- Password hashing using bcrypt.
- Role-based access control.
- Server-side quiz evaluation.
- PDF file validation before storage.
- Protected API endpoints.
- Environment-based secret management.

---

## 🚀 Deployment

The project uses the following deployment platforms:

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |
| Source Code | GitHub |

---

## 🎯 Project Outcomes

Study Buddy provides a unified environment for academic learning and management.

The project demonstrates the practical implementation of:

- Full-stack web application development.
- REST API development and integration.
- Database design and file management.
- Secure authentication and authorisation.
- Browser-based programming environments.
- Artificial Intelligence integration.
- Machine Learning-based recommendation and prediction.

---

## 🔮 Future Enhancements

- Real-time collaborative coding.
- Live doubt-clearing sessions.
- Advanced learning analytics.
- Personalised learning paths.
- Mobile application support.
- More programming languages and coding challenges.

---

## 👨‍💻 Project Contributors

**Navien Kumar B R**  
- Register Number: 24BCS053

**David Prince J**  
- Register Number: 24BCS038

**Project Guide:**  
Dr. S. Vanitha Sivagami, ME, PhD.  
Professor

**Institution:**  
MEPCO Schlenk Engineering College, Sivakasi.

---

## 📚 Acknowledgements

We sincerely thank our project guide and faculty members for their valuable guidance, support, and encouragement throughout the development of this project.

We also acknowledge the educational datasets and open-source technologies that helped us develop Study Buddy.

---

<p align="center">
  <b>⭐ If you find this project interesting, consider giving it a star!</b>
</p>

<p align="center">
  Made with ❤️ by the Study Buddy Team
</p>

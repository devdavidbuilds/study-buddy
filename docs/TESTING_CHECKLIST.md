# Study Buddy -- Manual Testing Checklist

Use this checklist during a manual review of the application. Mark each
item only after testing it in the current build.

## Authentication and Roles

-   [ ] A user can sign in with valid credentials.
-   [ ] Invalid credentials are handled with a clear message.
-   [ ] The correct dashboard is displayed for each user role.
-   [ ] A user cannot access pages or actions outside their permissions.
-   [ ] Sign-out works as expected.

## Student Features

-   [ ] The student dashboard loads correctly.
-   [ ] The course catalogue is displayed.
-   [ ] A student can submit an enrolment request.
-   [ ] Course content is accessible after approval.
-   [ ] Lessons and learning materials open correctly.
-   [ ] Lesson checks can be attempted.
-   [ ] Module quizzes can be submitted.
-   [ ] Quiz results are displayed correctly.
-   [ ] A student can upload a valid PDF assignment.
-   [ ] Assignment status is updated after submission.
-   [ ] Study planner and personal notes work as expected.
-   [ ] Progress and achievement information is displayed correctly.

## CodeLab and AI Features

-   [ ] The code editor loads.
-   [ ] Supported code can be executed successfully.
-   [ ] Execution errors are presented clearly.
-   [ ] The AI Tutor accepts a question and displays a response.
-   [ ] The summarisation feature handles supported learning material.
-   [ ] Previously generated summaries behave as expected.

## Faculty Features

-   [ ] The faculty dashboard loads.
-   [ ] Faculty can manage course content.
-   [ ] Enrolment requests can be reviewed.
-   [ ] Faculty can create quizzes and assignments.
-   [ ] Submitted PDFs can be viewed.
-   [ ] Marks and feedback can be recorded.
-   [ ] Student progress information is displayed correctly.

## Certificates and General Usability

-   [ ] Certificate eligibility is checked correctly.
-   [ ] Generated certificates contain the expected student and course
    details.
-   [ ] Certificate verification works where enabled.
-   [ ] Navigation links work.
-   [ ] Layout remains usable at common desktop and mobile widths.
-   [ ] Empty states and error messages are understandable.

## Test Record

-   **Build/version tested:**
-   **Date:**
-   **Tester:**
-   **Environment/browser:**
-   **Issues found:**

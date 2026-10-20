const { estimateLessonMinutes, formatMinutes, formatCourseDuration } = require("./estimate");

// ==============================
// Turn a validated curriculum + lesson drafts into Course.modules.
//
// IDs follow the same scheme the CSV importer used (module-N and a
// course-wide lesson-N counter), so routes, progress keys and
// quiz/assignment links keep the familiar shape.
// ==============================

// finalAssessment (optional): validated output of the final-assessment
// step; appended as a closing module with one review + test lesson.
const assembleCourseContent = ({ curriculum, lessons, finalAssessment }) => {
  let lessonNumber = 0;
  let totalMinutes = 0;

  const modules = curriculum.modules.map((module, mi) => ({
    id: `module-${mi + 1}`,
    title: module.title,
    summary: module.summary || "",
    lessons: module.lessons.map((plan, li) => {
      lessonNumber += 1;
      const draft = lessons[`${mi}.${li}`];
      if (!draft) throw new Error(`Missing generated content for module ${mi + 1}, lesson ${li + 1}.`);

      const quiz = draft.assessment.map((q) => ({
        question: q.question,
        options: q.options,
        answer: q.answer,
        explanation: q.explanation,
      }));

      const learning = {
        objectives: draft.objectives,
        explanation: draft.explanation,
        concepts: draft.concepts,
        examples: draft.examples.map((ex) => ({ ...ex, code: ex.code || "", language: ex.code ? ex.language : "" })),
        applications: draft.applications,
        mistakes: draft.mistakes,
        tips: draft.tips,
        takeaways: draft.takeaways,
        revisionNotes: draft.revisionNotes,
        practice: draft.practice,
      };

      const minutes = estimateLessonMinutes(learning, quiz);
      totalMinutes += minutes;

      return {
        id: `lesson-${lessonNumber}`,
        title: plan.title,
        duration: formatMinutes(minutes),
        done: false,
        codeFile: "",
        description: draft.summary || plan.focus,
        content: draft.explanation,
        videoUrl: "",
        resources: [],
        quiz,
        estimatedMinutes: minutes,
        learning,
      };
    }),
  }));

  const teachingLessons = lessonNumber;

  if (finalAssessment) {
    lessonNumber += 1;
    const quiz = finalAssessment.questions.map((q) => ({
      question: q.question,
      options: q.options,
      answer: q.answer,
      explanation: q.explanation,
    }));
    const learning = {
      kind: "final-assessment",
      explanation: finalAssessment.review,
      takeaways: finalAssessment.takeaways,
      revisionNotes: finalAssessment.revisionNotes,
    };
    const minutes = estimateLessonMinutes(learning, quiz);
    totalMinutes += minutes;

    modules.push({
      id: `module-${modules.length + 1}`,
      title: "Final Assessment",
      summary: `Review the whole course, then answer ${quiz.length} questions covering every module.`,
      lessons: [
        {
          id: `lesson-${lessonNumber}`,
          title: "Final Assessment",
          duration: formatMinutes(minutes),
          done: false,
          codeFile: "",
          description: `Course review and a ${quiz.length}-question final assessment with explained answers.`,
          content: finalAssessment.review,
          videoUrl: "",
          resources: [],
          quiz,
          estimatedMinutes: minutes,
          learning,
        },
      ],
    });
  }

  return {
    modules,
    estimatedMinutes: totalMinutes,
    duration: formatCourseDuration(totalMinutes),
    outcomes: curriculum.outcomes,
    lessonCount: teachingLessons,
    finalQuestions: finalAssessment ? finalAssessment.questions.length : 0,
  };
};

module.exports = { assembleCourseContent };

import API from './api';

// Get the authenticated student's own recent activity feed.
// Optionally scope to a single course.
export const getMyActivity = ({ courseId, limit } = {}) =>
  API.get('/activity/me', { params: { courseId, limit } });

// Record that the authenticated student opened a course or a lesson.
// Fire-and-forget from the UI — never blocks the page and callers should
// swallow errors, since a missed view event should never break navigation.
export const logCourseOpened = (courseId) =>
  API.post('/activity/view', {
    activityType: 'COURSE_OPENED',
    courseId,
  });

export const logLessonOpened = (courseId, moduleId, lessonId) =>
  API.post('/activity/view', {
    activityType: 'LESSON_OPENED',
    courseId,
    moduleId,
    lessonId,
  });

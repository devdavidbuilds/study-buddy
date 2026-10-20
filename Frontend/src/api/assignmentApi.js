import API from './api';

// Faculty: create an assignment for a course/module/lesson
export const createAssignment = (data) =>
  API.post('/assignments/create', data);

// Faculty: get all assignments created by the logged-in faculty
export const getMyAssignments = () =>
  API.get('/assignments/my');

// Get all assignments for a specific course
export const getAssignmentsByCourse = (courseId) =>
  API.get(`/assignments/course/${courseId}`);

// Get assignment(s) for a specific module/lesson within a course
// (used by the student assignment flow)
export const getAssignmentsForLesson = (courseId, moduleId, lessonId) =>
  API.get(`/assignments/course/${courseId}/module/${moduleId}/lesson/${lessonId}`);

// Faculty: get all student submissions across courses (with optional filters: { courseId, assignmentId, status, search })
export const getFacultySubmissions = (params = {}) =>
  API.get('/assignments/faculty/submissions', { params });

// Faculty: get all student submissions for an assignment
// (only assignments belonging to the faculty's own courses — enforced server-side)
export const getSubmissionsForAssignment = (assignmentId) =>
  API.get(`/assignments/${assignmentId}/submissions`);

// Submitted PDFs are served only with the auth header, so they are fetched
// as blobs (owner student, course faculty or admin — enforced server-side).
// `file.url` is the stored "/api/submissions/files/:fileId" path.
export const fetchSubmissionPdf = async (file, { download = false } = {}) => {
  const path = String(file?.url || '').replace(/^\/api/, '');
  const res = await API.get(path, {
    responseType: 'blob',
    params: download ? { download: 1 } : undefined,
  });
  return new Blob([res.data], { type: 'application/pdf' });
};

// Open in a new browser tab (the browser's own PDF viewer).
export const openSubmissionPdf = async (file) => {
  // Open the tab synchronously so pop-up blockers allow it, then load the PDF.
  const tab = window.open('', '_blank');
  try {
    const url = URL.createObjectURL(await fetchSubmissionPdf(file));
    if (tab) tab.location.href = url;
    else window.location.assign(url);
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (err) {
    if (tab) tab.close();
    throw err;
  }
};

export const downloadSubmissionPdf = async (file) => {
  const url = URL.createObjectURL(await fetchSubmissionPdf(file, { download: true }));
  const link = document.createElement('a');
  link.href = url;
  link.download = file?.originalName || 'submission.pdf';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
};

// Faculty: save marks + feedback for a student's submission
export const evaluateSubmission = (assignmentId, studentId, payload) => {
  if (assignmentId && assignmentId !== 'null' && assignmentId !== 'general') {
    return API.put(`/assignments/${assignmentId}/submissions/${studentId}/evaluate`, payload);
  }
  return API.put(`/assignments/submissions/${studentId}/evaluate`, payload);
};

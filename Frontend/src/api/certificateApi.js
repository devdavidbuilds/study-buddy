import API from './api';

// Student: every certificate they have earned.
export const getMyCertificates = () => API.get('/certificates/mine');

// Fetch the certificate PDF (authenticated) and save it in the browser.
export const downloadCertificate = async (certificate) => {
  const res = await API.get(`/certificates/${certificate.certificateId}/download`, {
    responseType: 'blob',
  });

  const safeCourse = String(certificate.courseName || 'Course')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);

  const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `StudyBuddy-Certificate-${safeCourse || 'Course'}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

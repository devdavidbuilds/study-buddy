import API from './api';

export const sendChatbotMessage = (data) => API.post('/chatbot/message', data);

export const summarizeNotes = (formData) =>
  API.post('/chatbot/summarize-notes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

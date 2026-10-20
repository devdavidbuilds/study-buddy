import API from './api';

export const sendChatbotMessage = (data) => API.post('/chatbot/message', data);

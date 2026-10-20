import API from './api';

// Fine-tuned Study Buddy model (proxied by the backend; the model secret never reaches the browser)
export const sendAiChatMessage = (data) => API.post('/ai-chat', data);

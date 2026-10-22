import API from './api';

// Personal notes of the logged-in user.
export const getNotes = () => API.get('/notes');

// data: { title, course?, content?, color? }
export const createNote = (data) => API.post('/notes', data);

export const updateNote = (id, data) => API.put(`/notes/${id}`, data);

export const deleteNote = (id) => API.delete(`/notes/${id}`);

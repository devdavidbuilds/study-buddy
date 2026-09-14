import API from './api';

export const runCode = (payload) => API.post('/compiler/run', payload);

export const submitCode = (payload) => API.post('/compiler/submit', payload);

export const validateTestCases = (payload) => API.post('/compiler/testcases', payload);

export const getCompilerSubmissions = () => API.get('/compiler/submissions');

export const checkCompilerStatus = () => API.get('/compiler/status');

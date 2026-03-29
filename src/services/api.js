import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

const withErrorHandling = async (apiCall) => {
  try {
    const response = await apiCall;
    return response.data;
  } catch (error) {
    console.error('API Error:', error);

    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          throw new Error(data.error || 'Bad request. Please check your input.');
        case 401:
          throw new Error('Session expired. Please login again.');
        case 403:
          throw new Error('You do not have permission to perform this action.');
        case 404:
          throw new Error('Resource not found.');
        case 429:
          throw new Error('Too many requests. Please try again later.');
        case 500:
          throw new Error('Server error. Please try again later.');
        default:
          throw new Error(data.error || 'An error occurred.');
      }
    } else if (error.request) {
      throw new Error('Network error. Please check your internet connection.');
    } else {
      throw new Error('An unexpected error occurred.');
    }
  }
};

export const authAPI = {
  login: (email, password) => api.post('/login', { email, password }),
  register: (userData) => api.post('/register', userData),
  updateProfilePicture: (userId, profile_picture) => 
    withErrorHandling(api.put(`/users/${userId}/profile-picture`, { profile_picture })),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return Promise.resolve();
  },
};

export const studentAPI = {
  getProfile: (userId) => withErrorHandling(api.get(`/students/${userId}/profile`)),
  updateProfile: (userId, profileData) => withErrorHandling(api.put(`/students/${userId}/profile`, profileData)),
  chatAboutIdea: (userId, payload) => withErrorHandling(api.post(`/students/${userId}/ideas/chat`, payload)),
  generateIdeas: (userId, criteria) => withErrorHandling(api.post(`/students/${userId}/ideas/generate`, criteria)),
  getSavedIdeas: (userId) => withErrorHandling(api.get(`/students/${userId}/ideas/saved`)),
  saveIdea: (userId, ideaId) =>   
    withErrorHandling(api.post(`/students/${userId}/ideas/save`, {
      ideaId
    })),
  getSemesterCourses: (userId) => withErrorHandling(api.get(`/students/${userId}/courses`)),
  deleteSavedIdea: (ideaId) => withErrorHandling(api.delete(`/ideas/saved/${ideaId}`)),
  
  // Student Project Management
  getProjects: (userId) => withErrorHandling(api.get(`/students/${userId}/projects`)),
  saveProject: (userId, projectData) => withErrorHandling(api.post(`/students/${userId}/projects`, projectData)),
  deleteProject: (projectId) => withErrorHandling(api.delete(`/students/projects/${projectId}`)),
  checkProfileCompletion: (userId) => withErrorHandling(api.get(`/students/${userId}/profile-completion`)),
  
  // Groq AI Integration
  generateIdeasWithHistory: (userId) => withErrorHandling(api.post(`/students/${userId}/ideas/generate-with-history`, {})),
};

export const facultyAPI = {
  getStudents: () => withErrorHandling(api.get('/students')),
  addStudent: (studentData) =>
    withErrorHandling(
      api.post('/faculty/insert-student-record', studentData)
    ),  
  generateIdeasForStudent: (facultyId, studentId) => 
    withErrorHandling(api.post(`/faculty/${facultyId}/generate/${studentId}`)),
  getStudentIdeas: (studentId) => withErrorHandling(api.get(`/faculty/students/${studentId}/ideas`)),
  getSavedIdeas: () => withErrorHandling(api.get('/faculty/ideas/saved')),
  updateIdeaStatus: (savedId, status) => withErrorHandling(api.put(`/faculty/ideas/saved/${savedId}/status`, { status })),
};

export default api;
import axios from 'axios';

// Define the axios instance first
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the token to the axiosInstance
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cutting-room:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const api = {
  // Expose the axios instance if needed
  client: axiosInstance,

  // Generic HTTP methods (used by stores)
  get: (url: string, config?: any) => axiosInstance.get(url, config),
  post: (url: string, data?: any, config?: any) => axiosInstance.post(url, data, config),
  put: (url: string, data?: any, config?: any) => axiosInstance.put(url, data, config),
  delete: (url: string, config?: any) => axiosInstance.delete(url, config),

  // Auth
  login: (credentials: any) => axiosInstance.post('/auth/login', credentials),
  register: (userData: any) => axiosInstance.post('/auth/register', userData),
  getMe: () => axiosInstance.get('/auth/me'),

  // Tracks
  getCurrentTrack: () => axiosInstance.get('/tracks/current'),
  getCommunityTracks: () => axiosInstance.get('/tracks/community'),
  getTrackHistory: () => axiosInstance.get('/tracks/history'),
  getTrackById: (id: string) => axiosInstance.get(`/tracks/${id}`),
  concludeTrack: (id: string) => axiosInstance.post(`/tracks/${id}/conclude`),

  // Items & Nodes
  createItem: (formData: FormData) => axiosInstance.post('/items', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getUserItems: (userId: string) => axiosInstance.get(`/items/user/${userId}`),
  getUserNodes: (userId: string) => axiosInstance.get(`/nodes/user/${userId}`),

  // Social
  searchUser: (email: string) => axiosInstance.get(`/users/search?email=${encodeURIComponent(email)}`),
  getUserById: (id: string) => axiosInstance.get(`/users/${id}`),
  getFriends: () => axiosInstance.get('/users/friends'),
  getFriendRequests: () => axiosInstance.get('/users/requests'),
  sendFriendRequest: (userId: string) => axiosInstance.post(`/users/${userId}/request`),
  acceptFriendRequest: (userId: string) => axiosInstance.post(`/users/requests/${userId}/accept`),
  rejectFriendRequest: (userId: string) => axiosInstance.delete(`/users/requests/${userId}`),
  removeFriend: (userId: string) => axiosInstance.delete(`/users/${userId}/friend`),

  // Notifications
  getNotifications: (unreadOnly = false) => axiosInstance.get(`/notifications?unread_only=${unreadOnly}`),
  markNotificationRead: (id: string) => axiosInstance.put(`/notifications/${id}/read`),
  markAllNotificationsRead: () => axiosInstance.put('/notifications/read-all'),
  deleteNotification: (id: string) => axiosInstance.delete(`/notifications/${id}`),
}

export default api;

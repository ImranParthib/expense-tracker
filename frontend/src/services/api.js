import axios from "axios";

// Create axios instance with base URL
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          const response = await axios.post(
            `${API.defaults.baseURL}/auth/refresh`,
            {
              refresh_token: refreshToken,
            }
          );

          const { access_token } = response.data;
          localStorage.setItem("access_token", access_token);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return API(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  // Register new user
  register: (userData) => API.post("/auth/register", userData),

  // Login user
  login: (email, password) => API.post("/auth/login", { email, password }),

  // Refresh token
  refreshToken: (refreshToken) =>
    API.post("/auth/refresh", { refresh_token: refreshToken }),

  // Logout (optional - for server-side logout)
  logout: () => API.post("/auth/logout"),
};

// Categories API
export const categoryAPI = {
  // Get all categories
  getCategories: (params = {}) => API.get("/categories", { params }),

  // Get single category
  getCategory: (id) => API.get(`/categories/${id}`),

  // Create new category
  createCategory: (categoryData) => API.post("/categories", categoryData),

  // Update category
  updateCategory: (id, categoryData) =>
    API.put(`/categories/${id}`, categoryData),

  // Delete category
  deleteCategory: (id) => API.delete(`/categories/${id}`),
};

// Expenses API
export const expenseAPI = {
  // Get all expenses with filtering and pagination
  getExpenses: (params = {}) => API.get("/expenses", { params }),

  // Get single expense
  getExpense: (id) => API.get(`/expenses/${id}`),

  // Create new expense
  createExpense: (expenseData) => API.post("/expenses", expenseData),

  // Update expense
  updateExpense: (id, expenseData) => API.put(`/expenses/${id}`, expenseData),

  // Delete expense
  deleteExpense: (id) => API.delete(`/expenses/${id}`),

  // Get expense statistics
  getExpenseStats: (params = {}) => API.get("/expenses/stats", { params }),

  // Get expense summary (totals, averages, breakdowns)
  getExpenseSummary: (params = {}) => API.get("/expenses/summary", { params }),
};

// Utility function to handle API errors
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.error || "An error occurred",
      status: error.response.status,
      details: error.response.data?.details,
    };
  } else if (error.request) {
    // Request made but no response received
    return {
      message: "Network error. Please check your connection.",
      status: 0,
    };
  } else {
    // Something else happened
    return {
      message: error.message || "An unexpected error occurred",
      status: 0,
    };
  }
};

export default API;

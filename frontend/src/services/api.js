import axios from "axios";

// Create axios instance with base URL
const API = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "http://localhost:5000"
      : "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Categories API
export const categoryAPI = {
  // Get all categories
  getCategories: () => API.get("/categories"),

  // Create new category
  createCategory: (name) => API.post("/categories", { name }),
};

// Expenses API
export const expenseAPI = {
  // Get all expenses
  getExpenses: () => API.get("/expenses"),

  // Create new expense
  createExpense: (expenseData) => API.post("/expenses", expenseData),
};

export default API;

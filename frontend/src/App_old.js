import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Navbar from "./components/common/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ExpensesPage from "./pages/ExpensesPage";
import CategoriesPage from "./pages/CategoriesPage";
import ProfilePage from "./pages/ProfilePage";
import LandingPage from "./pages/LandingPage";
import "./App.css";
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Container fluid className="py-4">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Protected routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/expenses"
                  element={
                    <ProtectedRoute>
                      <ExpensesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/categories"
                  element={
                    <ProtectedRoute>
                      <CategoriesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                
                {/* Redirect to dashboard for authenticated users, landing page for guests */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Container>
          </main>
          
          {/* Toast notifications */}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="App">
      <Container>
        <div className="main-container">
          <div className="header-section">
            <h1 className="header-title">💰 Personal Expense Tracker</h1>
            <p className="header-subtitle">
              Manage your expenses and categories with ease
            </p>
          </div>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError("")}>
              <Alert.Heading>Connection Error</Alert.Heading>
              <p>{error}</p>
              <hr />
              <p className="mb-0">
                Make sure your Flask backend is running on{" "}
                <strong>http://localhost:5000</strong>
              </p>
            </Alert>
          )}

          <Row>
            <Col lg={12}>
              <CategoryManager
                categories={categories}
                setCategories={setCategories}
              />
            </Col>
          </Row>

          <Row>
            <Col lg={12}>
              <ExpenseManager
                expenses={expenses}
                setExpenses={setExpenses}
                categories={categories}
              />
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  );
}

export default App;

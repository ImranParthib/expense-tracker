import React, { useState, useEffect } from "react";
import { Container, Row, Col, Alert, Spinner } from "react-bootstrap";
import CategoryManager from "./components/CategoryManager";
import ExpenseManager from "./components/ExpenseManager";
import { categoryAPI, expenseAPI } from "./services/api";
import "./App.css";

function App() {
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch initial data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch categories and expenses in parallel
        const [categoriesResponse, expensesResponse] = await Promise.all([
          categoryAPI.getCategories(),
          expenseAPI.getExpenses(),
        ]);

        setCategories(categoriesResponse.data || []);
        setExpenses(expensesResponse.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          "Failed to load data. Please check if the backend server is running on port 5000."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="App">
        <Container>
          <div className="loading">
            <Spinner animation="border" role="status" className="me-3">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            Loading your expense tracker...
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

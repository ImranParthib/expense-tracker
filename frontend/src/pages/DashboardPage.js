import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Alert, Spinner } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { expenseAPI, categoryAPI } from "../services/api";

const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboardData, setDashboardData] = useState({
    totalExpenses: 0,
    monthlyExpenses: 0,
    categoriesCount: 0,
    recentExpenses: [],
    expensesByCategory: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // Get current month dates
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Fetch data in parallel
      const [expensesResponse, categoriesResponse, monthlySummaryResponse] =
        await Promise.all([
          expenseAPI.getExpenses({
            per_page: 5,
            sort_by: "date",
            sort_order: "desc",
          }),
          categoryAPI.getCategories(),
          expenseAPI.getExpenseSummary({
            start_date: startOfMonth.toISOString().split("T")[0],
            end_date: endOfMonth.toISOString().split("T")[0],
          }),
        ]);

      // Calculate monthly total from summary endpoint
      const monthlyExpenses =
        monthlySummaryResponse.data?.summary?.total_amount || 0;

      // Get overall totals using summary (without date filters)
      const overallSummaryResponse = await expenseAPI.getExpenseSummary();
      const totalExpenses =
        overallSummaryResponse.data?.summary?.total_amount || 0;

      setDashboardData({
        totalExpenses,
        monthlyExpenses,
        categoriesCount:
          categoriesResponse.data.total ||
          categoriesResponse.data.categories?.length ||
          0,
        recentExpenses:
          expensesResponse.data.items || expensesResponse.data.data || [],
        expensesByCategory: categoriesResponse.data.categories || [],
      });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <div className="mt-2">Loading dashboard...</div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Welcome Header */}
      <Row className="mb-4">
        <Col>
          <h1 className="display-6 fw-bold text-primary">
            Welcome back, {user?.first_name || "User"}! 👋
          </h1>
          <p className="text-muted">Here's your expense overview</p>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="text-primary mb-2" style={{ fontSize: "2.5rem" }}>
                💰
              </div>
              <Card.Title className="text-muted">Total Expenses</Card.Title>
              <div className="display-6 fw-bold text-primary">
                ${dashboardData.totalExpenses.toFixed(2)}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="text-warning mb-2" style={{ fontSize: "2.5rem" }}>
                📅
              </div>
              <Card.Title className="text-muted">This Month</Card.Title>
              <div className="display-6 fw-bold text-warning">
                ${dashboardData.monthlyExpenses.toFixed(2)}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="text-success mb-2" style={{ fontSize: "2.5rem" }}>
                📂
              </div>
              <Card.Title className="text-muted">Categories</Card.Title>
              <div className="display-6 fw-bold text-success">
                {dashboardData.categoriesCount}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Recent Expenses */}
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">📝 Recent Expenses</h5>
            </Card.Header>
            <Card.Body>
              {dashboardData.recentExpenses.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.recentExpenses.map((expense) => (
                        <tr key={expense.id}>
                          <td>{expense.description}</td>
                          <td className="fw-bold text-primary">
                            ${parseFloat(expense.amount || 0).toFixed(2)}
                          </td>
                          <td className="text-muted">
                            {new Date(expense.date).toLocaleDateString()}
                          </td>
                          <td>
                            <span className="badge bg-secondary">
                              {expense.category?.name || "Unknown"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  <div style={{ fontSize: "3rem" }}>📋</div>
                  <p>No expenses yet. Start tracking your spending!</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Categories Summary */}
        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">📊 Categories</h5>
            </Card.Header>
            <Card.Body>
              {dashboardData.expensesByCategory.length > 0 ? (
                <div>
                  {dashboardData.expensesByCategory
                    .slice(0, 5)
                    .map((category) => (
                      <div
                        key={category.id}
                        className="d-flex justify-content-between align-items-center mb-3"
                      >
                        <div>
                          <div className="fw-bold">{category.name}</div>
                          <small className="text-muted">
                            {category.expense_count || 0} expenses
                          </small>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold text-primary">
                            ${parseFloat(category.total_amount || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  <div style={{ fontSize: "2rem" }}>📂</div>
                  <p>No categories yet.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mt-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Body className="text-center">
              <h5 className="mb-3">Quick Actions</h5>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <button className="btn btn-primary">➕ Add Expense</button>
                <button className="btn btn-success">📂 New Category</button>
                <button className="btn btn-info">📊 View Reports</button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardPage;

import React, { useState } from "react";
import { Row, Col, Form, Button, Table, Alert } from "react-bootstrap";
import { expenseAPI } from "../services/api";

const ExpenseManager = ({ expenses, setExpenses, categories }) => {
  const [expenseForm, setExpenseForm] = useState({
    amount: "",
    description: "",
    date: "",
    category_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExpenseForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !expenseForm.amount ||
      !expenseForm.description ||
      !expenseForm.date ||
      !expenseForm.category_id
    ) {
      setError("All fields are required");
      return;
    }

    if (isNaN(expenseForm.amount) || parseFloat(expenseForm.amount) <= 0) {
      setError("Amount must be a positive number");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const expenseData = {
        amount: parseFloat(expenseForm.amount),
        description: expenseForm.description,
        date: expenseForm.date,
        category_id: parseInt(expenseForm.category_id),
      };

      const response = await expenseAPI.createExpense(expenseData);
      setExpenses([...expenses, response.data]);

      // Reset form
      setExpenseForm({
        amount: "",
        description: "",
        date: "",
        category_id: "",
      });

      setSuccess("Expense added successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error adding expense:", err);
      setError(err.response?.data?.error || "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalExpenses = () => {
    return expenses
      .reduce((total, expense) => total + expense.amount, 0)
      .toFixed(2);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="section-card">
      <h3 className="section-title">
        <i className="fas fa-receipt"></i>
        Manage Expenses
      </h3>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      <Form onSubmit={handleAddExpense}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Amount ($)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="amount"
                value={expenseForm.amount}
                onChange={handleInputChange}
                placeholder="Enter amount"
                disabled={loading}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="category_id"
                value={expenseForm.category_id}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={expenseForm.description}
                onChange={handleInputChange}
                placeholder="Enter description"
                disabled={loading}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={expenseForm.date}
                onChange={handleInputChange}
                disabled={loading}
              />
            </Form.Group>
          </Col>
        </Row>

        <Button
          variant="primary"
          type="submit"
          disabled={loading || categories.length === 0}
          className="me-2"
        >
          {loading ? "Adding..." : "Add Expense"}
        </Button>

        {categories.length === 0 && (
          <small className="text-muted">
            Please add at least one category first
          </small>
        )}
      </Form>

      {expenses.length > 0 && (
        <>
          <div className="summary-cards mt-4">
            <div className="summary-card">
              <h3>${calculateTotalExpenses()}</h3>
              <p>Total Expenses</p>
            </div>
            <div className="summary-card">
              <h3>{expenses.length}</h3>
              <p>Total Transactions</p>
            </div>
            <div className="summary-card">
              <h3>{categories.length}</h3>
              <p>Categories</p>
            </div>
          </div>

          <Table striped bordered hover className="mt-4">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{formatDate(expense.date)}</td>
                  <td>{expense.description}</td>
                  <td>{expense.category}</td>
                  <td className="expense-amount">
                    ${expense.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}

      {expenses.length === 0 && (
        <div className="no-data">
          No expenses recorded yet. Add your first expense above!
        </div>
      )}
    </div>
  );
};

export default ExpenseManager;

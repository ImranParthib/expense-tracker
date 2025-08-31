import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Modal,
  Form,
  Alert,
  Spinner,
  Badge,
  Pagination,
  InputGroup,
} from "react-bootstrap";
import { expenseAPI, categoryAPI } from "../services/api";

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    perPage: 10,
  });

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    category_id: "",
    start_date: "",
    end_date: "",
    min_amount: "",
    max_amount: "",
  });

  // Form data
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    category_id: "",
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchCategories();
    fetchExpenses();
  }, [pagination.page, filters]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getCategories();
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page: pagination.page,
        per_page: pagination.perPage,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== "")
        ),
      };

      const response = await expenseAPI.getExpenses(params);

      setExpenses(response.data.data || []);
      setPagination((prev) => ({
        ...prev,
        totalPages: response.data.pages || 1,
        total: response.data.total || 0,
      }));
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setError("Failed to load expenses. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.perPage, filters]);

  const handleShowModal = (expense = null) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        description: expense.description || "",
        amount: expense.amount || "",
        date: expense.date || "",
        category_id: expense.category_id || "",
      });
    } else {
      setEditingExpense(null);
      setFormData({
        description: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        category_id: "",
      });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingExpense(null);
    setFormData({
      description: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      category_id: "",
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.description?.trim()) {
      errors.description = "Description is required";
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = "Amount must be greater than 0";
    }

    if (!formData.date) {
      errors.date = "Date is required";
    }

    if (!formData.category_id) {
      errors.category_id = "Category is required";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (editingExpense) {
        await expenseAPI.updateExpense(editingExpense.id, formData);
        setSuccess("Expense updated successfully!");
      } else {
        await expenseAPI.createExpense(formData);
        setSuccess("Expense created successfully!");
      }

      handleCloseModal();
      fetchExpenses();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error saving expense:", err);
      setError(err.response?.data?.message || "Failed to save expense");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (expenseId) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    try {
      setLoading(true);
      await expenseAPI.deleteExpense(expenseId);
      setSuccess("Expense deleted successfully!");
      fetchExpenses();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error deleting expense:", err);
      setError("Failed to delete expense");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      category_id: "",
      start_date: "",
      end_date: "",
      min_amount: "",
      max_amount: "",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const totalAmount = expenses.reduce(
    (sum, expense) => sum + parseFloat(expense.amount || 0),
    0
  );

  return (
    <Container className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="display-6 fw-bold text-primary">💰 Expenses</h1>
              <p className="text-muted">Manage your expenses</p>
            </div>
            <Button variant="primary" onClick={() => handleShowModal()}>
              ➕ Add Expense
            </Button>
          </div>
        </Col>
      </Row>

      {/* Alerts */}
      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" onClose={() => setSuccess("")} dismissible>
          {success}
        </Alert>
      )}

      {/* Filters */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">🔍 Filters</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Search</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search descriptions..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={filters.category_id}
                  onChange={(e) =>
                    handleFilterChange("category_id", e.target.value)
                  }
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Date Range</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="date"
                    placeholder="Start Date"
                    value={filters.start_date}
                    onChange={(e) =>
                      handleFilterChange("start_date", e.target.value)
                    }
                  />
                  <Form.Control
                    type="date"
                    placeholder="End Date"
                    value={filters.end_date}
                    onChange={(e) =>
                      handleFilterChange("end_date", e.target.value)
                    }
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Amount Range</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="number"
                    placeholder="Min Amount"
                    value={filters.min_amount}
                    onChange={(e) =>
                      handleFilterChange("min_amount", e.target.value)
                    }
                  />
                  <Form.Control
                    type="number"
                    placeholder="Max Amount"
                    value={filters.max_amount}
                    onChange={(e) =>
                      handleFilterChange("max_amount", e.target.value)
                    }
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={6} className="d-flex align-items-end">
              <Button variant="outline-secondary" onClick={clearFilters}>
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Summary */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center border-primary">
            <Card.Body>
              <h5>Total Expenses</h5>
              <h3 className="text-primary">{expenses.length}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center border-success">
            <Card.Body>
              <h5>Total Amount</h5>
              <h3 className="text-success">${totalAmount.toFixed(2)}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center border-info">
            <Card.Body>
              <h5>Average Amount</h5>
              <h3 className="text-info">
                $
                {expenses.length > 0
                  ? (totalAmount / expenses.length).toFixed(2)
                  : "0.00"}
              </h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Expenses Table */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">📋 Expense List</h5>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <div className="mt-2">Loading expenses...</div>
            </div>
          ) : expenses.length > 0 ? (
            <>
              <div className="table-responsive">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Category</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense) => (
                      <tr key={expense.id}>
                        <td>{expense.description}</td>
                        <td className="fw-bold text-primary">
                          ${parseFloat(expense.amount || 0).toFixed(2)}
                        </td>
                        <td>{new Date(expense.date).toLocaleDateString()}</td>
                        <td>
                          <Badge bg="secondary">
                            {expense.category?.name || "Unknown"}
                          </Badge>
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="outline-primary"
                            className="me-2"
                            onClick={() => handleShowModal(expense)}
                          >
                            ✏️
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDelete(expense.id)}
                          >
                            🗑️
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    <Pagination.First
                      onClick={() =>
                        setPagination((prev) => ({ ...prev, page: 1 }))
                      }
                      disabled={pagination.page === 1}
                    />
                    <Pagination.Prev
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: prev.page - 1,
                        }))
                      }
                      disabled={pagination.page === 1}
                    />

                    {[...Array(pagination.totalPages)].map((_, index) => {
                      const page = index + 1;
                      if (
                        page === 1 ||
                        page === pagination.totalPages ||
                        (page >= pagination.page - 2 &&
                          page <= pagination.page + 2)
                      ) {
                        return (
                          <Pagination.Item
                            key={page}
                            active={page === pagination.page}
                            onClick={() =>
                              setPagination((prev) => ({ ...prev, page }))
                            }
                          >
                            {page}
                          </Pagination.Item>
                        );
                      }
                      return null;
                    })}

                    <Pagination.Next
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: prev.page + 1,
                        }))
                      }
                      disabled={pagination.page === pagination.totalPages}
                    />
                    <Pagination.Last
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: pagination.totalPages,
                        }))
                      }
                      disabled={pagination.page === pagination.totalPages}
                    />
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-5">
              <div style={{ fontSize: "4rem" }}>💰</div>
              <h4>No expenses found</h4>
              <p className="text-muted">Start by adding your first expense!</p>
              <Button variant="primary" onClick={() => handleShowModal()}>
                ➕ Add Expense
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingExpense ? "✏️ Edit Expense" : "➕ Add Expense"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Description *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter expense description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    isInvalid={!!formErrors.description}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.description}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Amount *</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>$</InputGroup.Text>
                    <Form.Control
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          amount: e.target.value,
                        }))
                      }
                      isInvalid={!!formErrors.amount}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.amount}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, date: e.target.value }))
                    }
                    isInvalid={!!formErrors.date}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.date}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Category *</Form.Label>
                  <Form.Select
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category_id: e.target.value,
                      }))
                    }
                    isInvalid={!!formErrors.category_id}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {formErrors.category_id}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {editingExpense ? "Updating..." : "Creating..."}
                </>
              ) : editingExpense ? (
                "Update Expense"
              ) : (
                "Create Expense"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ExpensesPage;

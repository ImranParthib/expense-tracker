import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Alert,
  Spinner,
  Badge,
  Table,
} from "react-bootstrap";
import { categoryAPI } from "../services/api";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await categoryAPI.getCategories();
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name || "",
        description: category.description || "",
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
      });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: "",
      description: "",
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name?.trim()) {
      errors.name = "Category name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Category name must be at least 2 characters";
    }

    // Check for duplicate category names (case-insensitive)
    const existingCategory = categories.find(
      (cat) =>
        cat.name.toLowerCase() === formData.name.trim().toLowerCase() &&
        (!editingCategory || cat.id !== editingCategory.id)
    );

    if (existingCategory) {
      errors.name = "A category with this name already exists";
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

      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
      };

      if (editingCategory) {
        await categoryAPI.updateCategory(editingCategory.id, categoryData);
        setSuccess("Category updated successfully!");
      } else {
        await categoryAPI.createCategory(categoryData);
        setSuccess("Category created successfully!");
      }

      handleCloseModal();
      fetchCategories();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error saving category:", err);
      setError(err.response?.data?.message || "Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (categoryId) => {
    // Find the category to get its details
    const category = categories.find((cat) => cat.id === categoryId);

    if (!category) {
      setError("Category not found");
      return;
    }

    // Check if category has expenses
    if (category.expense_count > 0) {
      if (
        !window.confirm(
          `This category has ${category.expense_count} expense(s). Deleting it will remove the category association from those expenses. Are you sure you want to continue?`
        )
      ) {
        return;
      }
    } else {
      if (!window.confirm("Are you sure you want to delete this category?")) {
        return;
      }
    }

    try {
      setLoading(true);
      await categoryAPI.deleteCategory(categoryId);
      setSuccess("Category deleted successfully!");
      fetchCategories();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error deleting category:", err);
      setError(err.response?.data?.message || "Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryBadgeVariant = (expenseCount) => {
    if (expenseCount === 0) return "secondary";
    if (expenseCount < 5) return "primary";
    if (expenseCount < 10) return "success";
    return "warning";
  };

  return (
    <Container className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="display-6 fw-bold text-primary">📂 Categories</h1>
              <p className="text-muted">Organize your expenses by categories</p>
            </div>
            <Button variant="primary" onClick={() => handleShowModal()}>
              ➕ Add Category
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

      {/* Statistics */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center border-primary">
            <Card.Body>
              <h5>Total Categories</h5>
              <h3 className="text-primary">{categories.length}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center border-success">
            <Card.Body>
              <h5>Active Categories</h5>
              <h3 className="text-success">
                {categories.filter((cat) => cat.expense_count > 0).length}
              </h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center border-warning">
            <Card.Body>
              <h5>Total Expenses</h5>
              <h3 className="text-warning">
                {categories.reduce(
                  (sum, cat) => sum + (cat.expense_count || 0),
                  0
                )}
              </h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Categories Display */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <div className="mt-2">Loading categories...</div>
        </div>
      ) : categories.length > 0 ? (
        <>
          {/* Grid View */}
          <div className="d-block d-lg-none mb-4">
            <Row>
              {categories.map((category) => (
                <Col md={6} lg={4} key={category.id} className="mb-3">
                  <Card className="h-100 shadow-sm">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h5 className="mb-0">{category.name}</h5>
                        <Badge
                          bg={getCategoryBadgeVariant(category.expense_count)}
                        >
                          {category.expense_count || 0}
                        </Badge>
                      </div>

                      {category.description && (
                        <p className="text-muted small mb-3">
                          {category.description}
                        </p>
                      )}

                      <div className="mb-3">
                        <small className="text-muted">
                          Total Amount:{" "}
                          <strong className="text-success">
                            ${parseFloat(category.total_amount || 0).toFixed(2)}
                          </strong>
                        </small>
                      </div>

                      <div className="d-flex gap-2">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => handleShowModal(category)}
                        >
                          ✏️ Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDelete(category.id)}
                        >
                          🗑️ Delete
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

          {/* Table View */}
          <Card className="d-none d-lg-block">
            <Card.Header>
              <h5 className="mb-0">📋 Category List</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Expenses</th>
                      <th>Total Amount</th>
                      <th>Created Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td className="fw-bold">{category.name}</td>
                        <td className="text-muted">
                          {category.description || <em>No description</em>}
                        </td>
                        <td>
                          <Badge
                            bg={getCategoryBadgeVariant(category.expense_count)}
                          >
                            {category.expense_count || 0} expenses
                          </Badge>
                        </td>
                        <td className="fw-bold text-success">
                          ${parseFloat(category.total_amount || 0).toFixed(2)}
                        </td>
                        <td className="text-muted">
                          {category.created_at
                            ? new Date(category.created_at).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="outline-primary"
                            className="me-2"
                            onClick={() => handleShowModal(category)}
                          >
                            ✏️
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDelete(category.id)}
                          >
                            🗑️
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </>
      ) : (
        <Card>
          <Card.Body>
            <div className="text-center py-5">
              <div style={{ fontSize: "4rem" }}>📂</div>
              <h4>No categories found</h4>
              <p className="text-muted">
                Create your first category to start organizing your expenses!
              </p>
              <Button variant="primary" onClick={() => handleShowModal()}>
                ➕ Add Category
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCategory ? "✏️ Edit Category" : "➕ Add Category"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Category Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter category name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                isInvalid={!!formErrors.name}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.name}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter category description (optional)"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
              <Form.Text className="text-muted">
                Optional: Add a description to help identify this category
              </Form.Text>
            </Form.Group>

            {editingCategory && (
              <Alert variant="info">
                <strong>Current Stats:</strong>
                <br />
                Expenses: {editingCategory.expense_count || 0}
                <br />
                Total Amount: $
                {parseFloat(editingCategory.total_amount || 0).toFixed(2)}
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {editingCategory ? "Updating..." : "Creating..."}
                </>
              ) : editingCategory ? (
                "Update Category"
              ) : (
                "Create Category"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default CategoriesPage;

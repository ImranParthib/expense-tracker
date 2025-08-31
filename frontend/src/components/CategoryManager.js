import React, { useState } from "react";
import { Row, Col, Form, Button, Table, Alert } from "react-bootstrap";
import { categoryAPI } from "../services/api";

const CategoryManager = ({ categories, setCategories }) => {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      setError("Category name is required");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await categoryAPI.createCategory(newCategoryName.trim());
      setCategories([...categories, response.data]);
      setNewCategoryName("");
      setSuccess("Category added successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error adding category:", err);
      setError(err.response?.data?.error || "Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-card">
      <h3 className="section-title">
        <i className="fas fa-tags"></i>
        Manage Categories
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

      <Form onSubmit={handleAddCategory}>
        <Row className="align-items-end">
          <Col md={8}>
            <Form.Group>
              <Form.Label>Category Name</Form.Label>
              <Form.Control
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name (e.g., Food, Transport, Entertainment)"
                disabled={loading}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Button
              variant="primary"
              type="submit"
              disabled={loading}
              className="w-100"
            >
              {loading ? "Adding..." : "Add Category"}
            </Button>
          </Col>
        </Row>
      </Form>

      {categories.length > 0 && (
        <Table striped bordered hover className="mt-4">
          <thead>
            <tr>
              <th>ID</th>
              <th>Category Name</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>{category.id}</td>
                <td>{category.name}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {categories.length === 0 && (
        <div className="no-data">
          No categories found. Add your first category above!
        </div>
      )}
    </div>
  );
};

export default CategoryManager;

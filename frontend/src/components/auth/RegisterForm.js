import React, { useState } from "react";
import { Form, Button, Alert, Card, Row, Col, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const RegisterForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [validated, setValidated] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const { register, loading, error } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Check password match on confirm password change
    if (name === "confirmPassword" || name === "password") {
      const password = name === "password" ? value : formData.password;
      const confirmPassword =
        name === "confirmPassword" ? value : formData.confirmPassword;
      setPasswordMatch(password === confirmPassword);
    }
  };

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid:
        minLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumbers &&
        hasSpecialChar,
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    if (form.checkValidity() === false || !passwordMatch) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    const userData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      username: formData.username,
      password: formData.password,
    };

    const result = await register(userData);
    if (result.success && onSuccess) {
      onSuccess();
    }
  };

  const passwordValidation = validatePassword(formData.password);

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-success text-white text-center">
        <h4 className="mb-0">Create Account</h4>
        <small>Join us to start tracking your expenses</small>
      </Card.Header>
      <Card.Body className="p-4">
        {error && (
          <Alert variant="danger" className="mb-3">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </Alert>
        )}

        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="Enter your first name"
                />
                <Form.Control.Feedback type="invalid">
                  Please provide your first name.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Enter your last name"
                />
                <Form.Control.Feedback type="invalid">
                  Please provide your last name.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
            <Form.Control.Feedback type="invalid">
              Please provide a valid email address.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              minLength={3}
              placeholder="Choose a username"
            />
            <Form.Control.Feedback type="invalid">
              Username must be at least 3 characters long.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              isInvalid={validated && !passwordValidation.isValid}
              placeholder="Create a strong password"
            />
            <Form.Control.Feedback type="invalid">
              Password must meet all requirements below.
            </Form.Control.Feedback>

            {formData.password && (
              <div className="mt-2">
                <small className="text-muted">Password requirements:</small>
                <ul
                  className="list-unstyled mt-1"
                  style={{ fontSize: "0.8rem" }}
                >
                  <li
                    className={
                      passwordValidation.minLength
                        ? "text-success"
                        : "text-danger"
                    }
                  >
                    <i
                      className={`bi ${
                        passwordValidation.minLength
                          ? "bi-check-circle-fill"
                          : "bi-x-circle-fill"
                      } me-1`}
                    ></i>
                    At least 8 characters
                  </li>
                  <li
                    className={
                      passwordValidation.hasUpperCase
                        ? "text-success"
                        : "text-danger"
                    }
                  >
                    <i
                      className={`bi ${
                        passwordValidation.hasUpperCase
                          ? "bi-check-circle-fill"
                          : "bi-x-circle-fill"
                      } me-1`}
                    ></i>
                    One uppercase letter
                  </li>
                  <li
                    className={
                      passwordValidation.hasLowerCase
                        ? "text-success"
                        : "text-danger"
                    }
                  >
                    <i
                      className={`bi ${
                        passwordValidation.hasLowerCase
                          ? "bi-check-circle-fill"
                          : "bi-x-circle-fill"
                      } me-1`}
                    ></i>
                    One lowercase letter
                  </li>
                  <li
                    className={
                      passwordValidation.hasNumbers
                        ? "text-success"
                        : "text-danger"
                    }
                  >
                    <i
                      className={`bi ${
                        passwordValidation.hasNumbers
                          ? "bi-check-circle-fill"
                          : "bi-x-circle-fill"
                      } me-1`}
                    ></i>
                    One number
                  </li>
                  <li
                    className={
                      passwordValidation.hasSpecialChar
                        ? "text-success"
                        : "text-danger"
                    }
                  >
                    <i
                      className={`bi ${
                        passwordValidation.hasSpecialChar
                          ? "bi-check-circle-fill"
                          : "bi-x-circle-fill"
                      } me-1`}
                    ></i>
                    One special character
                  </li>
                </ul>
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              isInvalid={validated && !passwordMatch}
              placeholder="Confirm your password"
            />
            <Form.Control.Feedback type="invalid">
              Passwords do not match.
            </Form.Control.Feedback>
          </Form.Group>

          <Button
            variant="success"
            type="submit"
            size="lg"
            className="w-100 mb-3"
            disabled={loading || !passwordValidation.isValid || !passwordMatch}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  className="me-2"
                />
                Creating Account...
              </>
            ) : (
              <>
                <i className="bi bi-person-plus me-2"></i>
                Create Account
              </>
            )}
          </Button>
        </Form>
      </Card.Body>
      <Card.Footer className="text-center bg-light">
        <small className="text-muted">
          Already have an account?{" "}
          <Link to="/login" className="text-primary text-decoration-none">
            Sign in here
          </Link>
        </small>
      </Card.Footer>
    </Card>
  );
};

export default RegisterForm;

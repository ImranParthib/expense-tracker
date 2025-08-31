import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  Spinner,
  Tab,
  Tabs,
  Badge,
  Modal,
} from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { authAPI } from "../services/api";

const ProfilePage = () => {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Profile form data
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  // Password form data
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const validateProfileForm = () => {
    const errors = {};

    if (!profileData.first_name?.trim()) {
      errors.first_name = "First name is required";
    }

    if (!profileData.last_name?.trim()) {
      errors.last_name = "Last name is required";
    }

    if (!profileData.email?.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      errors.email = "Email format is invalid";
    }

    return errors;
  };

  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordData.current_password) {
      errors.current_password = "Current password is required";
    }

    if (!passwordData.new_password) {
      errors.new_password = "New password is required";
    } else if (passwordData.new_password.length < 6) {
      errors.new_password = "Password must be at least 6 characters";
    }

    if (!passwordData.confirm_password) {
      errors.confirm_password = "Please confirm your new password";
    } else if (passwordData.new_password !== passwordData.confirm_password) {
      errors.confirm_password = "Passwords do not match";
    }

    return errors;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    const errors = validateProfileForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setFormErrors({});

      const response = await authAPI.updateProfile({
        first_name: profileData.first_name.trim(),
        last_name: profileData.last_name.trim(),
        email: profileData.email.trim(),
      });

      // Update the auth context with new user data
      if (response.data.user) {
        await login(response.data.user, localStorage.getItem("token"));
      }

      setSuccess("Profile updated successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    const errors = validatePasswordForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setFormErrors({});

      await authAPI.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });

      setSuccess("Password changed successfully!");

      // Clear password form
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error changing password:", err);
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      setError("");

      await authAPI.deleteAccount();

      // The AuthContext will handle logout automatically
      window.location.href = "/";
    } catch (err) {
      console.error("Error deleting account:", err);
      setError(err.response?.data?.message || "Failed to delete account");
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0)
      return { strength: 0, text: "", color: "secondary" };
    if (password.length < 6)
      return { strength: 25, text: "Weak", color: "danger" };
    if (password.length < 8)
      return { strength: 50, text: "Fair", color: "warning" };
    if (password.length < 12)
      return { strength: 75, text: "Good", color: "info" };
    return { strength: 100, text: "Strong", color: "success" };
  };

  const passwordStrength = getPasswordStrength(passwordData.new_password);

  return (
    <Container className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h1 className="display-6 fw-bold text-primary">
            👤 Profile Settings
          </h1>
          <p className="text-muted">
            Manage your account information and preferences
          </p>
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

      <Row>
        <Col lg={8} className="mx-auto">
          <Card className="shadow-sm">
            <Card.Body>
              <Tabs
                activeKey={activeTab}
                onSelect={(tab) => setActiveTab(tab)}
                className="mb-4"
              >
                {/* Profile Information Tab */}
                <Tab eventKey="profile" title="👤 Profile Information">
                  <Form onSubmit={handleProfileSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>First Name *</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter your first name"
                            value={profileData.first_name}
                            onChange={(e) =>
                              setProfileData((prev) => ({
                                ...prev,
                                first_name: e.target.value,
                              }))
                            }
                            isInvalid={!!formErrors.first_name}
                          />
                          <Form.Control.Feedback type="invalid">
                            {formErrors.first_name}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Last Name *</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter your last name"
                            value={profileData.last_name}
                            onChange={(e) =>
                              setProfileData((prev) => ({
                                ...prev,
                                last_name: e.target.value,
                              }))
                            }
                            isInvalid={!!formErrors.last_name}
                          />
                          <Form.Control.Feedback type="invalid">
                            {formErrors.last_name}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-4">
                      <Form.Label>Email Address *</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter your email address"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        isInvalid={!!formErrors.email}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.email}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <div className="d-grid">
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={loading}
                        size="lg"
                      >
                        {loading ? (
                          <>
                            <Spinner
                              animation="border"
                              size="sm"
                              className="me-2"
                            />
                            Updating Profile...
                          </>
                        ) : (
                          "Update Profile"
                        )}
                      </Button>
                    </div>
                  </Form>
                </Tab>

                {/* Change Password Tab */}
                <Tab eventKey="password" title="🔒 Change Password">
                  <Form onSubmit={handlePasswordSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Current Password *</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Enter your current password"
                        value={passwordData.current_password}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            current_password: e.target.value,
                          }))
                        }
                        isInvalid={!!formErrors.current_password}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.current_password}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>New Password *</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Enter your new password"
                        value={passwordData.new_password}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            new_password: e.target.value,
                          }))
                        }
                        isInvalid={!!formErrors.new_password}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.new_password}
                      </Form.Control.Feedback>

                      {passwordData.new_password && (
                        <div className="mt-2">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <small className="text-muted">
                              Password Strength:
                            </small>
                            <Badge bg={passwordStrength.color}>
                              {passwordStrength.text}
                            </Badge>
                          </div>
                          <div className="progress" style={{ height: "4px" }}>
                            <div
                              className={`progress-bar bg-${passwordStrength.color}`}
                              style={{ width: `${passwordStrength.strength}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Confirm New Password *</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Confirm your new password"
                        value={passwordData.confirm_password}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            confirm_password: e.target.value,
                          }))
                        }
                        isInvalid={!!formErrors.confirm_password}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.confirm_password}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <div className="d-grid">
                      <Button
                        variant="warning"
                        type="submit"
                        disabled={loading}
                        size="lg"
                      >
                        {loading ? (
                          <>
                            <Spinner
                              animation="border"
                              size="sm"
                              className="me-2"
                            />
                            Changing Password...
                          </>
                        ) : (
                          "Change Password"
                        )}
                      </Button>
                    </div>
                  </Form>
                </Tab>

                {/* Account Information Tab */}
                <Tab eventKey="account" title="📊 Account Info">
                  <div className="text-center mb-4">
                    <div
                      className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                      style={{
                        width: "80px",
                        height: "80px",
                        fontSize: "2rem",
                      }}
                    >
                      {user?.first_name?.charAt(0)}
                      {user?.last_name?.charAt(0)}
                    </div>
                    <h4 className="mt-3">
                      {user?.first_name} {user?.last_name}
                    </h4>
                    <p className="text-muted">{user?.email}</p>
                  </div>

                  <Row className="text-center">
                    <Col md={6}>
                      <Card className="border-0 bg-light">
                        <Card.Body>
                          <h5 className="text-primary">Account Created</h5>
                          <p className="mb-0">
                            {user?.created_at
                              ? new Date(user.created_at).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )
                              : "N/A"}
                          </p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card className="border-0 bg-light">
                        <Card.Body>
                          <h5 className="text-success">Account Status</h5>
                          <Badge bg="success" className="fs-6">
                            Active
                          </Badge>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  <hr className="my-4" />

                  <div className="text-center">
                    <h5 className="text-danger mb-3">⚠️ Danger Zone</h5>
                    <p className="text-muted mb-3">
                      Once you delete your account, there is no going back.
                      Please be certain.
                    </p>
                    <Button
                      variant="outline-danger"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      🗑️ Delete Account
                    </Button>
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Delete Account Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">⚠️ Delete Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <strong>Warning:</strong> This action cannot be undone!
          </Alert>
          <p>
            Are you sure you want to delete your account? This will permanently
            remove:
          </p>
          <ul>
            <li>Your profile information</li>
            <li>All your expenses</li>
            <li>All your categories</li>
            <li>All associated data</li>
          </ul>
          <p className="text-muted">
            Type <strong>DELETE</strong> to confirm this action.
          </p>
          <Form.Control
            type="text"
            placeholder="Type DELETE to confirm"
            onChange={(e) => {
              // Enable delete button only if user types "DELETE"
              const deleteButton = document.getElementById(
                "confirmDeleteButton"
              );
              if (deleteButton) {
                deleteButton.disabled = e.target.value !== "DELETE";
              }
            }}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            id="confirmDeleteButton"
            variant="danger"
            disabled={true}
            onClick={handleDeleteAccount}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              "Delete Account"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProfilePage;

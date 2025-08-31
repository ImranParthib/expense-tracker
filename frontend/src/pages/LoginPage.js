import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoginForm from "../components/auth/LoginForm";

const LoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect authenticated users to dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleLoginSuccess = () => {
    navigate("/dashboard");
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <div className="text-center mb-4">
            <h1 className="text-primary">Welcome Back</h1>
            <p className="text-muted">
              Sign in to continue to your expense tracker
            </p>
          </div>
          <LoginForm onSuccess={handleLoginSuccess} />
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;

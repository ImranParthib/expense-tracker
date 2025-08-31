import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import RegisterForm from "../components/auth/RegisterForm";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect authenticated users to dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleRegisterSuccess = () => {
    navigate("/dashboard");
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <div className="text-center mb-4">
            <h1 className="text-success">Create Your Account</h1>
            <p className="text-muted">
              Join us and start tracking your expenses today
            </p>
          </div>
          <RegisterForm onSuccess={handleRegisterSuccess} />
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;

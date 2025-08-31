import React from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect authenticated users to dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section bg-primary text-white py-5">
        <Container>
          <Row className="align-items-center min-vh-75">
            <Col lg={6}>
              <h1 className="display-4 fw-bold mb-4">
                Take Control of Your Finances
              </h1>
              <p className="lead mb-4">
                Track expenses, manage categories, and gain insights into your
                spending habits with our powerful and intuitive expense tracking
                application.
              </p>
              <div className="d-flex gap-3">
                <Button
                  variant="light"
                  size="lg"
                  onClick={() => navigate("/register")}
                >
                  Get Started Free
                </Button>
                <Button
                  variant="outline-light"
                  size="lg"
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </Button>
              </div>
            </Col>
            <Col lg={6} className="text-center">
              <div className="hero-image">
                <div className="bg-light rounded-3 p-5 text-dark">
                  <h2 className="text-primary mb-3">📊 Dashboard Preview</h2>
                  <div className="d-flex justify-content-around mb-3">
                    <div className="text-center">
                      <div className="text-success fs-4">$2,450</div>
                      <small>Monthly Budget</small>
                    </div>
                    <div className="text-center">
                      <div className="text-warning fs-4">$1,890</div>
                      <small>Spent This Month</small>
                    </div>
                    <div className="text-center">
                      <div className="text-info fs-4">$560</div>
                      <small>Remaining</small>
                    </div>
                  </div>
                  <div className="text-muted">Real-time expense tracking</div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section py-5">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="display-5 fw-bold mb-3">
                Why Choose ExpenseTracker Pro?
              </h2>
              <p className="lead text-muted">
                Built with modern technology and designed for ease of use
              </p>
            </Col>
          </Row>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div
                    className="text-primary mb-3"
                    style={{ fontSize: "3rem" }}
                  >
                    🔒
                  </div>
                  <Card.Title>Secure & Private</Card.Title>
                  <Card.Text>
                    Your financial data is protected with enterprise-grade
                    security and JWT authentication.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div
                    className="text-success mb-3"
                    style={{ fontSize: "3rem" }}
                  >
                    📱
                  </div>
                  <Card.Title>Mobile Responsive</Card.Title>
                  <Card.Text>
                    Access your expenses anywhere, anytime with our fully
                    responsive design that works on all devices.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="text-info mb-3" style={{ fontSize: "3rem" }}>
                    ⚡
                  </div>
                  <Card.Title>Real-time Updates</Card.Title>
                  <Card.Text>
                    See your expense data update instantly with our fast and
                    efficient backend API.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section bg-light py-5">
        <Container>
          <Row className="text-center">
            <Col>
              <h2 className="mb-3">Ready to Start Tracking?</h2>
              <p className="lead mb-4">
                Join thousands of users who have taken control of their finances
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate("/register")}
              >
                Create Your Free Account
              </Button>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default LandingPage;

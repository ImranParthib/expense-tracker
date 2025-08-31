import React from "react";
import {
  Navbar as BootstrapNavbar,
  Nav,
  NavDropdown,
  Container,
  Button,
} from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/">
          💰 ExpenseTracker Pro
        </BootstrapNavbar.Brand>

        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          {isAuthenticated ? (
            <>
              <Nav className="me-auto">
                <Nav.Link
                  as={Link}
                  to="/dashboard"
                  className={isActiveLink("/dashboard") ? "active" : ""}
                >
                  🏠 Dashboard
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/expenses"
                  className={isActiveLink("/expenses") ? "active" : ""}
                >
                  💰 Expenses
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/categories"
                  className={isActiveLink("/categories") ? "active" : ""}
                >
                  📂 Categories
                </Nav.Link>
              </Nav>

              <Nav>
                <NavDropdown
                  title={`👤 ${user?.first_name || "User"}`}
                  id="user-dropdown"
                  align="end"
                >
                  <NavDropdown.Item as={Link} to="/profile">
                    👤 Profile
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    🚪 Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </>
          ) : (
            <Nav className="ms-auto">
              <Nav.Link
                as={Link}
                to="/login"
                className={isActiveLink("/login") ? "active" : ""}
              >
                🔑 Login
              </Nav.Link>
              <Button
                as={Link}
                to="/register"
                variant="outline-light"
                size="sm"
                className="ms-2"
              >
                ✨ Sign Up
              </Button>
            </Nav>
          )}
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;

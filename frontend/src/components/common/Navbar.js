import React from 'react';
import { Navbar as BootstrapNavbar, Nav, NavDropdown, Container, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
      <Container>
        <LinkContainer to="/">
          <BootstrapNavbar.Brand>
            <i className="bi bi-wallet2 me-2"></i>
            ExpenseTracker Pro
          </BootstrapNavbar.Brand>
        </LinkContainer>
        
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          {isAuthenticated ? (
            <>
              <Nav className="me-auto">
                <LinkContainer to="/dashboard">
                  <Nav.Link>
                    <i className="bi bi-speedometer2 me-1"></i>
                    Dashboard
                  </Nav.Link>
                </LinkContainer>
                <LinkContainer to="/expenses">
                  <Nav.Link>
                    <i className="bi bi-receipt me-1"></i>
                    Expenses
                  </Nav.Link>
                </LinkContainer>
                <LinkContainer to="/categories">
                  <Nav.Link>
                    <i className="bi bi-tags me-1"></i>
                    Categories
                  </Nav.Link>
                </LinkContainer>
              </Nav>
              
              <Nav>
                <NavDropdown
                  title={
                    <>
                      <i className="bi bi-person-circle me-1"></i>
                      {user?.first_name || 'User'}
                    </>
                  }
                  id="user-dropdown"
                  align="end"
                >
                  <LinkContainer to="/profile">
                    <NavDropdown.Item>
                      <i className="bi bi-person me-2"></i>
                      Profile
                    </NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </>
          ) : (
            <Nav className="ms-auto">
              <LinkContainer to="/login">
                <Nav.Link>
                  <Button variant="outline-light" size="sm">
                    <i className="bi bi-box-arrow-in-right me-1"></i>
                    Sign In
                  </Button>
                </Nav.Link>
              </LinkContainer>
              <LinkContainer to="/register">
                <Nav.Link>
                  <Button variant="primary" size="sm" className="ms-2">
                    <i className="bi bi-person-plus me-1"></i>
                    Sign Up
                  </Button>
                </Nav.Link>
              </LinkContainer>
            </Nav>
          )}
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;

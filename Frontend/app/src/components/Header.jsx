import React, { useState, useEffect } from "react";
import { LinkContainer } from "react-router-bootstrap";
import { NavDropdown, Nav, Navbar, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Header = () => {
   const [user, setUser] = useState(null)
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
    // navigate("/login");
    window.location.reload();
  
  };


  return (
    <header>
      <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>Social Media App</Navbar.Brand>
          </LinkContainer>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <LinkContainer to="/">
                <Nav.Link>Home</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/chats">
                <Nav.Link>chats</Nav.Link>
              </LinkContainer>
            </Nav>

            <Nav>
              {user ? (
                <NavDropdown title={`Welcome ${user.username}`} id="user-dropdown">
                  <LinkContainer to="/profile">
                    <NavDropdown.Item>Profile</NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={logoutHandler}>Logout</NavDropdown.Item>
                </NavDropdown>
              ) : (
                <NavDropdown title="Account" id="account-dropdown">
                  <LinkContainer to="/login">
                    <NavDropdown.Item>Login</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/signin">
                    <NavDropdown.Item>Signup</NavDropdown.Item>
                  </LinkContainer>
                </NavDropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;

import React, { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlane,
  faBell,
  faSignOutAlt,
  faUser,
  faMessage,
  faHome,
  faJoint,
} from "@fortawesome/free-solid-svg-icons";
import { MyDispatchContext, MyUserContext } from "../configs/ContextEmployee";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container } from "react-bootstrap";
import "./header.css"; // Import custom CSS

const HeaderNV = () => {
  const user = useContext(MyUserContext);
  const navigate = useNavigate();
  const dispatch = useContext(MyDispatchContext);

  const handleLogout = () => {
    dispatch({ type: "logout" });
    navigate("/login");
  };

  return (
    <Navbar className="custom-navbar" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <FontAwesomeIcon icon={faJoint} size="2x" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto pd-20">
            <Nav.Link as={Link} to="/login">
              <FontAwesomeIcon icon={faHome} /> Trang Chu
            </Nav.Link>
            <Nav.Link as={Link} to="/notifications">
              <FontAwesomeIcon icon={faBell} /> Thông Báo
            </Nav.Link>

            <Nav.Link as={Link} to="/chatNV">
              <FontAwesomeIcon icon={faMessage} /> Message
            </Nav.Link>
            <Nav className="ml-100" style={{ marginLeft: "600px" }}>
              {user && (
                <>
                  <Nav.Item className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faUser} size="lg" className="mr-2" />
                    <span>Welcome, {user.username}</span>
                  </Nav.Item>
                  <Nav.Link as={Link} to="/login" onClick={handleLogout}>
                    <FontAwesomeIcon icon={faSignOutAlt} /> Đăng xuất
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default HeaderNV;

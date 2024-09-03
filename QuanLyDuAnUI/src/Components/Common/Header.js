import React, { useEffect, useRef, useState } from "react";
import { Navbar, Nav, Container, Image, Modal, Button } from "react-bootstrap";
import {
  FaShoppingCart,
  FaSignOutAlt,
  FaMotorcycle,
  FaEdit,
  FaTrashAlt,
} from "react-icons/fa"; // Import icon giỏ hàng từ react-icons
import "./Static/Styles.css";
import "./Static/header.css";
import { StyledNavbar } from "./style";
import cookies from "react-cookies";
import MySpinner from "./Spiner";
import { useNavigate } from "react-router-dom";
import { authApi, endpoints } from "../../config/APIs";

const Header = ({
  cart,
  countCart,
  page,
  setPage,
  loadingCart,
  setLoadingCart,
}) => {
  const user_cur = useRef(null);
  const [loading, setLoading] = useState(false);
  const [lgShow, setLgShow] = useState(false);

  const nav = useNavigate();

  const isCloseToBottom = (element) => {
    console.log("isCloseToBottom", element);
    const { scrollHeight, scrollTop, clientHeight } = element;
    return scrollHeight - scrollTop <= clientHeight + 20; // 20px buffer
  };

  // Xử lý sự kiện cuộn để tải thêm dữ liệu
  const handleScroll = (e) => {
    if (!loadingCart && page > 0 && isCloseToBottom(e.target)) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const delCart = async (post_id) => {
    try {
      let token = await cookies.load("access-token");
      let res = await authApi(token).delete(endpoints["delete-cart"](post_id));
      console.log("cart", res.data);
    } catch (ex) {
      console.error(ex);
    } finally {
      setPage(1);
    }
  };
  useEffect(() => {
    // Tạo thẻ script và thêm nó vào DOM
    const script = document.createElement("script");
    script.src = `${process.env.PUBLIC_URL}/finisher-header.es5.min.js`;
    script.async = true;
    script.onload = () => {
      // Khởi tạo FinisherHeader sau khi script đã được tải
      if (window.FinisherHeader) {
        new window.FinisherHeader({
          count: 12,
          size: {
            min: 1300,
            max: 1500,
            pulse: 0,
          },
          speed: {
            x: {
              min: 0.6,
              max: 3,
            },
            y: {
              min: 0.6,
              max: 3,
            },
          },
          colors: {
            background: "#953eff",
            particles: ["#ff681c", "#87ddfe", "#1ed6fe", "#ff0a53"],
          },
          blending: "overlay",
          opacity: {
            center: 0.6,
            edge: 0,
          },
          skew: 0,
          shapes: ["c"],
        });
      }
    };

    document.body.appendChild(script);

    // Dọn dẹp script khi component bị unmount
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const loadUser = () => {
    user_cur.current = cookies.load("user");
    // console.log('user_cur.current:', user_cur.current);
    setLoading(true);
  };
  const handleLogout = () => {
    new Promise((resolve, reject) => {
      setTimeout(() => {
        cookies.remove("user"); // Xóa cookie
        resolve(); // Xác nhận hoàn thành xóa cookie
      }, 1000); // Độ trễ 1 giây
    })
      .then(() => {
        nav("/"); // Điều hướng sau khi cookie đã bị xóa
      })
      .catch((error) => {
        console.error("Logout failed: ", error);
      });
  };

  useEffect(() => {
    loadUser();
  }, []);
  return (
    <>
      <div
        className="header finisher-header"
        style={{ width: "100%", height: "100px" }}
      >
        <Navbar bg="transparent" variant="dark" expand="lg">
          <Container>
            <Navbar.Brand>Du Lịch</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <StyledNavbar className="me-auto">
                <Nav.Link href="/Home">Home</Nav.Link>
                <Nav.Link href="/news">Tin Tức</Nav.Link>
                <Nav.Link href="#home">Lịch Khởi Hành </Nav.Link>
                <Nav.Link href="#contact">Danh Mục</Nav.Link>
                <div className="animation"></div>
              </StyledNavbar>

              <Nav>
                {user_cur.current === null ? (
                  <MySpinner animation="grow" size="sm" />
                ) : (
                  <>
                    <Image
                      src={user_cur.current.avatar}
                      roundedCircle
                      style={{ width: "30px", marginRight: "10px" }}
                    />
                    <span className="text-light">
                      {user_cur.current.username}
                    </span>
                  </>
                )}
              </Nav>
              <div
                href="#cart"
                style={{
                  cursor: "pointer",
                  marginLeft: 20,
                  marginRight: 20,
                  position: "relative",
                }}
              >
                <FaShoppingCart
                  size={20}
                  color="white"
                  onClick={() => setLgShow(true)}
                />
                {countCart > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -10,
                      right: -10,
                      backgroundColor: "red",
                      color: "white",
                      borderRadius: "50%",
                      padding: "2px 6px",
                      fontSize: "10px",
                      fontWeight: "bold",
                    }}
                  >
                    {countCart}
                  </span>
                )}
              </div>
              <FaSignOutAlt size={20} color="white" onClick={handleLogout} />
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </div>
      <Modal
        size="lg"
        show={lgShow}
        onHide={() => setLgShow(false)}
        aria-labelledby="example-modal-sizes-title-lg"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-modal-sizes-title-lg">Giỏ hàng</Modal.Title>
        </Modal.Header>
        {countCart == 0 ? (
          <h1>không có gì trong giỏ hàng</h1>
        ) : (
          <Modal.Body
            className="modal-body-scroll"
            onScroll={(e) => handleScroll(e)}
          >
            <div>
              {!loading ? (
                <MySpinner />
              ) : (
                cart.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: 10,
                      display: "flex",
                      justifyContent: "space-around",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      src={item.pic[0].picture}
                      style={{ width: 100, height: 100 }}
                    />
                    <span>
                      Nơi đi: {item.journey.id_tuyenDuong.id_noiDi.diaChi}{" "}
                    </span>
                    <span>
                      ---------------
                      <FaMotorcycle />
                      -------------
                    </span>
                    <span>
                      Nơi đến: {item.journey.id_tuyenDuong.id_noiDen.diaChi}{" "}
                    </span>
                    <div>
                      <Button variant="danger" onClick={() => delCart(item.id)}>
                        <FaTrashAlt size={24} color="black" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
              {loadingCart && <MySpinner />}
            </div>
          </Modal.Body>
        )}
      </Modal>
    </>
  );
};

export default Header;

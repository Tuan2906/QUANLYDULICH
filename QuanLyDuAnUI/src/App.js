import Home from "./Components/Home/Home";
import PostDetail from "./Components/Home/PostDetail";
import PaymentForm from "./Components/Payment/PayMomo";
import Header from "./Components/Common/Header";
import Footer from "./Components/Common/Footer";
import { authApi, endpoints } from "./config/APIs";
import "./App.css";
import React, { useEffect, useReducer, useState, useRef } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import LoginNV from "./UserNhanVien/login";
import Login from "./Components/User/Login/Login";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container } from "react-bootstrap";
import StaffPage from "./ThanhToan/Payment";
import PaymentPage from "./ThanhToan/Payment";
import SuccessPage from "./ThanhToan/Suceess";
import JourneyTable from "./PostEmployee/PostTable";
import PostForm from "./PostEmployee/PostDieuHuong";

import cookie from "react-cookies";
import MyUserReducer from "./configs/ReducerEmployee";
import { MyDispatchContext, MyUserContext } from "./configs/ContextEmployee";
import PassengerForm from "./ThanhToan/ThongTinUserThamQuan";
import HeaderNV from "./PostEmployee/header";
import FooterNV from "./PostEmployee/footer";
import NewsPostForm from "./Components/CreateNews";
import PostNews from "./Components/PostNews";
import Conversation from "./Components/Conversation";
import Chat from "./Components/Chat";
import NewsDetails from "./Components/PostNewsDetail";

const Main = ({ user }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/";
  const isLoginPageNV = location.pathname === "/login";
  const [cart, setCart] = useState([]);
  const [countCart, setCountCart] = useState(null);
  const [update, setUpdate] = useState(true);
  const [loadingCart, setLoadingCart] = useState(false);
  const [page, setPage] = useState(1);
  const [formComplete, setFormCompleted] = useState(false);
  const getCart = async () => {
    // if (loadingCart) return;
    setLoadingCart(true);
    if (page < 0) return;
    try {
      let token = await cookie.load("access-token");
      let res = await authApi(token).get(endpoints["cart"], {
        params: { page },
      });
      console.log("cart", res.data);
      if (page === 1) setCart(res.data.results);
      else if (page > 1)
        setCart((prevCart) => [...prevCart, ...res.data.results]);
      if (res.data.next === null) setPage(0);
      setCountCart(res.data.count);
    } catch (ex) {
      console.error(ex);
    } finally {
      setTimeout(() => {
        setLoadingCart(false);
      }, 3000);
    }
  };
  const ProtectedRoute = ({ isFormCompleted, children }) => {
    return isFormCompleted ? children : <Navigate to="/loginStaff" />;
  };

  useEffect(() => {
    getCart();
  }, [update, page]);

  return (
    <>
      {console.log("user", user)}

      {!isLoginPageNV && !isLoginPage && user === null && (
        <Header
          cart={cart}
          countCart={countCart}
          page={page}
          setPage={setPage}
          loadingCart={loadingCart}
          setLoadingCart={setLoadingCart}
        />
      )}
      {!isLoginPageNV && (
        <Container style={{ marginTop: 100 }}>
          <Routes>
            <Route path="/Home" element={<Home />} />
            <Route
              path="/Home/detail/:post_id"
              element={
                <PostDetail
                  update={update}
                  setUpdate={setUpdate}
                  setCountCard={setCountCart}
                />
              }
            />
            <Route path="/PayMomo" element={<PaymentForm />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/" element={<Login />} />
            <Route path="/nhapthongtin" element={<PassengerForm />} />
            <Route path="/thanhtoan" element={<PaymentPage />} />
            <Route path="/news" element={<PostNews />} />
            <Route path="/news/:cate/" element={<PostNews />} />
            <Route path="/chat" element={<Conversation />} />
            <Route path="/chat/:conversationId/" element={<Chat />} />
            <Route path="/news/details/:postId" element={<NewsDetails />} />

          </Routes>
        </Container>
      )}
      {!isLoginPageNV && !isLoginPage && user === null && <Footer />}

      {(isLoginPageNV || user !== null) && (
        <Container>
          <HeaderNV />
          <Routes>
            <Route path="/login" element={<LoginNV />} />
            <Route path="/journeys" element={<JourneyTable />} />
            <Route path="/postDieuHuong" element={<PostForm />} />
            <Route path="/chatNV" element={<Conversation />} />
            <Route path="/chatNV/:conversationId" element={<Chat />} />
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/news/create/" element={<NewsPostForm />} />
          </Routes>
          <FooterNV />
        </Container>
      )}
    </>
  );
};
function App() {
  const [user, dispatch] = useReducer(
    MyUserReducer,
    localStorage.getItem("user") || null
  );

  return (
    <Router>
      <MyUserContext.Provider value={user}>
        <MyDispatchContext.Provider value={dispatch}>
          <Main user={user} />
        </MyDispatchContext.Provider>
      </MyUserContext.Provider>
    </Router>
  );
}

export default App;

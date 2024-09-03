import React, { useEffect, useReducer, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Login from "./UserNhanVien/login";
// import JourneyTable from './XetDuyetBaiDang/JourneyTable';
import StaffPage from "./ThanhToan/Payment";
import PaymentPage from "./ThanhToan/Payment";
import SuccessPage from "./ThanhToan/Suceess";
import JourneyTable from "./PostEmployee/PostTable";
import PostForm from "./PostEmployee/PostDieuHuong";

import cookie from "react-cookies";
import MyUserReducer from "./configs/ReducerEmployee";
import { MyDispatchContext, MyUserContext } from "./configs/ContextEmployee";
import PassengerForm from "./ThanhToan/ThongTinUserThamQuan";
import Header from "./PostEmployee/header";
import Footer from "./PostEmployee/footer";

const App = () => {
  const [user, dispatch] = useReducer(
    MyUserReducer,
    cookie.load("user") || null
  );
  const [formComplete, setFormCompleted] = useState(false);
  const tour = {
    id: 1,
    title: "Tour du lịch ABC",
    departure: "Hà Nội",
    destination: "Hạ Long",
    price: 500, // Giá tính bằng USD
  };
  const sl = {
    sl_NguoiLon: 1,
    sl_TreEm: 1,
  };
  return (
    <Router>
      <MyUserContext.Provider value={user}>
        <MyDispatchContext.Provider value={dispatch}>
          <Header />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/journeys" element={<JourneyTable />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/postDieuHuong" element={<PostForm />} />

            <Route
              path="/loginStaff"
              element={
                <PassengerForm
                  sl={sl}
                  tong={500000}
                  setFormCompleted={setFormCompleted}
                />
              }
            />
            <Route
              path="/thanhtoan"
              element={
                <ProtectedRoute isFormCompleted={formComplete}>
                  <PaymentPage tour={tour} />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/chat" element={<Conversation />} />
            <Route path="/chat/:conversationId/" element={<Chat />} />
            <Route path="/news" element={<PostNews />} />
            <Route path="/news/details/:id" element={<PostNews />} />
          </Routes>
          <Footer />
        </MyDispatchContext.Provider>
      </MyUserContext.Provider>
    </Router>
  );
};
const ProtectedRoute = ({ isFormCompleted, children }) => {
  return isFormCompleted ? children : <Navigate to="/loginStaff" />;
};

export default App;

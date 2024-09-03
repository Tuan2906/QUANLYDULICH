// components/PostDetail.js
import React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Button, Alert } from "react-bootstrap";
import {
  FaMapMarkerAlt,
  FaPlaneDeparture,
  FaCalendarAlt,
  FaStar,
  FaUtensils,
  FaUsers,
  FaMap,
  FaShoppingCart,
  FaRegCommentDots,
} from "react-icons/fa";
import { getPost } from "../../LoadAPI";
import MySpinner from "../Common/Spiner";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { format, parseISO } from "date-fns";
import "./Styles.css";
import { vi } from "date-fns/locale";
import MapView from "./Map";
import CalendarWithModal from "./Calendar";
import PostComments from "./Comments";
import cookies from "react-cookies";
import Rating from "react-rating-stars-component";
import { authApi, endpoints } from "../configs/APIs";

const PostDetail = ({ update, setUpdate, setCountCard }) => {
  const [post, setPost] = useState(null);
  const { post_id } = useParams();
  const nav = useNavigate();

  const [rating, setRating] = useState(0);

  const ratingChanged = (newRating) => {
    handlePressConfirm(newRating);
    setRating(newRating);
  };

  const handlePressConfirm = async (rating) => {
    if (rating) {
      try {
        let token = await cookies.load("access-token");
        let res = await authApi(token).post(endpoints["rates"](post_id), {
          rate: rating,
        });
        alert("Đánh giá thành công");
      } catch (ex) {
        console.error(ex);
        alert("Bạn đẵ đáng giá bài post này rồi!");
        return;
      }

      //Cho nay xu ly lu du lieu json
    } else {
      console.log("Vui lòng chọn rating");
    }
  };

  const loadProduct = async () => {
    try {
      console.log(post_id);
      let data = await getPost(post_id);
      console.log(data);

      setPost(data);
    } catch (ex) {
      console.error(ex);
    }
  };
  useEffect(() => {
    loadProduct();
  }, [post_id]);

  const addCart = async () => {
    try {
      let token = await cookies.load("access-token");
      let res = await authApi(token).post(endpoints["add-cart"](post_id), {});
      setUpdate(!update);
      if (res.data.created === false) {
        alert("Sản phẩm đã được thêm vào giỏ hàng");
      } else {
        setCountCard((cur) => cur + 1);
        alert("Sản phẩm đã thêm vào gi�� hàng thành công");
      }
    } catch (ex) {
      console.error(ex);
    }
  };

  const changeVi = (date) => {
    return format(parseISO(date), "dd MMMM yyyy", { locale: vi });
  };

  const handleClick = () => {
    // Xử lý khi nhấn vào nút
    addCart();
  };

  const handleChat = (e) => {
    e.preventDefault();

    nav("/chat");
  };

  return (
    <>
      <Container>
        {post == null ? (
          <MySpinner />
        ) : (
          <Row style={{ marginTop: 140 }}>
            <Row>
              <Carousel
                showThumbs={false}
                autoPlay={true}
                infiniteLoop={true}
                interval={3000} // thời gian giữa mỗi slide (tính bằng milliseconds)
                transitionTime={500} // thời gian chuyển đổi giữa các slide (tính bằng milliseconds)
                showStatus={false} // ẩn thanh trạng thái
                showIndicators={false} // ẩn các chỉ số slide
              >
                {post.pic.map((pic, index) => (
                  <div key={index}>
                    <img
                      src={pic.picture}
                      alt={post.title}
                      style={{ maxWidth: "100%", height: "80vh" }}
                    />
                  </div>
                ))}
              </Carousel>
            </Row>
            <Row>
              <h1 style={{ textAlign: "center", fontSize: 90 }}>
                {post.title}
              </h1>
              <div className="journey-info">
                <Col md={4} style={{ textAlign: "center", fontSize: 30 }}>
                  <FaCalendarAlt />
                  <h2>Thời gian</h2>{" "}
                  <div>
                    {" "}
                    {changeVi(post.journey.ngayDi)} -{" "}
                    {changeVi(post.journey.ngayDen)}
                  </div>
                </Col>
                <Col md={4} style={{ textAlign: "center", fontSize: 30 }}>
                  <FaMap />
                  <h2>Hành trình</h2>{" "}
                  <div>
                    {" "}
                    {post.journey.id_tuyenDuong.id_noiDi.diaChi} -{" "}
                    {post.journey.id_tuyenDuong.id_noiDen.diaChi}
                  </div>
                </Col>
                <Col md={4} style={{ textAlign: "center", fontSize: 30 }}>
                  <FaPlaneDeparture />
                  <h2>Phương tiện</h2>{" "}
                  <div> {post.journey.id_PhuongTien.loai}</div>
                </Col>
              </div>
            </Row>
            <Row>
              <Col md={4} style={{ textAlign: "center", fontSize: 30 }}>
                <FaMapMarkerAlt /> <h2>Địa điểm dừng chân</h2>
                {post.journey.stoplocal.map((s, i) => {
                  return (
                    <Col key={i}>
                      <p> {s.id_DiaDiem.diaChi}</p>
                    </Col>
                  );
                })}
              </Col>

              <Col md={4} style={{ textAlign: "center", fontSize: 30 }}>
                <FaUtensils />
                <h2>Ẩm thực</h2>
                <div>Nhiều loại ẩm thực</div>
              </Col>
              <Col md={4} style={{ textAlign: "center", fontSize: 30 }}>
                <FaUsers />
                <h2>Tags</h2>
                <p> {post.tags.map((tag) => tag.name).join(", ")}</p>
              </Col>
            </Row>
          </Row>
        )}
        <Row style={{ textAlign: "center", marginTop: 50 }}>
          <Col md={6}>
            <h1>
              {" "}
              <FaMap />
              Map
            </h1>
            <MapView />
          </Col>
          <Col md={6}>
            <h1>
              {" "}
              <FaCalendarAlt />
              Calendar
            </h1>
            {post != null && (
              <CalendarWithModal dateData={post.journey.ngayDi} post={post} />
            )}
          </Col>
        </Row>
      </Container>
      <Button className="fixed-button" onClick={handleClick}>
        <div href="#cart">
          <FaShoppingCart size={20} className="cart-icon" />
        </div>
        <span className="hover-text">Thêm vào giỏ hàng</span>
      </Button>

      <Button className="fixed-button message" onClick={handleChat}>
        <div href="#cart">
          <FaRegCommentDots size={20} className="cart-icon" />
        </div>
        <span className="hover-text">Nhắn tin</span>
      </Button>

      <div className="rate-button-container fixed-button rate">
        <div href="#cart">
          <FaStar color="white" size={20} className="cart-icon" />
        </div>
        <div className="rating-container hover-text">
          <Rating
            count={5}
            onChange={ratingChanged}
            size={30}
            activeColor="#ffd700"
          />
        </div>
      </div>

      {post != null && <PostComments id_post={post_id} rate={post.avgRate} />}
    </>
  );
};

export default PostDetail;

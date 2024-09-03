import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faTwitter, faAndroid } from '@fortawesome/free-brands-svg-icons';
import { faYammer } from '@fortawesome/free-brands-svg-icons';
import './footer.css'; // Đảm bảo bạn đã import file CSS

const Footer = () => {
  return (
    <div className="footer container mt-5">
      <div className="row">
        <div className="col-md-3">
          <ul className="list-unstyled">
            <li>Hỗ Trợ Khách Hàng</li>
            <li>Liên Hệ</li>
            <li>Câu Hỏi Thường Gặp</li>
            <li>Dịch Vụ</li>
            <li>Điều Khoản</li>
            <li>Chính Sách</li>
          </ul>
        </div>
        <div className="col-md-3">
          <ul className="list-unstyled">
            <li>Về Chúng Tôi</li>
            <li>Giới Thiệu</li>
            <li>Tuyển Dụng</li>
            <li>Quy Chế</li>
            <li>Sitemap</li>
          </ul>
        </div>
        <div className="col-md-3">
          <ul className="list-unstyled">
            <li>Tin Tức</li>
            <li>Báo Giá Dịch Vụ</li>
            <li>Khuyến Mãi</li>
            <li>Cải Tiến</li>
          </ul>
        </div>
        <div className="col-md-3">
          <ul className="list-unstyled social-icons">
            <li>
              <span>Mạng xã hội</span>
            </li>
            <li>
              <span>Facebook</span>
              <FontAwesomeIcon icon={faFacebook} />
            </li>
            <li>
              <span>Instagram</span>
              <FontAwesomeIcon icon={faInstagram} />
            </li>
            <li>
              <span>Twitter</span>
              <FontAwesomeIcon icon={faTwitter} />
            </li>
          </ul>
        </div>
      </div>
      <div className="info mt-4">
        <div className="row">
          <div className="col-md-6">
            <ul className="list-unstyled">
              <li className="contact" style={{ fontWeight: 'bold', fontSize: '20px' }}>
                CÔNG TY CỔ PHẦN HÀNG KHÔNG VIỆT NAM
              </li>
              <li>Copyright © 2023 - 2024 banvemaybay.com.vn</li>
              <li className="contact">
                <FontAwesomeIcon icon={faAndroid} className="phone" /> 0349.966.760 
                <FontAwesomeIcon icon={faYammer} className="email" /> Banve@banvemaybay.com.vn
              </li>
              <li>Thời gian làm việc: 8:30 - 17:15 (thứ 2 - thứ 6)</li>
              <li>
                <img width="140px" src="/static/uploadfile/banveindex/bocongthuong.png" alt="Bộ Công Thương" />
              </li>
            </ul>
          </div>
          <div className="col-md-6">
            <ul className="list-unstyled">
              <li>Chịu trách nhiệm nội dung: NQT</li>
              <li>
                Toàn bộ quy chế, quy định giao dịch chung được đăng tải trên website áp dụng từ ngày 12/23/2023.
                banvemaybay.com là dịch vụ bán vé dành cho nhân viên bán viên. Vui lòng, thành viên khác không được vào hệ thống
              </li>
            </ul>
          </div>
        </div>
        <div className="row mt-4">
          <div className="col-md-6 address">
            <ul className="list-unstyled">
              <li>Địa chỉ trụ sở chính</li>
              <li>799 Võ Văn Kiệt, Phường 12, Huyện Nhà Bè, Thành phố Hồ Chí Minh</li>
            </ul>
          </div>
          <div className="col-md-6 address">
            <ul className="list-unstyled">
              <li>Văn phòng TP. Hồ Chí Minh</li>
              <li>Tầng 14, Toà nhà Vietcombank, số 5 Công Trường Mê Linh, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;

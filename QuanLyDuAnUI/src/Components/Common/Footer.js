// Footer.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import './Static/footer.css';

const Footer = () => {
  return (
    <div className="description">
      <div className="info-1">
        <ul>
          <li>Hỗ Trợ Khách Hàng</li>
          <li>Liên Hệ</li>
          <li>Câu Hỏi Thường Gặp</li>
          <li>Dịch Vụ</li>
          <li>Điều Khoản</li>
          <li>Chính Sách</li>
        </ul>
        <ul>
          <li>Về Chúng Tôi</li>
          <li>Giới Thiệu</li>
          <li>Tuyển Dụng</li>
          <li>Quy Chế</li>
          <li>Sitemap</li>
        </ul>
        <ul>
          <li>Tin Tức</li>
          <li>Báo Giá Dịch Vụ</li>
          <li>Khuyến Mãi</li>
          <li>Cải Tiến</li>
        </ul>
        <ul>
          <li>Mạng xã hội</li>
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
      <div className="info">
        <ul>
          <li style={{ fontWeight: 'bold', fontSize: '20px' }}>CÔNG TY CỔ PHẦN HÀNG KHÔNG VIỆT NAM</li>
          <li>Copyright © 2023 - 2024 banvemaybay.com.vn</li>
          <li>
            <FontAwesomeIcon icon={faPhone} /> 0349.966.760 <FontAwesomeIcon icon={faEnvelope} /> Banve@banvemaybay.com.vn
          </li>
          <li>Thời gian làm việc: 8:30 - 17:15 (thứ 2 - thứ 6)</li>
          <li><img width="140px" src="/static/uploadfile/banveindex/bocongthuong.png" alt="Bộ Công Thương" /></li>
        </ul>
        <ul>
          <li>Chịu trách nhiệm nội dung: NQT</li>
          <li>Toàn bộ quy chế, quy định giao dịch chung được đăng tải trên website áp dụng từ ngày 12/23/2023.
            banvemaybay.com là dịch vụ bán vé dành cho nhân viên bán viên. Vui lòng, thành viên khác không được vào hệ thống
          </li>
        </ul>
      </div>
      <div className="info">
        <ul>
          <li>Địa chỉ trụ sở chính</li>
          <li>799 Võ Văn Kiệt, Phường 12, Huyện Nhà Bè, Thành phố Hồ Chí Minh</li>
        </ul>
        <ul>
          <li>Văn phòng TP. Hồ Chí Minh</li>
          <li>Tầng 14, Toà nhà Vietcombank, số 5 Công Trường Mê Linh, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Footer;

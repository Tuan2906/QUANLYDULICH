import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import APIs, { endpoints } from '../configs/APIs';
import _ from 'lodash';
const SuccessPage = () => {
    const navigate = useNavigate();
    const generateRandomString = () => {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      const randomString = _.times(5, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
      return randomString;
    };
    console.log(localStorage.getItem("thongTinChung"));
  useEffect(() => {
    // Gọi API lưu hóa đơn và gửi email
    const saveInvoiceAndSendEmail = async () => {
      try {
        const response = APIs.post(endpoints.sucessPay, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // Các thông tin gửi lên server nếu cần 
          body: JSON.stringify({
            "customer_email":"tuanchaunguyen13@gmail.com",
            "id":generateRandomString()+1,
            "title": "Du lich Mua Xuan",
            "tour":"Hà Nội - Hải Phòng",
            "ngaykhoihanh":"19/2/2022",
            "ngayketthuc":"20/5/2023"
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save invoice and send email');
        }

        // Xử lý thành công, có thể chuyển hướng hoặc hiển thị thông báo
      } catch (error) {
        console.error('Error saving invoice and sending email:', error);
        // Xử lý lỗi, hiển thị thông báo cho người dùng
      }
    };

  }, []);

  return (
    <div>
      <h1>Thanh toán thành công</h1>
      <p>Cảm ơn bạn đã thanh toán!</p>
      {/* Các thông tin khác nếu cần */}
    </div>
  );
};

export default SuccessPage;

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import APIs, { authApi, endpoints } from '../configs/APIs';
import _ from 'lodash';
import cookie from "react-cookies";

const SuccessPage = () => {
  const in4 = JSON.parse(localStorage.getItem('inform'));
  const thongtinchung =  JSON.parse(localStorage.getItem('thongTinChung'));
  
  console.log('dhhhhhhhhh',thongtinchung.email)
    const navigate = useNavigate();
    const generateRandomString = () => {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      const randomString = _.times(5, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
      return randomString;
    };
    console.log(localStorage.getItem("thongTinChung"));
    const saveInvoiceAndSendEmail = async () => {
      try {
        const response = APIs.post(endpoints.sucessPay, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // Các thông tin gửi lên server nếu cần 
          body: JSON.stringify({
            "customer_email":thongtinchung.email,
            "id":generateRandomString()+in4.hanhtrinh.id,
            "title": in4.hanhtrinh.title,
            "tour":`${in4.hanhtrinh.departure}-${in4.hanhtrinh.destination}`,
            "ngaykhoihanh":in4.hanhtrinh.ngaydi,
            "ngayketthuc":in4.hanhtrinh.ngayden
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
    const saveNguoiThan = async () => {
      console.log('thongtinchung.nguoiThan',thongtinchung.nguoiThan)
      try {
        const response = authApi(cookie.load('access-token')).post(endpoints.luunguoithan(in4.hanhtrinh.id), {
          nguoi_than:thongtinchung.nguoiThan,
          tongtien: in4.tong
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
  useEffect(() => {
    // Gọi API lưu hóa đơn và gửi email
   
    saveInvoiceAndSendEmail();
    saveNguoiThan()
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

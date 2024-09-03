import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import { faChild, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert } from 'react-bootstrap';

const PassengerForm = ({ sl, tong,setFormCompleted }) => {
  const [formData, setFormData] = useState({
    nguoiLon: Array(sl.sl_NguoiLon).fill({ hoten: '', CCCD: '', gioitinh: '', ngaysinh: '' }),
    treEm: Array(sl.sl_TreEm).fill({ hoten: '', gioitinh: '', ngaysinh: '' }),
    sdt: '',
    email: '',
    chkAgreeTerms: false,
  });
  const navigate = useNavigate();
  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
  
  const isAgeValid = (dob, minAge = 15) => {
    const age = calculateAge(dob);
    return age >= minAge;
  };
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };


  const handleChange = (index, field, value, type) => {
    if (type === 'treEm' && field === 'ngaysinh' && !isAgeValid(value, 0)) {
        alert("Ngày sinh không hợp lệ.");
        return;
      }
    if (type === 'nguoiLon' && field === 'ngaysinh' && !isAgeValid(value)) {
        alert("Người lớn phải ít nhất 15 tuổi.");
        return; // Không cập nhật nếu không hợp lệ
    }
    setFormData(prevFormData => {
        const newFormData = { ...prevFormData };
        if (type === 'nguoiLon') {
          const updatedNguoiLon = [...newFormData.nguoiLon];
          updatedNguoiLon[index] = { ...updatedNguoiLon[index], [field]: value };
          
          newFormData.nguoiLon = updatedNguoiLon;
        } else if (type === 'treEm') {
          const updatedTreEm = [...newFormData.treEm];
          updatedTreEm[index] = { ...updatedTreEm[index], [field]: value };
         
          newFormData.treEm = updatedTreEm;
        } else {
          newFormData[field] = value;
        }
        return newFormData;
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
   
    // Handle form submission and convert formData to JSON
    const dl={
      nguoiThan:[...formData.nguoiLon.map(({ hoten, ngaysinh }) => ({hoten, ngaysinh })), 
        ...formData.treEm.map(({ hoten, ngaysinh }) => ({ hoten, ngaysinh }))],
      sdt: formData.sdt,
      email: formData.email,
    }
    console.log("dldad",dl);
    localStorage.setItem('thongTinChung', JSON.stringify(formData));
    setFormCompleted(true);
    navigate('/thanhtoan');
  };

  return (
    <div className="container p-5 bg-white">
      <form onSubmit={handleSubmit}>
        <div className="container1 text-dark">
          <h2 className="head-title1 text-center">Thông tin người tham quan du lịch</h2>
          <p style={{ color: 'green', fontSize: 20 }}>
                <FontAwesomeIcon icon={faUser} style={{ marginRight: '8px' }} />
                Thông Tin Người Lớn
            </p>
          {formData.nguoiLon.map((_, i) => (
            <div className="row" key={i}>
              <div className="col p-3 text-dark">
                <strong>Người lớn {i + 1}, họ và tên *</strong>
                <input
                  type="text"
                  className="form-control p-2 m-1"
                  placeholder="Vi du: Nguyen Van An"
                  value={formData.nguoiLon[i].hoten}
                  onChange={(e) => handleChange(i, 'hoten', e.target.value, 'nguoiLon')}
                  required
                />
              
              </div>
              <div className="col p-3 text-dark">
                <strong>Giới tính *</strong>
                <select
                  className="form-select p-2 m-1"
                  value={formData.nguoiLon[i].gioitinh}
                  onChange={(e) => handleChange(i, 'gioitinh', e.target.value, 'nguoiLon')}
                  required
                >
                  <option value="">----</option>
                  <option value="1">Nam</option>
                  <option value="0">Nữ</option>
                </select>
              </div>
              <div className="col p-3 text-dark">
                <strong>Ngày Sinh</strong>
                <input
                  type="date"
                  className="form-control p-2 m-1"
                  value={formData.nguoiLon[i].ngaysinh}
                  onChange={(e) => handleChange(i, 'ngaysinh', e.target.value, 'nguoiLon')}
                  required
                />
              </div>
              
            </div>
          ))}
         <div></div>
            <p style={{ color: 'green', fontSize: 20 }}>
                <FontAwesomeIcon icon={faChild} style={{ marginRight: '8px' }} />
                Thông Tin Trẻ Em
            </p>
          {formData.treEm.map((_, j) => (
            <div className="row" key={j}>
           
              <div className="col p-3 text-dark">
                <strong>Trẻ em {j + 1}, họ và tên *</strong>
                <input
                  type="text"
                  className="form-control p-2 m-1"
                  placeholder="Vi du: Nguyen Van An"
                  value={formData.treEm[j].hoten}
                  onChange={(e) => handleChange(j, 'hoten', e.target.value, 'treEm')}
                  required
                />
              </div>
              <div className="col p-3 text-dark">
                <strong>Giới tính *</strong>
                <select
                  className="form-select p-2 m-1"
                  value={formData.treEm[j].gioitinh}
                  onChange={(e) => handleChange(j, 'gioitinh', e.target.value, 'treEm')}
                  required
                >
                  <option value="">----</option>
                  <option value="1">Nam</option>
                  <option value="0">Nữ</option>
                </select>
              </div>
              <div className="col p-3 text-dark">
                <strong>Ngày Sinh</strong>
                <input
                  type="date"
                  className="form-control p-2 m-1"
                  value={formData.treEm[j].ngaysinh}
                  onChange={(e) => handleChange(j, 'ngaysinh', e.target.value, 'treEm')}
                  required
                />
              </div>
            </div>
          ))}
        </div>
        <div className="container2 text-dark">
          <hr />
          <h2 className="head-title2">Thông tin liên hệ</h2>
          <div className="d-flex">
            <div style={{ width: '40%', marginTop: 22 }}>
              <strong>Số điện thoại*</strong>
              <input
                type="number"
                className="form-control p-2 m-1"
                value={formData.sdt}
                onChange={(e) => handleChange(null, 'sdt', e.target.value)}
                required
              />
            </div>
            <div style={{ width: '60%', padding: '0 10px' }}>
              <strong>Lưu ý: Email này phải nhập đúng để gửi vé sau khi thanh toán thành công</strong>
              <div></div>
              <strong>Email*</strong>
              <input
                type="email"
                className="form-control p-2 m-1"
                value={formData.email}
                onChange={(e) => handleChange(null, 'email', e.target.value)}
                required
              />
            </div>
          </div>
          <div className="d-flex p-2 m-1">
            <div style={{ width: '40%' }}>
              <div id="booking-agreement">
                <input
                  type="checkbox"
                  checked={formData.chkAgreeTerms}
                  onChange={(e) => handleChange(null, 'chkAgreeTerms', e.target.checked)}
                  required
                />
                Tôi đồng ý với các
                <a target="blank" href="dieu-khoan-su-dung.html">điều kiện &amp; điều khoản</a>
                của <span>HÃNG HÀNG KHÔNG VIỆT NAM</span>.
              </div>
            </div>
            <div style={{ width: '60%' }}>
              <div className="d-flex">
                <div className="me-auto">{sl.sl_NguoiLon} người lớn</div>
                <div className="me-auto">{sl.sl_TreEm} Trẻ em</div>
              </div>
              <hr />
              <div className="d-flex">
                <div className="me-auto">Tổng Cộng:</div>
                <div className="ms-auto">{new Intl.NumberFormat().format(tong)} VNĐ</div>
              </div>
            </div>
          </div>
        </div>
        <div className="d-flex">
          <div className="ms-auto p-2 m-2">
            <button className="common-button2" style={{
              background: '#ed1c24',
              border: 'none',
              borderRadius: '3px',
              color: '#ffffff',
              float: 'right',
              fontSize: '18px',
              lineHeight: '28px',
              margin: '0',
              padding: '5px 15px',
              textTransform: 'uppercase'
            }} type="submit">XÁC NHẬN THÔNG TIN &amp; ĐẶT VÉ</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PassengerForm;

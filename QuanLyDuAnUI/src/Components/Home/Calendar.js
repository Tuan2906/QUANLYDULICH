import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { Modal, Button, Row, Col, Container } from 'react-bootstrap';
import 'react-calendar/dist/Calendar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./css/Calendar.css";
import { FaMinus, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const CalendarWithModal = ({ dateData, post }) => {
  const initialDate = new Date(dateData);
  const [passengerCounts, setPassengerCounts] = useState([1, 0]);
  const [date, setDate] = useState(initialDate);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const nav = useNavigate();
  useEffect(() => {
    // Ensure the calendar initializes to the correct date
    setDate(initialDate);
  }, []);

  const handleDayClick = (value) => {
    setSelectedDate(value);
    setShowModal(true);
  };

  const handleIncreasePassenger = (index) => {
    setPassengerCounts(prevCounts => {
      const newCounts = [...prevCounts];
      newCounts[index] += 1;
      return newCounts;
    });
  };

  const handleDecreasePassenger = (index) => {
    setPassengerCounts(prevCounts => {
      const newCounts = [...prevCounts];
      if (newCounts[index] > 0) {
        newCounts[index] -= 1;
      }
      return newCounts;
    });
  };

  const totalPay = () => {
    let total = 0;
    for (let i = 0; i < 2; i++) {
      total += passengerCounts[i] * post.gia[i];
    }
    return total;
  };

  const handleClose = () => setShowModal(false);

  const tileDisabled = ({ date, view }) => {
    if (view === 'month') {
      return date.getDate() !== initialDate.getDate() ||
             date.getMonth() !== initialDate.getMonth() ||
             date.getFullYear() !== initialDate.getFullYear();
    }
    return false;
  };

  return (
    <div style={{ position: 'relative' }}>
      <Calendar
        onClickDay={handleDayClick}
        value={date}
        tileDisabled={tileDisabled}
        style={{ width: '100%', height: 399 }}
      />
      <div
        className="select-quantity"
        style={{
          position: 'absolute',
          top: '50%',  // Tùy chỉnh để phù hợp với vị trí của dateData trên lịch
          left: '50%', // Tùy chỉnh để phù hợp với vị trí của dateData trên lịch
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '10px',
          borderRadius: '5px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
      >
        Chọn số lượng
      </div>
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Số lượng đi - {selectedDate && selectedDate.toDateString()}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container>
            {post.gia.map((gia, index) => (
              <Row key={index} className="mb-3">
                <Col xs={6}>
                  {index === 0 ? <p>Giá vé người lớn: {gia}</p> : <p>Giá vé trẻ em: {gia}</p>}
                </Col>
                <Col xs={6} className="d-flex align-items-center justify-content-center">
                  <Button variant="outline-primary" onClick={() => handleDecreasePassenger(index)}>
                    <FaMinus />
                  </Button>
                  <span style={{ margin: '0 10px' }}>{passengerCounts[index]}</span>
                  <Button variant="outline-primary" onClick={() => handleIncreasePassenger(index)}>
                    <FaPlus />
                  </Button>
                </Col>
              </Row>
            ))}
            <Row>
              <Col>
                <h5>Tổng tiền: {totalPay()} VND</h5>
              </Col>
            </Row>
          </Container>
        </Modal.Body>
        <Modal.Footer>
        <Button variant="primary" onClick={()=>{
          localStorage.setItem('inform', JSON.stringify({
            sl: {
              "sl_NguoiLon": passengerCounts[0],
              "sl_TreEm": passengerCounts[1],
            },
            tong: totalPay(),
            hanhtrinh: {
              id:post.id,
              title: post.title,
              departure: post.journey.id_tuyenDuong.id_noiDi.diaChi,
              destination: post.journey.id_tuyenDuong.id_noiDen.diaChi,
              ngaydi: post.journey.ngayDi,
              ngayden:post.journey.ngayDen
            }
          }));  
          nav('/nhapthongtin')
        }}>
            Nhập thông tin khách hàng
          </Button>
          <Button variant="danger" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CalendarWithModal;

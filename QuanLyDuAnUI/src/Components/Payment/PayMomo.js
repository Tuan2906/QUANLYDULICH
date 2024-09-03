import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import APIs, { endpoints } from '../../config/APIs';
import MySpinner from '../Common/Spiner';
import context from 'react-bootstrap/esm/AccordionContext';

const PaymentForm = ({ hoadon_id }) => {
    hoadon_id="8282acb1-1ae0-4b9c-b285-f8500d0b01c4"
    const in4 = JSON.parse(localStorage.getItem('inform'));

    const [formData, setFormData] = useState({
        amount:in4.tong * 1000 ,
        orderInfo: hoadon_id,
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
        address: ''
    });
    const [error, setError] = useState('');
    const [cookies] = useCookies(['user']); // Sử dụng hook useCookies để lấy cookie 'user'
    const [loading,setLoading] = useState(false)
    useEffect(() => {
        // Load thông tin user từ cookie và cập nhật vào state formData khi component mount
        console.log('dawdawda',cookies.user)
        if (cookies.user) {
            const userData = cookies.user;
            setFormData({
                ...formData,
                firstName: userData.first_name || '',
                lastName: userData.last_name || '',
                phoneNumber: userData.phoneNumber || '',
                email: userData.username || '',
                address: userData.address || ''
            });
        }
    }, [cookies.user]); // Trigger lại khi có sự thay đổi trong cookie 'user'

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            console.log(1)
            const cookies = document.cookie.split(';');
            console.log(2)
            console.log('caa',cookies)
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                console.log('hger',cookie.substring(0, name.length + 1))
                console.log('hger',cookie.substring(0, name.length + 1))
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    console.log(4)
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        console.log(cookieValue);
        return cookieValue;
    }

    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {

                const form = new FormData();
                for (const key in formData) {
                    if (formData.hasOwnProperty(key)) {
                        form.append(key, formData[key]);
                    }
                }
                try {
                    const response_payment = await APIs.post(endpoints['payMomo'], 
                        form
                    );
                    console.log('dawdawd',response_payment);

                    if (response_payment.status === 200 && response_payment.data.payUrl) {
                        window.location.href = response_payment.data.payUrl;
                    } else {
                        setError('Failed to retrieve payment URL');
                    }
                } catch (error) {
                    setError('Error during payment request');
                    console.error('Payment API error:', error);
                }
                
            // } else {
            //     setError('Failed to save user data');
            }
         catch (error) {
            setError('Error during user data saving.');
            console.error('User data saving error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container style={{marginTop:200}}>
            <Row className="justify-content-md-center">
                <Col md="6">
                    <h1 className="text-center">Payment Form</h1>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="formFirstName">
                            <Form.Label>First Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formLastName">
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formPhoneNumber">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control
                                type="text"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formAddress">
                            <Form.Label>Address</Form.Label>
                            <Form.Control
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formAmount">
                            <Form.Label>Amount</Form.Label>
                            <Form.Control
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formOrderInfo">
                            <Form.Label>Order Info</Form.Label>
                            <Form.Control
                                type="text"
                                name="orderInfo"
                                value={formData.orderInfo}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        {loading ? <MySpinner  animation="border" size="sm"/> : <Button variant="primary" type="submit">
                           Thanh toán Momo
                        </Button>}

                        
                    </Form>
                    {/* {paymentUrl && (
                        <Alert variant="success" className="mt-3">
                           <a href={paymentUrl} target="_blank" rel="noopener noreferrer">Chuyển đến trang thanh toán</a>
                        </Alert>
                    )} */}
                </Col>
            </Row>
        </Container>
    );
};

export default PaymentForm;

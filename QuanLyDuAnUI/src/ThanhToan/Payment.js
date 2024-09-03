import React, { useState } from 'react';
import { faMotorcycle, faCar, faBus, faBicycle,faTag,faMoneyBill,faLocationArrow } from '@fortawesome/free-solid-svg-icons';
import { Container, Form, Button, Row, Col, Modal } from 'react-bootstrap';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import APIs, { endpoints } from '../configs/APIs';
import PaymentForm from './PaymentStripeForm';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Payment.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';

const stripePromise = loadStripe('pk_test_51OQW5yB5fZWkJTYet5Arj2iLVSMxlENjaRB6P1nABaxIoaJQA9XbG5icHp92e6D6BmS6HTIS2uGhSkAHUUC0aXMc00rrxq7xCq');

const PaymentPage = () => {
  const in4 = JSON.parse(localStorage.getItem('inform'));
  const [paymentMethod, setPaymentMethod] = useState(''); // Track selected payment method
  const [showModal, setShowModal] = useState(false); // Modal state for additional payment info if needed
  const [paymentS, setPaymentS] = useState(''); // Track selected payment method
  const nav= useNavigate();
  const handlePayment = async () => {
    try {
      // Make API call to create checkout session
      const response = await APIs.post(endpoints.stripe(in4.hanhtrinh.id),{
        form: in4
      });

      // Redirect to Stripe checkout page
      window.location.href = response.data.url;
      setPaymentS(response.data.id);
    } catch (error) {
      console.error('Error creating checkout session:', error);
      // Handle error gracefully, show message or retry logic
    }
  };
  const handlePaymentMoMo=()=>{
    return nav('/PayMomo')
  }
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD', // Change currency as needed
    }).format(amount);
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };
  return (
    <Container className="payment-container">
      <h1 className="payment-header">Thanh toán</h1>
      <h3 className="tour-title">{in4.hanhtrinh.title}</h3>
      <p className="tour-info">
      <FontAwesomeIcon size='16' color='blue'   icon={faLocationArrow} />
      Hành trình: {in4.hanhtrinh.departure} - {in4.hanhtrinh.destination}</p>
      <div>
        
        <p className="tour-price">
        Tổng tiền: {formatCurrency(in4.tong)}</p>
      </div>
    
      <Form>
        <Form.Group as={Row} className="payment-method-group">
          <Form.Label as="legend" column sm={4} className="payment-method-label">
            Hình thức thanh toán
          </Form.Label>
          <Col sm={4} className="payment-method-options">

            <Form.Check
              type="radio"
              label={
                <>

                  MoMo <div className="payment-method-icon" />
                </>
              }
              name="paymentMethod"
              id="momo"
              value="momo"
              onChange={() => handlePaymentMethodChange('momo')}
              className="payment-method-option"
            />
            <Form.Check
              type="radio"
              label="Stripe"
              name="paymentMethod"
              id="stripe"
              value="stripe"
              onChange={() => handlePaymentMethodChange('stripe')}
              className="payment-method-option"
            />
          </Col>
        </Form.Group>
        {paymentMethod === 'stripe' && (
          <Button variant="primary" onClick={()=>handlePayment()} className="payment-button">
            Thanh toán
          </Button>
        )}
        {paymentMethod === 'momo' && (
          <Button variant="secondary" onClick={()=>handlePaymentMoMo()} className="payment-button">
            Thanh toán
          </Button>
        )}
      </Form>
    </Container>
  );
};

export default PaymentPage;

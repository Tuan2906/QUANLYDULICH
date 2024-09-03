import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

const PaymentForm = ({ tour, clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!stripe || !elements) {
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(PaymentElement),
          billing_details: {
            email: email,
          },
        },
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage('Payment successful!');
        // Handle successful payment, e.g., show confirmation message
      }
    } catch (error) {
      console.error('Error confirming card payment:', error);
      setMessage('An error occurred while processing your payment. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <div>
      <form id="payment-form" onSubmit={handleSubmit}>
        <input
          id="email"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Nhập địa chỉ email"
        />
        <PaymentElement id="payment-element" />
        <button disabled={isLoading || !stripe} id="submit">
          <span id="button-text">
            {isLoading ? <div className="spinner" id="spinner"></div> : 'Thanh toán'}
          </span>
        </button>
        {message && <div id="payment-message">{message}</div>}
      </form>
    </div>
  );
};

export default PaymentForm;

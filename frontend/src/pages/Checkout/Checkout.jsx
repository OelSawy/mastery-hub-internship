import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, DollarSign } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Header } from '../../components/userHeader';
import api from '@/api';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const [checkoutData, setCheckoutData] = useState({
    paymentMethod: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVV: ''
  });
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await api.get('/user/cart/getCart');
      const items = response.data.cart;
      setCartItems(items);
      const total = items.reduce((sum, item) => {
        return sum + (item.product?.price * item.quantity || 0);
      }, 0);
      setTotalAmount(total);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCheckoutData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!checkoutData.paymentMethod) {
      setError("Please choose a payment method");
      return;
    }

    if (checkoutData.paymentMethod === 'card') {
      const { cardNumber, cardExpiry, cardCVV } = checkoutData;

      if (!cardNumber || !cardExpiry || !cardCVV) {
        setError('Please fill in all card details');
        return;
      }

      if (cardNumber.length !== 16 || isNaN(cardNumber)) {
        setError('Invalid card number');
        return;
      }

      const [month, year] = cardExpiry.split('/');
      if (!month || !year || +month < 1 || +month > 12 || year.length !== 2) {
        setError('Invalid expiry date');
        return;
      }

      if (cardCVV.length !== 3 || isNaN(cardCVV)) {
        setError('Invalid CVV');
        return;
      }
    }

    setLoading(true);
    try {
      const response = await api.post('/user/cart/checkoutCart', {
        paymentMethod: checkoutData.paymentMethod,
      });

      if (response.data.success) {
        setError('');
        navigate('/thankyou');
      } else {
        setError(response.data.error || 'Checkout failed');
      }
    } catch (error) {
      const msg = error.response?.data?.error || 'Server error during checkout';
      setError(msg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <Header />
      <div className="checkout-container">
        <h2>Checkout</h2>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="checkout-form">
          {/* Payment Method Section */}
          <div className="section">
            <h3>Payment Method</h3>
            <div className="payment-options">
              <div
                className={`payment-option ${checkoutData.paymentMethod === 'card' ? 'selected' : ''}`}
                onClick={() => handleChange({ target: { name: 'paymentMethod', value: 'card' } })}
              >
                <CreditCard />
                <span>Credit Card</span>
              </div>
              <div
                className={`payment-option ${checkoutData.paymentMethod === 'COD' ? 'selected' : ''}`}
                onClick={() => handleChange({ target: { name: 'paymentMethod', value: 'COD' } })}
              >
                <Truck />
                <span>Cash on Delivery</span>
              </div>
            </div>

            {checkoutData.paymentMethod === 'card' && (
              <div className="card-details">
                <Input type="text" name="cardNumber" placeholder="Card Number" maxLength="16"
                  value={checkoutData.cardNumber} onChange={handleChange} />
                <div className="card-extra-details">
                  <Input type="text" name="cardExpiry" placeholder="MM/YY" maxLength="5"
                    value={checkoutData.cardExpiry} onChange={handleChange} />
                  <Input type="text" name="cardCVV" placeholder="CVV" maxLength="3"
                    value={checkoutData.cardCVV} onChange={handleChange} />
                </div>
              </div>
            )}
          </div>

          {/* Cart Summary Section */}
          <div className="order-summary">
            <h3>Order Summary</h3>

            {cartItems.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <>
                {cartItems.map((item, index) => (
                  <div key={index} className="summary-row item-row">
                    <div>
                      <strong>{item.product?.name}</strong> x {item.quantity}
                    </div>
                    <div>
                      ${(item.product?.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
                <hr />
                <div className="summary-row total-row">
                  <span>Total Amount:</span>
                  <span className="total-amount">
                    <DollarSign className="icon" />
                    {totalAmount.toFixed(2)}
                  </span>
                </div>
              </>
            )}
          </div>

          <Button
            type="submit"
            disabled={
              loading ||
              !checkoutData.paymentMethod ||
              (checkoutData.paymentMethod === 'card' &&
                (!checkoutData.cardNumber || !checkoutData.cardExpiry || !checkoutData.cardCVV))
            }
            className="checkout-button"
          >
            {loading ? 'Processing...' : `Pay $${totalAmount.toFixed(2)}`}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;

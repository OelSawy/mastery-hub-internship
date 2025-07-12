import React, { useState, useEffect } from 'react';
import { Header } from '../components/userHeader';
import api from '@/api';
import { DollarSign, Trash2, Plus, Minus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Loading from "@/components/loading";
import '../styles/cart.css';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const response = await api.get('/user/cart/getCart');
      setCartItems(response.data.cart);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart:', error);
      showNotification('Failed to load cart items', 'error');
      setLoading(false);
    }
  };

  const isBase64 = (str) => {
    try {
      return btoa(atob(str)) === str;
    } catch (err) {
      return false;
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (isUpdating || newQuantity < 1) return;
    setIsUpdating(true);
    try {
      const response = await api.post('/user/cart/changeQuantity', {
        productId,
        quantity: newQuantity
      });
      if (response.data.message === "Cart quantity updated successfully") {
        await fetchCartItems();
        showNotification('Cart updated successfully');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      showNotification(error.response?.data?.error || 'Failed to update quantity', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const response = await api.post('/user/cart/removeProduct', { productId });
      if (response.data.message === 'Product removed from cart successfully') {
        await fetchCartItems();
        showNotification('Item removed from cart');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      showNotification('Failed to remove item', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product?.price * item.quantity || 0);
    }, 0);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) return <Loading />;

  return (
    <div className="cart-page">
      <Header />
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`notification ${notification.type}`}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="cart-container">
        <h1 className="cart-title">Shopping Cart</h1>
        
        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map((item) => (
                <motion.div 
                  key={item.product._id}
                  className="cart-item"
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="item-image">
                    <img
                      src={item.product.picture && isBase64(item.product.picture)
                        ? `data:image/jpeg;base64,${item.product.picture}`
                        : 'https://via.placeholder.com/100'}
                      alt={item.product?.name}
                    />
                  </div>
                  <div className="item-details">
                    <h3 className="item-name">{item.product?.name}</h3>
                    <p className="item-price">
                      <DollarSign className="icon" />
                      {item.product?.price?.toFixed(2)}
                    </p>
                  </div>
                  <div className="item-quantity">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                      disabled={item.quantity <= 1 || isUpdating}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="quantity-display">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                      disabled={isUpdating}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="item-total">
                    <DollarSign className="icon" />
                    {(item.product?.price * item.quantity).toFixed(2)}
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveItem(item.product._id)}
                    disabled={isUpdating}
                    className="remove-button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
            <div className="cart-summary">
              <div className="total">
                <span>Total:</span>
                <span className="total-amount">
                  <DollarSign className="icon" />
                  {calculateTotal().toFixed(2)}
                </span>
              </div>
              <Button 
                className="checkout-button"
                onClick={handleCheckout}
                disabled={cartItems.length === 0}
              >
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;

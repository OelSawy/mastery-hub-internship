import { Routes, Route } from 'react-router-dom';
import Login from './pages/login.jsx';
import Register from './pages/register.jsx';
import Products from './pages/products.jsx';
import Cart from './pages/cart.jsx';
import Checkout from './pages/Checkout/Checkout.jsx';
import Thankyoupage from './pages/Checkout/Thankyoupage/Thankyoupage.jsx';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/products" element={<Products />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/thankyou" element={<Thankyoupage />} />
    </Routes>
  );
}

export default App;

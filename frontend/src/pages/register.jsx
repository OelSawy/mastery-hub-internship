import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import '../styles/login.css'; // use same CSS

export default function Register() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    mobile: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/user/register', form);
      navigate('/login');
    } catch (err) {
      console.error('Register error:', err);
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Create Account</h1>
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={form.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              name="mobile"
              placeholder="Mobile Number"
              value={form.mobile}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="login-button">
            Register
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
        <div
          type="button"
          className="signup-button"
          onClick={() => navigate('/login')}
        >
          Already have an account? Log in
        </div>
      </div>
    </div>
  );
}

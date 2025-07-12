import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '@/axiosInstance';
import './editMyProducts.css';

const EditMyProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axiosInstance.get(`/api/seller/product/${productId}`);
        setProduct(response.data.product);
        setLoading(false);
      } catch (error) {
        setErrorMessage('Unable to fetch product details. Please try again later.');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const response = await axiosInstance.put('/api/seller/product/editProduct', {
        id: productId,
        ...product,
      });
      setSuccessMessage(response.data.message || 'Changes saved successfully!');
      setTimeout(() => navigate('/Seller/ViewMyProducts'), 2000);
    } catch (error) {
      setErrorMessage('Failed to save changes. Please try again.');
    }
  };

  if (loading) return <div>Loading...</div>;

  if (!product) return <div>{errorMessage || 'Product not found.'}</div>;

  return (
    <div className="edit-product-container">
      <h1>Edit Product</h1>
      <div className="form">
        <div className="form-group">
          <label htmlFor="name">Product Name</label>
          <input
            id="name"
            name="Name"
            type="text"
            value={product.Name || ''}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <input
            id="description"
            name="Description"
            type="text"
            value={product.Description || ''}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="price">Price</label>
          <input
            id="price"
            name="Price"
            type="number"
            value={product.Price || ''}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="quantity">Quantity</label>
          <input
            id="quantity"
            name="Quantity"
            type="number"
            value={product.Quantity || ''}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-actions">
          <button className="save-button" onClick={handleSaveChanges}>Save Changes</button>
          <button className="cancel-button" onClick={() => navigate('/Seller/ViewMyProducts')}>Cancel</button>
        </div>
      </div>
      {successMessage && <div className="message success-message">{successMessage}</div>}
      {errorMessage && <div className="message error-message">{errorMessage}</div>}
    </div>
  );
};

export default EditMyProduct;

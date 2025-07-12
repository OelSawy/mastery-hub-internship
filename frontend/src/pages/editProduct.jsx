import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "@/api";
import "../styles/editProduct.css";
import Loading from "@/components/loading";

const EditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const passedProduct = location.state?.product;

  const [product, setProduct] = useState(passedProduct || null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      const response = await api.put("/admin/editProduct", {
        id: productId,
        ...product,
      });
      if (response.status === 200) {
        setLoading(false);
        setProduct(response.data.product);
      }
      navigate("/adminProducts");
    } catch (error) {
      setLoading(false);
      setErrorMessage("Failed to save changes. Please try again.");
    }
  };

  if (!product) return <div>{errorMessage || "Product not found."}</div>;

  return (
    <div className="edit-product-container">
      <h1>Edit Product</h1>
      {loading ? (
        <Loading />
      ) : (
        <div className="form">
          <div className="form-group">
            <label htmlFor="name">Product Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={product.name || ""}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <input
              id="description"
              name="description"
              type="text"
              value={product.description || ""}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="price">Price</label>
            <input
              id="price"
              name="price"
              type="number"
              value={product.price || ""}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="quantity">Quantity</label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              value={product.quantity || ""}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-actions">
            <button className="save-button" onClick={handleSaveChanges}>
              Save Changes
            </button>
            <button
              className="cancel-button"
              onClick={() => navigate("/Seller/ViewMyProducts")}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProduct;

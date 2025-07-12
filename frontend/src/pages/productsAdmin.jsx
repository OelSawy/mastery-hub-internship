import React, { useState, useEffect } from "react";
import api from "../api.js";
import { Header } from "../components/adminHeader.jsx";
import { DollarSign, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Loading from "@/components/Loading";
import "../styles/products.css";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const fetchAllProducts = async () => {
    try {
      const response = await api.get("/admin/viewProducts");
      setAllProducts(response.data);
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching all products:", error);
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

  const handleDeleteProduct = async (productId) => {
    try {
      await api.delete(`/admin/deleteProduct/${productId}`);
      fetchAllProducts();
      alert("Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product.");
    }
  };

  return (
    <div className="view-products">
      <Header />
      <div className="content">
        <main className="products">
          {loading ? (
            <Loading />
          ) : products.length > 0 ? (
            products.map((product) => (
              <div className="product-card" key={product._id}>
                <div className="product-image-container">
                  <img
                    src={
                      product.picture && isBase64(product.picture)
                        ? `data:image/jpeg;base64,${product.picture}`
                        : "https://via.placeholder.com/300x200?text=No+Image"
                    }
                    alt={product.name}
                    className="product-image"
                  />
                </div>
                <div className="product-details">
                  <div className="product-header">
                    <h2 className="product-title">{product.name}</h2>
                    <div className="product-rating">
                      <Star className="icon" />
                      <span>{product.averageRating}</span>
                      <Trash2
                        className="delete-icon"
                        onClick={() => handleDeleteProduct(product._id)}
                      />
                    </div>
                  </div>
                  <p className="product-description">{product.description}</p>
                  <div className="product-info">
                    <p className="product-quantity">
                      <strong>Quantity:&nbsp;</strong>
                      {product.quantity < 1 ? "Out of stock" : product.quantity}
                    </p>
                  </div>
                  <div className="product-footer">
                    <p className="product-price">
                      <DollarSign className="icon" />
                      {product.price.toFixed(2)}
                    </p>
                    <Button
                      className="edit-button"
                      onClick={() =>
                        navigate(`/editProduct/${product._id}`, {
                          state: { product },
                        })
                      }
                    >
                      Edit Product
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No products found.</p>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminProducts;

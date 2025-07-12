import React, { useState, useEffect } from "react";
import api from "../api.js";
import { Header } from "../components/userHeader.jsx";
import { DollarSign, PackageCheck } from "lucide-react";
import Loading from "@/components/Loading";
import "../styles/products.css";

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/user/orders");
      setOrders(response.data.orders);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };

  return (
    <div className="view-products">
      <Header />
      <div className="content">
        <main className="products">
          {loading ? (
            <Loading />
          ) : orders.length > 0 ? (
            orders.map((order) => (
              <div className="product-card" key={order._id}>
                <div className="product-details">
                  <div className="product-header">
                    <h2 className="product-title">Order #{order._id.slice(-6)}</h2>
                    <div className="product-rating">
                      <PackageCheck className="icon" />
                      <span>{order.status}</span>
                    </div>
                  </div>
                  <div className="product-description">
                    <strong>Payment:</strong> {order.paymentMethod}
                    <br />
                    <strong>Date:</strong> {new Date(order.orderDate).toLocaleString()}
                  </div>
                  <div className="product-description">
                    <strong>Products:</strong>
                    <ul>
                      {order.products.map((item, idx) => (
                        <li key={idx}>
                          {item.productId?.name || "Unknown Product"} × {item.quantity} —{" "}
                          <DollarSign className="icon inline-icon" />
                          {(item.price * item.quantity).toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="product-footer">
                    <p className="product-price">
                      <DollarSign className="icon" />
                      {order.totalPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No orders found.</p>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserOrders;

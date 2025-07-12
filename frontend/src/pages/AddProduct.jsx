import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, DollarSign, Hash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import "../styles/AddProduct.css";
import api from "@/api";
import { Header } from "../components/adminHeader";
import Loading from "@/components/loading";

const AddProduct = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "price" || name === "quantity") {
      setFormData({ ...formData, [name]: Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      const response = await api.post("/admin/addProduct", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 201) {
        const productData = {
          ...formData,
          _id: response.data.product._id,
        };

        localStorage.setItem("sellerData", JSON.stringify(productData));

        alert("Product added successfully!");
        setFormData({
          name: "",
          description: "",
          price: "",
          Reviews: [],
          quantity: "",
        });
        setLoading(false);
        navigate("/uploadPicture");
      }
    } catch (error) {
        setLoading(false);
      console.error("Error adding product:", error);
      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert("Failed to add product. Please try again.");
      }
    }
  };

  return (
    <>
      <Header />
      <div className="add-product-container">
        <h2>Add New Product</h2>
        {loading ? (
          <Loading />
        ) : (
          <form className="add-product-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <FileText id="input-icon" />
              <Input
                type="text"
                name="name"
                placeholder="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <FileText id="input-icon" />
              <Textarea
                name="description"
                placeholder="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <DollarSign id="input-icon" />
              <Input
                type="number"
                name="price"
                placeholder="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="any"
              />
            </div>

            <div className="input-group">
              <Hash id="input-icon" />
              <Input
                type="number"
                name="quantity"
                placeholder="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="0"
              />
            </div>

            <Button type="submit">Add Product</Button>
          </form>
        )}
      </div>
    </>
  );
};

export default AddProduct;

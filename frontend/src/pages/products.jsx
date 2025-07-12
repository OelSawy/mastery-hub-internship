import React, { useState, useEffect } from "react";
import api from "../api.js";
import { Header } from "../components/userHeader.jsx";
import { DollarSign, Star, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router-dom";
import Loading from "@/components/loading";
import "../styles/products.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedRating, setSelectedRating] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [loading, setLoading] = useState(true);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const handleAddToCartClick = async (productId) => {
    try {
      await api.post("/user/cart/addProduct", { productId, quantity: 1 });
      alert("Product added to cart successfully!");
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const response = await api.get("/user/viewProducts");
      setAllProducts(response.data);
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching all products:", error);
      setLoading(false);
    }
  };

  const fetchFilteredProducts = async () => {
    try {
      const params = {};
      if (priceRange[0] > 0 || priceRange[1] < 1000) {
        params.minPrice = priceRange[0];
        params.maxPrice = priceRange[1];
      }
      if (selectedRating) {
        params.averageRating = selectedRating;
      }
      const response = await api.get("user/filterProducts", { params });
      setProducts(response.data);
      setFiltersApplied(true);
    } catch (error) {
      setProducts([]);
      setLoading(false);
      console.error("Error fetching filtered products:", error);
    }
  };

  const fetchSortedProducts = async (order) => {
    try {
      if (!order) return fetchAllProducts();
      const response = await api.get(`user/sortProducts`, {
        params: { order },
      });
      setProducts(response.data);
      setFiltersApplied(true);
    } catch (error) {
      setProducts([]);
      setLoading(false);
      console.error("Error fetching sorted products:", error);
    }
  };

  const handleSearch = async (name) => {
    if (!name) return fetchAllProducts();
    try {
      const response = await api.get(`/user/searchProducts`, {
        params: { name },
      });
      setProducts(response.data);
    } catch (error) {
      setProducts([]);
      setLoading(false);
      console.error("Error searching products:", error);
    }
  };

  const handleSortChange = (newSortOrder) => {
    setSortOrder(newSortOrder);
    fetchSortedProducts(newSortOrder);
  };

  const handleRatingChange = (newRating) => {
    setSelectedRating(newRating);
    fetchFilteredProducts();
  };

  const handlePriceChange = (newRange) => {
    setPriceRange(newRange);
    fetchFilteredProducts();
  };

  const isBase64 = (str) => {
    try {
      return btoa(atob(str)) === str;
    } catch (err) {
      return false;
    }
  };

  return (
    <div className="view-products">
      <Header />
      <div className="content">
        <aside className="filters">
          <h3 className="text-lg font-semibold mb-4">Filter by:</h3>
          <div className="mb-4">
            <Label>Price Range</Label>
            <Slider min={0} max={1000} step={10} value={priceRange} onValueChange={setPriceRange} />
            <div className="flex justify-between text-sm mt-1">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>
          <div className="mb-4">
            <Label>Average Rating</Label>
            <RadioGroup value={selectedRating} onValueChange={setSelectedRating}>
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                  <Label htmlFor={`rating-${rating}`}>{rating} {rating === 1 ? 'star' : 'stars'} & up</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="mb-4">
            <Label>Sort by</Label>
            <RadioGroup value={sortOrder} onValueChange={() => {}}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="sort-high" checked={sortOrder === 'high'} onClick={() => handleSortChange('high')} />
                <Label htmlFor="sort-high">Highest to Lowest Rating</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="sort-low" checked={sortOrder === 'low'} onClick={() => handleSortChange('low')} />
                <Label htmlFor="sort-low">Lowest to Highest Rating</Label>
              </div>
            </RadioGroup>
          </div>
          {/* <Button onClick={handleFilterClick} id="filter">Apply Filters</Button> */}
        </aside>

        <main className="products">
          <div className="search-bar mb-4">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
            <Button onClick={() => handleSearch(searchTerm)} id="search">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

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
                      onClick={() => handleAddToCartClick(product._id)}
                    >
                      Add to Cart
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

export default Products;

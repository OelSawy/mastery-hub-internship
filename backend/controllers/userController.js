import productModel from "../models/product.js";

const viewProducts = async (req, res) => {
  try {
    // Exclude archived products by setting Archive: false in the filter
    const products = await productModel.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving products", error });
  }
};

const searchProduct = async (req, res) => {
  try {
    const { name } = req.query;

    // Ensure name is a string and exists
    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Invalid product name" });
    }

    const products = await productModel.find({
      name: { $regex: name, $options: "i" },
    });

    if (products.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found with the given name" });
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error searching for products", error });
  }
};

const filterProducts = async (req, res) => {
  try {
    const { minPrice, maxPrice, averageRating } = req.query;

    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;

    let filter = {};

    // Price range filter
    if (min !== null && max !== null) {
      filter.price = { $gte: min, $lte: max };
    } else if (min !== null) {
      filter.price = { $gte: min };
    } else if (max !== null) {
      filter.price = { $lte: max };
    }

    // Handle averageRating filter
    if (averageRating) {
      const rating = Number(averageRating); // Ensure it's a number
      if (isNaN(rating)) {
        return res.status(400).json({ message: "Invalid rating value" });
      }
      filter.averageRating = { $gte: rating }; // Assuming averageRating is a numeric field in DB
    }

    const products = await productModel.find(filter);

    if (products.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found with the given filters." });
    }

    res.status(200).json(products);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error filtering products", error: error.message });
  }
};

const sortProducts = async (req, res) => {
  try {
    const { order } = req.query;

    if (!order || (order !== "high" && order !== "low")) {
      return res.status(400).json({
        message: 'Please provide a valid order value ("high" or "low").',
      });
    }

    const sortOrder = order === "high" ? -1 : 1; // -1 for descending, 1 for ascending

    const products = await productModel.find().sort({ price: sortOrder });

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found." });
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: "Error sorting products by ratings",
      error: error.message,
    });
  }
};

const addProductToCart = async (req, res) => {
  try {
    const id = req.user._id;
    const { productId, quantity } = req.body;

    if (!productId || typeof quantity !== 'number') {
      return res.status(400).json({ error: 'Product ID and quantity are required' });
    }

    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if product already in cart
    const existingItem = user.cart.find(item => item.productId.toString() === productId);

    if (existingItem) {
      // Update quantity
      existingItem.quantity += quantity;
    } else {
      user.cart.push({ productId, quantity });
    }

    await user.save();

    res.status(200).json({ message: 'Product added to cart successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const removeProductFromCart = async (req, res) => {
  try {
    const id = req.user._id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      id,
      { $pull: { cart: { productId } } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'Product removed from cart successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const changeCartQuantity = async (req, res) => {
  try {
    const id = req.user._id;
    const { productId, quantity } = req.body;

    if (!productId || typeof quantity !== 'number') {
      return res.status(400).json({ error: 'Product ID and quantity are required' });
    }

    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const cartItem = user.cart.find(item => item.productId.toString() === productId);
    if (!cartItem) {
      return res.status(404).json({ error: 'Product not in cart' });
    }

    cartItem.quantity = quantity;
    await user.save();

    res.status(200).json({ message: 'Cart quantity updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCart = async (req, res) => {
  try {
    const id = req.user._id;

    const user = await userModel.findById(id).populate({
      path: 'cart.productId',
      select: 'name price description quantity' // Adjust based on your product model fields
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const populatedCart = user.cart.map(item => ({
      product: item.productId,
      quantity: item.quantity
    }));

    res.status(200).json({ cart: populatedCart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export default {
  viewProducts,
  searchProduct,
  filterProducts,
  sortProducts,
  addProductToCart,
  removeProductFromCart,
  changeCartQuantity,
  getCart
};

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

export default {
  viewProducts,
  searchProduct,
  filterProducts,
  sortProducts,
};

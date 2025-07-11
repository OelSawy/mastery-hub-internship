import productModel from "../models/product.js";
import mongoose from "mongoose";

const addProduct = async (req, res) => {
  const { name, description, price, quantity } = req.body;
  try {
    if (!name || !description || !price || !quantity) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    if (typeof name !== "string" || typeof description !== "string") {
      return res.status(400).json({ message: "Must be a string" });
    }
    if (typeof price !== "number" || price <= 0) {
      return res
        .status(400)
        .json({ message: "Price must be a positive number." });
    }
    if (typeof quantity !== "number" || quantity < 0) {
      return res
        .status(400)
        .json({ message: "Quantity must be a non-negative number." });
    }

    const newProduct = new productModel({
      name,
      description,
      price,
      quantity,
    });
    const prod = await newProduct.save();

    res
      .status(201)
      .json({ message: "Product added successfully", product: prod });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding product", error: error.message });
  }
};

const uploadPicture = async (req, res) => {
  try {
    const { id } = req.body;

    // Check if a file is uploaded
    if (!req.file) {
      return res.status(400).json({ message: "Product image is required." });
    }

    // Convert the file buffer to a Base64 string
    const base64Image = req.file.buffer.toString("base64");

    // Update the product with the new image
    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      { picture: base64Image },
      { new: true, runValidators: true }
    );

    // Check if the product was found
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Return the updated product
    res
      .status(200)
      .json({ message: "Uploaded successfully", data: updatedProduct });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error uploading photo", error: error.message });
  }
};

const editProduct = async (req, res) => {
  try {
    const { id, name, description, price, quantity} =
      req.body;

    // Validate if the id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID format." });
    }

    // Check if at least one field is provided for update
    if (
      !name &&
      !description &&
      !price &&
      !quantity
    ) {
      return res
        .status(400)
        .json({ message: "At least one field must be provided for update." });
    }

    // Find the product by ID and update the product details
    const updatedProduct = await productModel.findOneAndUpdate(
      { _id: id }, // search by _id
      {
        $set: {
          name: name !== undefined ? name : undefined,
          description: description !== undefined ? description : undefined,
          price: price !== undefined ? price : undefined,
          quantity: quantity !== undefined ? quantity : undefined,
        },
      }, // update these fields
      { new: true, runValidators: true } // return the updated document and ensure validators are applied
    );

    // If the product is not found, return 404
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Return the updated product
    res
      .status(200)
      .json({
        message: "Product updated successfully",
        product: updatedProduct,
      });
  } catch (error) {
    // Handle errors during product update
    res
      .status(500)
      .json({ message: "Error updating product", error: error.message });
  }
};

const deleteProduct = async (req, res) => {
    // Get the product ID from the request parameters
    const id = req.params.id;

    try {
        // Validate if the id is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid product ID format." });
        }

        // Find the product by ID and delete it
        const deletedProduct = await productModel.findByIdAndDelete(id);

        // If the product is not found, return 404
        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Return a success message
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        // Handle errors during product deletion
        res.status(500).json({ message: "Error deleting product", error: error.message });
    }
}

const viewOrders = async (req, res) => {
  try {
    const orders = await orderModel.find().populate("userId", "firstName lastName email");
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};

export default {
  addProduct,
  uploadPicture,
  editProduct,
  deleteProduct,
  viewOrders
};

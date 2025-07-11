// product.js (Using ES Modules)
import mongoose from "mongoose";
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    picture: {
      type: String,
      required: false,
    },
    reviews: [
      {
        userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
        review: { type: String, required: true },
      },
    ],
    quantity: {
      type: Number,
      required: true,
    },
    rating: [
      {
        userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
        rating: { type: Number, min: 0, max: 5, required: true },
      },
    ],
    averageRating: { type: Number, default: 0 },
    purchasers: [{ type: mongoose.Types.ObjectId, ref: "User" }], // List of tourist IDs who purchased the product
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;

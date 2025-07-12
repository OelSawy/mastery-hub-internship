import userModel from "../../models/user.js";
import dotenv from "dotenv";
import productModel from "../../models/product.js";
import Stripe from "stripe";
import orderModel from "../../models/order.js";
import SibApiV3Sdk from "sib-api-v3-sdk";

dotenv.config();

const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;
const transactionalEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const checkoutCart = async (req, res) => {
  const userId = req.user._id;
  const { paymentMethod } = req.body;

  if (!paymentMethod) {
    return res
      .status(400)
      .json({ error: "Missing required field: paymentMethod" });
  }

  try {
    const user = await userModel.findById(userId);
    if (!user || !user.cart || user.cart.length === 0) {
      return res.status(404).json({ error: "User not found or cart is empty" });
    }

    const orderProducts = [];
    let totalAmount = 0;

    for (const item of user.cart) {
      const product = await productModel.findById(item.productId);
      if (!product) {
        return res
          .status(404)
          .json({ error: `Product with ID ${item.productId} not found` });
      }

      if (product.quantity < item.quantity) {
        return res
          .status(400)
          .json({ error: `Not enough stock for ${product.name}` });
      }

      product.quantity -= item.quantity;
      if (!product.purchasers.includes(userId)) {
        product.purchasers.push(userId);
      }
      await product.save();

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderProducts.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    let paymentIntent = null;
    if (paymentMethod === "card") {
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100),
        currency: "usd",
        payment_method_types: ["card"],
        payment_method: "pm_card_visa", // Simulated method
        confirm: true,
      });
    }

    const order = await orderModel.create({
      userId,
      products: orderProducts,
      totalPrice: totalAmount,
      paymentMethod,
      orderDate: new Date(),
      deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    });

    user.cart = [];
    user.orders.push(order._id);
    await user.save();

    await sendProductInvoice(order);

    return res.status(200).json({
      success: true,
      message:
        paymentMethod === "card" ? "Payment successful" : "Cash on Delivery",
      order,
      ...(paymentIntent && { paymentIntent }),
    });
  } catch (error) {
    console.error("Checkout Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

const cancelOrder = async (req, res) => {
  const { orderId } = req.body;

  try {
    const order = await orderModel.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const user = await userModel.findById(order.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (["Cancelled", "Shipped", "Delivered"].includes(order.status)) {
      return res
        .status(400)
        .json({ error: `Order is already ${order.status.toLowerCase()}` });
    }

    for (const item of order.products) {
      const product = await productModel.findById(item.productId);
      if (!product) continue;

      product.quantity += item.quantity;
      product.purchasers = product.purchasers.filter(
        (purchaserId) => purchaserId.toString() !== user._id.toString()
      );
      await product.save();
    }

    order.status = "Cancelled";
    await order.save();

    await sendCancellationNotice(order);

    res
      .status(200)
      .json({ success: true, message: "Order cancelled successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const sendProductInvoice = async (order) => {
  const user = await userModel.findById(order.userId);
  if (!user) throw new Error("User not found");

  const products = [];

  for (const item of order.products) {
    const product = await productModel.findById(item.productId);
    if (product) {
      products.push({
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
      });
    }
  }

  const now = new Date(order.orderDate);
  const formattedDate = `${now.getDate()}-${
    now.getMonth() + 1
  }-${now.getFullYear()}`;

  const emailContent = {
    sender: { name: "Marketplace Hub", email: "nnnh7240@gmail.com" },
    to: [{ email: user.email }],
    templateId: 2, // Replace with your actual template ID
    params: {
      firstName: user.firstName,
      lastName: user.lastName,
      orderId: order._id,
      orderDate: formattedDate,
      products,
      totalPrice: order.totalPrice,
      currentYear: now.getFullYear(),
    },
  };

  await transactionalEmailApi.sendTransacEmail(emailContent);
};

const sendCancellationNotice = async (order) => {
  const user = await userModel.findById(order.userId);
  if (!user) throw new Error("User not found");

  const products = [];

  for (const item of order.products) {
    const product = await productModel.findById(item.productId);
    if (product) {
      products.push({
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
      });
    }
  }

  const now = new Date();
  const formattedDate = `${now.getDate()}-${
    now.getMonth() + 1
  }-${now.getFullYear()}`;

  const emailContent = {
    sender: { name: "Marketplace Hub", email: "nnnh7240@gmail.com" },
    to: [{ email: user.email }],
    templateId: 3, // Replace with your actual template ID
    params: {
      firstName: user.firstName,
      lastName: user.lastName,
      orderId: order._id,
      cancellationDate: formattedDate,
      products,
      totalPrice: order.totalPrice,
      currentYear: now.getFullYear(),
    },
  };

  await transactionalEmailApi.sendTransacEmail(emailContent);
};

export default {
  checkoutCart,
  cancelOrder,
};

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'user',
  },
  resetToken: {
      type: String,
  },
  resetTokenExpiration: {
      type: Date,
  },
  cart: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        default: 1
      }
    }
  ],
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    }
  ],
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  const user = this;

  if (!user.isModified('password')) return next();

  try {
    const saltRounds = 10;
    user.password = await bcrypt.hash(user.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();
  
  if (update.password) {
    try {
      const saltRounds = 10;
      update.password = await bcrypt.hash(update.password, saltRounds);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
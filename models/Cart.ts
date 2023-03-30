import mongoose from 'mongoose';
import { CART_STATUS } from '../util';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Cart extends mongoose.Document {
  userId: string;
  status: 'Ordered' | 'Active' | 'Inactive';
  items: CartItem[];
}

const CartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
});

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
    },
    status: {
      type: String,
      enum: Object.values(CART_STATUS),
      default: CART_STATUS.ACTIVE,
      required: true,
    },
    items: [CartItemSchema],
    shippingAddress: { type: String, required: true },
    billingAddress: { type: String, required: true },
    customerEmail: { type: String, required: true },
  },
  { timestamps: true }
);

const CartModel = mongoose.model<Cart>('Cart', CartSchema);
const CartItemModel = mongoose.model<CartItem>('CartItem', CartItemSchema);

export { CartModel, CartItemModel };

import mongoose from 'mongoose';
import { DISCOUNT_TYPES } from '../util';

export interface Discount extends mongoose.Document {
  code: string;
  description: string;
  type: string;
  value: number;
  productId?: string;
  minimumCartValue?: number;
  maxCappedDiscount: number;
  startDate: Date;
  endDate: Date;
}

const discountSchema = new mongoose.Schema<Discount>(
  {
    code: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: Object.values(DISCOUNT_TYPES),
      required: true,
    },
    value: { type: Number, required: true }, // in percentage
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    minimumCartValue: { type: Number, min: 0 },
    maxCappedDiscount: { type: Number, required: true, min: 10 }, // in rupees
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export const DiscountModel = mongoose.model<Discount>(
  'Discount',
  discountSchema
);

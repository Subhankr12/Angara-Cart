import mongoose from 'mongoose';

export interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  addedAt?: Date;
}

export interface Wishlist extends mongoose.Document {
  userId: string;
  items: WishlistItem[];
}

const wishlistItemSchema = new mongoose.Schema({
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
  addedAt: { type: Date, default: Date.now },
});

const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    items: [wishlistItemSchema],
  },
  { timestamps: true }
);

const WishlistModel = mongoose.model<Wishlist>('Wishlist', wishlistSchema);
const WishlistItemModel = mongoose.model<WishlistItem>(
  'WishlistItem',
  wishlistItemSchema
);

export { WishlistModel, WishlistItemModel };

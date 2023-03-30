import express from 'express';
import * as wishlistController from '../controllers';
import {
  addWishlistItemValidator,
  getWishlistItemsValidator,
} from '../middlewares';

const wishlistRouter = express.Router();

wishlistRouter.get(
  '/',
  getWishlistItemsValidator,
  wishlistController.getWishlistItems
);
wishlistRouter.post(
  '/',
  addWishlistItemValidator,
  wishlistController.addWishlistItem
);
wishlistRouter.put('/:productId', wishlistController.updateWishlistItem);
wishlistRouter.delete('/:productId', wishlistController.deleteWishlistItem);
wishlistRouter.delete('/', wishlistController.emptyWishlist);

wishlistRouter.put(
  '/move-to-cart/:productId',
  wishlistController.moveWishlistItemToCart
);
wishlistRouter.put(
  '/cart/move-to-wishlist/:productId',
  wishlistController.moveCartItemToWishlist
);

export { wishlistRouter };

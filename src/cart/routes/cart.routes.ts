import express from 'express';
import * as cartController from '../controllers';
import {
  addCartItemValidator,
  updateCartItemValidator,
  getCartItemsValidator,
  markCartStatusValidator,
  applyDiscountOnCartItemValidator,
} from '../middlewares';

const cartRouter = express.Router();

cartRouter.get('/', getCartItemsValidator, cartController.getCartItems);
cartRouter.post('/', addCartItemValidator, cartController.addCartItem);
cartRouter.put(
  '/:productId',
  updateCartItemValidator,
  cartController.updateCartItem
);
cartRouter.delete('/:productId', cartController.deleteCartItem);
cartRouter.delete('/', cartController.emptyCart);
cartRouter.post('/merge', cartController.mergeCarts);
cartRouter.post(
  '/mark-status',
  markCartStatusValidator,
  cartController.markCartStatus
);
cartRouter.post(
  '/apply-discount',
  applyDiscountOnCartItemValidator,
  cartController.applyDiscountOnCartItem
);

export { cartRouter };

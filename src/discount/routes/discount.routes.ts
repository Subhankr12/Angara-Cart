import express from 'express';
import * as discountController from '../controllers';
import {
  createDiscountValidator,
  deleteDiscountValidator,
  getDiscountByIdValidator,
  updateDiscountValidator,
} from '../middlewares';

const discountRouter = express.Router();

discountRouter.get('/', discountController.getDiscounts);
discountRouter.post(
  '/',
  createDiscountValidator,
  discountController.createDiscount
);
discountRouter.get(
  '/:id',
  getDiscountByIdValidator,
  discountController.getDiscountById
);
discountRouter.put(
  '/:id',
  updateDiscountValidator,
  discountController.updateDiscount
);
discountRouter.delete(
  '/:id',
  deleteDiscountValidator,
  discountController.deleteDiscount
);

export { discountRouter };

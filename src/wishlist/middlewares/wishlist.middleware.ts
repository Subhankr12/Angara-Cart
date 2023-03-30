import { NextFunction, Request, Response } from 'express';
import axios from 'axios';

import { config } from '../../../config';
import { errorResponse, STATUS_CODES } from '../../../util';
import { WishlistModel } from '../../../models';

export const getWishlistItemsValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.body;

  try {
    if (!userId) {
      throw {
        code: STATUS_CODES.UNPROCESSABLE_ENTITY,
        message: 'User id required!',
      };
    }

    const wishlistExists = await WishlistModel.count({ userId });
    if (!wishlistExists) {
      throw {
        code: STATUS_CODES.NOT_FOUND,
        message: 'Wishlist not found',
      };
    }

    next();
  } catch (error: any) {
    return errorResponse({
      code: error.code,
      message: error.message,
      error,
      res,
    });
  }
};

export const addWishlistItemValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { productId } = req.body;

  try {
    // Check if product is in stock
    const productResponse = await axios.get(
      `${config.productMicroserviceBaseUrl}/products/${productId}`
    );
    const product = productResponse.data;

    if (!product) {
      throw {
        code: STATUS_CODES.NOT_FOUND,
        message: 'Product not found',
      };
    }

    next();
  } catch (error: any) {
    return errorResponse({
      code: error.code,
      message: error.message,
      error,
      res,
    });
  }
};

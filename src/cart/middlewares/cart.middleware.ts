import { NextFunction, Request, Response } from 'express';
import axios from 'axios';

import { config } from '../../../config';
import { CART_STATUS, errorResponse, STATUS_CODES } from '../../../util';
import { CartModel, DiscountModel } from '../../../models';

export const getCartItemsValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, guestCartId } = req.body;

  try {
    if (!userId && !guestCartId) {
      throw {
        code: STATUS_CODES.UNPROCESSABLE_ENTITY,
        message: 'Guest cartId or userId required!',
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

export const addCartItemValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { productId, quantity } = req.body;

  try {
    // Check if product is in stock
    const productResponse = await axios.get(
      `${config.productMicroserviceBaseUrl}/products/${productId}`
    );
    const product = productResponse.data;

    if (!product || product.quantity < quantity) {
      throw {
        code: STATUS_CODES.UNPROCESSABLE_ENTITY,
        message: 'Product not in stock',
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

export const updateCartItemValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  try {
    // Check if product is in stock
    const productResponse = await axios.get(
      `${config.productMicroserviceBaseUrl}/products/${productId}`
    );
    const product = productResponse.data;

    if (!product || product.quantity < quantity) {
      throw {
        code: STATUS_CODES.UNPROCESSABLE_ENTITY,
        message: 'Product not in stock',
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

export const markCartStatusValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, status } = req.body;

  try {
    if (!userId || !status) {
      throw {
        code: STATUS_CODES.UNPROCESSABLE_ENTITY,
        message: 'Parameters missing!',
      };
    }

    const cartStatuses = Object.values(CART_STATUS);
    if (!cartStatuses.includes(status)) {
      throw {
        code: STATUS_CODES.UNPROCESSABLE_ENTITY,
        message: `status can only be ${cartStatuses}`,
      };
    }

    const cartExists = await CartModel.count({ userId });
    if (!cartExists) {
      throw {
        code: STATUS_CODES.NOT_FOUND,
        message: 'Cart not found',
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

export const applyDiscountOnCartItemValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, discountId } = req.body;

  try {
    if (!userId || !discountId) {
      throw {
        code: STATUS_CODES.UNPROCESSABLE_ENTITY,
        message: 'Parameters missing!',
      };
    }

    const cartExists = await CartModel.count({ userId });
    if (!cartExists) {
      throw {
        code: STATUS_CODES.NOT_FOUND,
        message: 'Cart not found',
      };
    }

    const currDate = new Date();
    const yesterDay = currDate.setDate(currDate.getDate() - 1);
    const discountExists = await DiscountModel.count({
      _id: discountId,
      endDate: { $gt: yesterDay },
    });
    if (!discountExists) {
      throw {
        code: STATUS_CODES.NOT_FOUND,
        message: 'Discount not found or expired',
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

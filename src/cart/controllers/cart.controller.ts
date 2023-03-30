import { Request, Response } from 'express';
import axios from 'axios';

import { CartModel, DiscountModel } from '../../../models';
import { config } from '../../../config';
import { successResponse, errorResponse, STATUS_CODES } from '../../../util';
import { addCartItemHelper, mergeCartsHelper } from '../services';

/**
 * Get user cart items
 */
export const getCartItems = async (req: Request, res: Response) => {
  const { userId, guestCartId } = req.body;

  try {
    const data: Record<string, any> = {};

    if (guestCartId) {
      const cartData = await CartModel.findOne({
        _id: guestCartId,
        userId: null,
      });
      data.cartData = cartData;
    } else {
      const cartData = await CartModel.findOne({ userId });
      data.cartData = cartData;
    }

    return successResponse({
      data,
      message: 'Successfully retrieved cart data',
      res,
    });
  } catch (error: any) {
    return errorResponse({
      message: 'Failed to retrieve cart data',
      error,
      res,
    });
  }
};

/**
 * Add items to the guest or logged in user's cart
 */
export const addCartItem = async (req: Request, res: Response) => {
  const {
    userId = null,
    guestCartId = null,
    productId,
    quantity,
    price,
    shippingAddress,
    billingAddress,
    customerEmail,
  } = req.body;

  try {
    // Fetch product data from product microservice
    const productResponse = await axios.get(
      `${config.productMicroserviceBaseUrl}/products/${productId}`
    );
    const product = productResponse.data;

    const data = await addCartItemHelper({
      userId,
      guestCartId,
      productId,
      quantity,
      price,
      product,
      shippingAddress,
      billingAddress,
      customerEmail,
    });

    return successResponse({
      data,
      message: 'Item added to cart',
      res,
    });
  } catch (error: any) {
    return errorResponse({
      message: 'Failed to add item to cart',
      error,
      res,
    });
  }
};

/**
 * Update logged in user's cart items
 */
export const updateCartItem = async (req: Request, res: Response) => {
  const { productId } = req.params;
  const { userId, price, quantity } = req.body;

  try {
    const existingCart = await CartModel.findOne({ userId });

    if (!existingCart) {
      throw {
        code: STATUS_CODES.NOT_FOUND,
        message: 'User cart not found',
      };
    }

    const existingItem = existingCart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (!existingItem) {
      throw {
        code: STATUS_CODES.NOT_FOUND,
        message: 'Item not found in cart',
      };
    }

    existingItem.price = price;
    existingItem.quantity = quantity;

    await existingCart.save();

    return successResponse({
      message: 'Item updated in cart',
      res,
    });
  } catch (error: any) {
    return errorResponse({
      message: 'Failed to update item in cart',
      error,
      res,
    });
  }
};

/**
 * Delete cart items
 */
export const deleteCartItem = async (req: Request, res: Response) => {
  const { productId } = req.params;
  const { userId } = req.body;

  try {
    const existingCart = await CartModel.findOne({ userId });

    if (!existingCart) {
      throw {
        code: STATUS_CODES.NOT_FOUND,
        message: 'Cart not found',
      };
    }

    existingCart.items = existingCart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await existingCart.save();

    return successResponse({
      message: 'Item removed from cart',
      res,
    });
  } catch (error: any) {
    return errorResponse({
      message: 'Failed to remove item from cart',
      error,
      res,
    });
  }
};

/**
 * Empty user's cart
 */
export const emptyCart = async (req: Request, res: Response) => {
  const { userId } = req.body;

  try {
    const existingCart = await CartModel.findOne({ userId });

    if (!existingCart) {
      throw {
        code: STATUS_CODES.NOT_FOUND,
        message: 'Cart not found',
      };
    }

    existingCart.items = [];

    await existingCart.save();

    return successResponse({
      message: 'Cart emptied',
      res,
    });
  } catch (error: any) {
    return errorResponse({
      message: 'Failed to empty cart',
      error,
      res,
    });
  }
};

/**
 * Merge guest user and logged in user's carts
 * This API is called upon user's successful login in users auth microservice
 */
export const mergeCarts = async (req: Request, res: Response) => {
  const { guestCartId, userId } = req.body;

  try {
    const userCart = await mergeCartsHelper({ guestCartId, userId });

    return successResponse({
      data: {
        userCart,
      },
      message: 'Carts merged',
      res,
    });
  } catch (error: any) {
    return errorResponse({
      message: 'Failed to merge carts',
      error,
      res,
    });
  }
};

/**
 * Update cart status to - Ordered, Active, Inactive
 */
export const markCartStatus = async (req: Request, res: Response) => {
  const { userId, status } = req.body;

  try {
    const userCart = (await CartModel.findOne({ userId })) as Record<
      string,
      any
    >;

    userCart.status = status;
    await userCart.save();

    return successResponse({
      data: {
        userCart,
      },
      message: 'Cart status updated',
      res,
    });
  } catch (error: any) {
    return errorResponse({
      message: 'Failed to update cart status',
      error,
      res,
    });
  }
};

/**
 * Apply discount on cart items
 */
export const applyDiscountOnCartItem = async (req: Request, res: Response) => {
  const { userId, discountId, productIds } = req.body;

  try {
    const currDate = new Date();
    const yesterDay = currDate.setDate(currDate.getDate() - 1);

    const [userCart, discountDetails] = (await Promise.all([
      CartModel.findOne({ userId }).lean(),
      DiscountModel.findOne({
        _id: discountId,
        endDate: { $gt: yesterDay },
      }).lean(),
    ])) as Array<Record<string, any>>;

    let totalCartQuantity = 0;
    userCart.items.forEach(
      (item: Record<string, any>) => (totalCartQuantity += item.quantity)
    );

    if (totalCartQuantity < discountDetails.minimumCartValue) {
      throw {
        code: STATUS_CODES.FORBIDDEN,
        message: 'Minimum cart value is not fulfilled to apply this discount',
      };
    }

    userCart.items.forEach((item: Record<string, any>) => {
      const totalPrice = item.price * item.quantity;
      item.totalPrice = totalPrice;

      if (!productIds.includes(item.productId.toString())) {
        item.discountPrice = null;
        item.discountPriceAfterTax = null;
        return;
      }

      const taxRate = 0.1; // example tax rate
      const tax = totalPrice * taxRate;
      const discountPrice = Math.min(
        (totalPrice * discountDetails.value) / 100,
        discountDetails.maxCappedDiscount
      );

      item.discountPrice = totalPrice - discountPrice;
      item.discountPriceAfterTax = totalPrice - discountPrice + tax;
    });

    return successResponse({
      data: {
        userCart,
      },
      message: 'Cart items with discounts retrieved successfully',
      res,
    });
  } catch (error: any) {
    return errorResponse({
      message: 'Failed to retrieve cart items with discounts',
      error,
      res,
    });
  }
};

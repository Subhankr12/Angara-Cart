import { Request, Response } from 'express';
import axios from 'axios';

import {
  CartItemModel,
  CartModel,
  WishlistItemModel,
  WishlistModel,
} from '../../../models';
import { config } from '../../../config';
import { successResponse, errorResponse, STATUS_CODES } from '../../../util';

/**
 * Get user wishlist items
 */
export const getWishlistItems = async (req: Request, res: Response) => {
  const { userId } = req.body;

  try {
    const wishlistData = await WishlistModel.findOne({ userId });

    return successResponse({
      data: {
        wishlistData,
      },
      message: 'Successfully retrieved wishlist data',
      res,
    });
  } catch (error: any) {
    return errorResponse({
      message: 'Failed to retrieve wishlist data',
      error,
      res,
    });
  }
};

/**
 * Add user wishlist items
 */
export const addWishlistItem = async (req: Request, res: Response) => {
  const { userId, productId } = req.body;

  try {
    const productResponse = await axios.get(
      `${config.productMicroserviceBaseUrl}/products/${productId}`
    );
    const product = productResponse.data;

    const existingWishlist = await WishlistModel.findOne({ userId });

    if (existingWishlist) {
      const existingItem = existingWishlist.items.find(
        (item) => item.productId.toString() === productId
      );

      if (existingItem) {
        throw {
          code: STATUS_CODES.BAD_REQUEST,
          message: 'Item already in wishlist',
        };
      } else {
        existingWishlist.items.push({
          productId,
          name: product.name,
          price: product.price,
        });
      }

      await existingWishlist.save();
    } else {
      await WishlistModel.create({
        userId,
        items: [
          {
            productId,
            name: product.name,
            price: product.price,
          },
        ],
      });
    }

    return successResponse({
      message: 'Item added to wishlist',
      res,
    });
  } catch (error: any) {
    return errorResponse({
      message: 'Failed to add item to wishlist',
      error,
      res,
    });
  }
};

/**
 * Update user wishlist items
 */
export const updateWishlistItem = async (req: Request, res: Response) => {
  const { productId } = req.params;
  const { userId, name, price } = req.body;

  try {
    const existingWishlist = await WishlistModel.findOne({ userId });

    if (!existingWishlist) {
      throw {
        code: STATUS_CODES.NOT_FOUND,
        message: 'Wishlist not found',
      };
    }

    const itemIndex = existingWishlist.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      throw {
        code: STATUS_CODES.BAD_REQUEST,
        message: 'Item not found in wishlist',
      };
    }

    existingWishlist.items[itemIndex].name =
      name || existingWishlist.items[itemIndex].name;
    existingWishlist.items[itemIndex].price =
      price || existingWishlist.items[itemIndex].price;

    await existingWishlist.save();

    return successResponse({
      message: 'Item updated in wishlist',
      res,
    });
  } catch (error: any) {
    return errorResponse({
      message: 'Failed to update item in wishlist',
      error,
      res,
    });
  }
};

/**
 * Delete user wishlist items
 */
export const deleteWishlistItem = async (req: Request, res: Response) => {
  const { productId } = req.params;
  const { userId } = req.body;

  try {
    const existingWishlist = await WishlistModel.findOne({ userId });

    if (!existingWishlist) {
      throw {
        code: STATUS_CODES.NOT_FOUND,
        message: 'Wishlist not found',
      };
    }

    existingWishlist.items = existingWishlist.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await existingWishlist.save();

    return successResponse({
      message: 'Item removed from wishlist',
      res,
    });
  } catch (error: any) {
    return errorResponse({
      message: 'Failed to remove item from wishlist',
      error,
      res,
    });
  }
};

/**
 * Empty user wishlist
 */
export const emptyWishlist = async (req: Request, res: Response) => {
  const { userId } = req.body;

  try {
    const existingWishlist = await WishlistModel.findOne({ userId });

    if (!existingWishlist) {
      throw {
        code: STATUS_CODES.NOT_FOUND,
        message: 'Wishlist not found',
      };
    }

    existingWishlist.items = [];

    await existingWishlist.save();

    return successResponse({
      message: 'Wishlist emptied',
      res,
    });
  } catch (error: any) {
    return errorResponse({
      message: 'Failed to empty wishlist',
      error,
      res,
    });
  }
};

/**
 * Move cart item to wishlist
 */
export const moveCartItemToWishlist = async (req: Request, res: Response) => {
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

    const existingWishlist = await WishlistModel.findOne({ userId });
    const existingItem = existingWishlist?.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      throw {
        code: STATUS_CODES.BAD_REQUEST,
        message: 'Item already in wishlist',
      };
    } else {
      const itemIndex = existingCart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (itemIndex === -1) {
        throw {
          code: STATUS_CODES.BAD_REQUEST,
          message: 'Item not found in cart',
        };
      }

      const item = existingCart.items[itemIndex];
      existingCart.items.splice(itemIndex, 1);

      await existingCart.save();

      const wishlistItem = new WishlistItemModel({
        productId: item.productId,
        name: item.name,
        price: item.price,
      });

      existingWishlist?.items.push(wishlistItem);

      existingWishlist?.save();

      return successResponse({
        message: 'Item moved to wishlist',
        res,
      });
    }
  } catch (error: any) {
    return errorResponse({
      message: 'Failed to move item to wishlist',
      error,
      res,
    });
  }
};

/**
 * Move wishlist item to cart
 */
export const moveWishlistItemToCart = async (req: Request, res: Response) => {
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

    const existingItem = existingCart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      throw {
        code: STATUS_CODES.BAD_REQUEST,
        message: 'Item already in cart',
      };
    } else {
      const existingWishlist = await WishlistModel.findOne({ userId });
      const itemIndex =
        existingWishlist?.items.findIndex(
          (item) => item.productId.toString() === productId
        ) || -1;

      if (itemIndex === -1) {
        throw {
          code: STATUS_CODES.BAD_REQUEST,
          message: 'Item not found in wishlist',
        };
      }

      const item = existingWishlist?.items[itemIndex] as Record<string, any>;
      existingWishlist?.items.splice(itemIndex, 1);

      await existingWishlist?.save();

      // Add item to cart
      const cartItem = new CartItemModel({
        productId: item.productId,
        name: item.name,
        price: item.price,
      });

      existingCart.items.push(cartItem);

      await existingCart.save();

      return successResponse({
        message: 'Item moved to cart',
        res,
      });
    }
  } catch (error: any) {
    return errorResponse({
      message: 'Failed to move item to cart',
      error,
      res,
    });
  }
};

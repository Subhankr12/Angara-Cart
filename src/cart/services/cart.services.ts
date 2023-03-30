import { CartModel } from '../../../models';
import { STATUS_CODES } from '../../../util';

export const addCartItemHelper = async (params: Record<string, any>) => {
  const {
    userId,
    guestCartId,
    productId,
    product,
    price,
    quantity,
    shippingAddress,
    billingAddress,
    customerEmail,
  } = params;
  const data: Record<string, any> = {};

  if (!userId && !guestCartId) {
    const newCart = await CartModel.create({
      userId,
      items: [
        {
          productId,
          name: product.name,
          price: price || product.price,
          quantity,
        },
      ],
      shippingAddress,
      billingAddress,
      customerEmail,
    });

    data.guestCartId = newCart._id;
  } else if (guestCartId && !userId) {
    const existingCart = await CartModel.findOne({
      _id: guestCartId,
      userId,
    });

    if (!existingCart) {
      throw {
        code: STATUS_CODES.UNPROCESSABLE_ENTITY,
        message: `Guest cart doesn't exist!`,
      };
    }

    const existingItem = existingCart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      existingCart.items.push({
        productId,
        name: product.name,
        price: price || product.price,
        quantity,
      });
    }

    await existingCart.save();
  } else if (userId) {
    const existingCart = await CartModel.findOne({ userId });

    if (existingCart) {
      const existingItem = existingCart.items.find(
        (item) => item.productId.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        existingCart.items.push({
          productId,
          name: product.name,
          price: price || product.price,
          quantity,
        });
      }

      await existingCart.save();
    } else {
      await CartModel.create({
        userId,
        items: [
          {
            productId,
            name: product.name,
            price: price || product.price,
            quantity,
          },
        ],
        shippingAddress,
        billingAddress,
        customerEmail,
      });
    }
  }

  return data;
};

export const mergeCartsHelper = async (params: Record<string, any>) => {
  const { guestCartId, userId } = params;

  const [guestCart, userCart] = await Promise.all([
    CartModel.findOne({ _id: guestCartId, userId: null }),
    CartModel.findOne({ userId: userId }),
  ]);

  if (!guestCart || !userCart) {
    throw new Error('Cart not found');
  }

  const guestCartItems = guestCart.items;
  guestCartItems.forEach((guestCartItem) => {
    const index = userCart.items.findIndex(
      (userCartItem) => userCartItem.productId === guestCartItem.productId
    );

    if (index !== -1) {
      userCart.items[index].quantity += guestCartItem.quantity;
    } else {
      userCart.items.push(guestCartItem);
    }
  });

  await userCart.save();

  await CartModel.findByIdAndDelete(guestCartId);

  return userCart;
};

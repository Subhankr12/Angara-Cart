import { NextFunction, Request, Response } from 'express';
import { DiscountModel } from '../../../models';

import { DISCOUNT_TYPES, errorResponse, STATUS_CODES } from '../../../util';

export const createDiscountValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    code,
    description,
    type,
    value,
    minimumCartValue,
    maxCappedDiscount,
    startDate,
    endDate,
  } = req.body;

  try {
    if (
      !code ||
      !description ||
      !type ||
      !value ||
      !minimumCartValue ||
      !maxCappedDiscount ||
      !startDate ||
      !endDate
    ) {
      throw {
        code: STATUS_CODES.UNPROCESSABLE_ENTITY,
        message: 'Field missing for creating discount!',
      };
    }

    const discountTypes = Object.values(DISCOUNT_TYPES);
    if (!discountTypes.includes(type)) {
      throw {
        code: STATUS_CODES.UNPROCESSABLE_ENTITY,
        message: `Type can only be ${discountTypes}`,
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

export const getDiscountByIdValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id: discountId } = req.params;

  try {
    const discountExists = await DiscountModel.count({ _id: discountId });
    if (!discountExists) {
      throw {
        code: STATUS_CODES.NOT_FOUND,
        message: 'Discount not found',
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

export const updateDiscountValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id: discountId } = req.params;

  try {
    const discountExists = await DiscountModel.count({ _id: discountId });
    if (!discountExists) {
      throw {
        code: STATUS_CODES.NOT_FOUND,
        message: 'Discount not found',
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

export const deleteDiscountValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id: discountId } = req.params;

  try {
    const discountExists = await DiscountModel.count({ _id: discountId });
    if (!discountExists) {
      throw {
        code: STATUS_CODES.NOT_FOUND,
        message: 'Discount not found',
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

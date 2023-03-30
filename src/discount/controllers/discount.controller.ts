import { Request, Response } from 'express';
import { DiscountModel } from '../../../models';
import { errorResponse, successResponse } from '../../../util';

/**
 * Fetches all discounts
 */
export const getDiscounts = async (req: Request, res: Response) => {
  try {
    const discounts = await DiscountModel.find({});

    return successResponse({
      data: {
        discounts,
      },
      message: 'Discounts retrieved successfully',
      res,
    });
  } catch (error: any) {
    return errorResponse({
      message: 'Failed to retrieve discounts',
      error,
      res,
    });
  }
};

/**
 * Creates a new discount
 */
export const createDiscount = async (req: Request, res: Response) => {
  try {
    const discount = new DiscountModel(req.body);
    const discountDetails = await discount.save();

    return successResponse({
      data: {
        discount: discountDetails,
      },
      message: 'Discount created successfully',
      res,
    });
  } catch (error: any) {
    return errorResponse({
      message: 'Failed to create discount',
      error,
      res,
    });
  }
};

/**
 * Fetches a single discount by ID
 */
export const getDiscountById = async (req: Request, res: Response) => {
  try {
    const discount = await DiscountModel.findById(req.params.id);

    return successResponse({
      data: {
        discount,
      },
      message: 'Discount retrieved successfully',
      res,
    });
  } catch (error: any) {
    return errorResponse({
      message: 'Failed to retrieve discount',
      error,
      res,
    });
  }
};

/**
 * Updates a discount by ID
 */
export const updateDiscount = async (req: Request, res: Response) => {
  try {
    const discount = await DiscountModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    return successResponse({
      data: {
        discount,
      },
      message: 'Successfully updated discount',
      res,
    });
  } catch (error: any) {
    return errorResponse({
      message: 'Failed to update discount',
      error,
      res,
    });
  }
};

/**
 * Deletes a discount by ID
 */
export const deleteDiscount = async (req: Request, res: Response) => {
  try {
    const discount = await DiscountModel.findByIdAndDelete(req.params.id);

    return successResponse({
      data: {
        discount,
      },
      message: 'Successfully deleted discount',
      res,
    });
  } catch (error: any) {
    return errorResponse({
      message: 'Failed to delete discount',
      error,
      res,
    });
  }
};

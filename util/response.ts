import { Response } from 'express';
import { STATUS_CODES } from './common';

export const successResponse = ({
  code = STATUS_CODES.SUCCESS,
  message = 'Success!',
  data = {},
  res,
}: {
  code?: number;
  message?: string;
  data?: Record<string, any>;
  res: Response;
}) => {
  return res.status(200).json({
    statusCode: code,
    data,
    message,
  });
};

export const errorResponse = ({
  code,
  message,
  error,
  res,
}: {
  code?: number;
  message?: string;
  error: Record<string, any>;
  res: Response;
}) => {
  console.error('Error in Angara Cart: ', error);
  if (error && !code && !message) {
    code =
      (error && error.response && error.response.status) ||
      (error && error.code);
    message = error && error.message;
  }

  if (!code) {
    code = STATUS_CODES.FAILED;
  }
  if (!message) {
    message = 'Internal server error!';
  }

  return res.status(500).json({
    statusCode: code,
    message,
    error: 'Internal server error',
  });
};

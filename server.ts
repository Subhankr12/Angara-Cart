import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { config } from './config';
import connectDB from './config/mongoose';
import { cartRouter, discountRouter, wishlistRouter } from './src';

const app = express();
const PORT = config.port;

app.use(express.json());

app.use('/cart', cartRouter);
app.use('/discount', discountRouter);
app.use('/wishlist', wishlistRouter);

// Start the server
app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server started on port ${PORT}`);
});

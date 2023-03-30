export const config = {
  mongoUri: `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jdbyc.mongodb.net/angara-cart?retryWrites=true&w=majority`,
  secret: process.env.JWT_SECRET || 'mysecret',
  port: process.env.PORT || 3000,
  productMicroserviceBaseUrl:
    process.env.PRODUCT_SERVICE_BASE_URL || 'http://localhost:4000',
};

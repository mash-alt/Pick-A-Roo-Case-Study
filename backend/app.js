const express = require('express');
const cors = require('cors');

const logger = require('./middleware/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const storeRoutes = require('./routes/storeRoutes');
const productRoutes = require('./routes/productRoutes');
const shopperRoutes = require('./routes/shopperRoutes');
const orderRoutes = require('./routes/orderRoutes');
const orderItemRoutes = require('./routes/orderItemRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const adminUserRoutes = require('./routes/adminUserRoutes');
const adminStoreRoutes = require('./routes/adminStoreRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

app.get('/', (req, res) => {
  res.json({
    message: 'Delivery API is running',
    docs: {
      auth: '/api/auth',
      users: '/api/users',
      stores: '/api/stores',
      products: '/api/products',
      shoppers: '/api/shoppers',
      orders: '/api/orders',
      orderItems: '/api/order-items',
      deliveries: '/api/deliveries'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/shoppers', shopperRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/order-items', orderItemRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/stores', adminStoreRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

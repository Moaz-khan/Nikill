const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const categoriesRoutes = require('./routes/categories');
const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const settingsRoutes = require('./routes/settings');
const userdataRoutes = require('./routes/userdata');
const reviewsRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');
const usersRoutes = require('./routes/users');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/user', userdataRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', usersRoutes);
// Health Check
app.get('/', (req, res) => {
  res.send('NIKILL Backend is running...');
});

if (process.env.NODE_ENV !== 'production' || process.env.RUN_LOCAL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;

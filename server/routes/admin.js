const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// GET admin dashboard stats
router.get('/stats', async (req, res) => {
  try {
    // 1. Total Revenue
    const { data: revenueData, error: revError } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('status', 'paid');
    
    const totalRevenue = revenueData?.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0) || 0;

    // 2. Total Orders
    const { count: totalOrders, error: orderError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // 3. Active Users
    const { count: totalUsers, error: userError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // 4. Products Count
    const { count: totalProducts, error: prodError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // 5. Recent Orders
    const { data: recentOrders, error: recentError } = await supabase
      .from('orders')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(5);

    // 6. Top Products (By Order Count)
    const { data: topProducts, error: topError } = await supabase
      .from('order_items')
      .select('product_id, product_name, price_at_purchase')
      // This is a simple count, for real top products we'd need a more complex query or post-processing
      .limit(10);
    
    // Simple frequency map for top products
    const productFrequency = {};
    topProducts?.forEach(item => {
      productFrequency[item.product_id] = (productFrequency[item.product_id] || 0) + 1;
    });
    
    // Sort and get top IDs (this is simplified)
    const topProductIds = Object.keys(productFrequency)
      .sort((a, b) => productFrequency[b] - productFrequency[a])
      .slice(0, 5);

    res.status(200).json({
      stats: {
        totalRevenue: `$${totalRevenue.toLocaleString()}`,
        totalOrders: totalOrders || 0,
        activeUsers: totalUsers || 0,
        totalProducts: totalProducts || 0,
        revenueChange: '+12.5%', // Mocked for now
        ordersChange: '+8.2%',   // Mocked for now
        usersChange: '-2.4%',    // Mocked for now
        productsChange: '+4.1%',  // Mocked for now
      },
      recentOrders: recentOrders?.map(order => ({
        id: `#NK-${order.id.toString().slice(-4).toUpperCase()}`,
        customer: order.profiles?.full_name || 'Guest',
        product: 'Multiple Items', // Simplified
        total: `$${order.total_amount}`,
        status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
        date: new Date(order.created_at).toLocaleDateString()
      })) || [],
      topProducts: [] // Will be populated by real product data in frontend if needed
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

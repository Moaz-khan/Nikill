const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// ============ CART ============

// GET cart items for a user
router.get('/cart/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn("Supabase cart fetch error:", error.message);
      return res.status(200).json([]);
    }
    res.status(200).json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ADD item to cart (or increase quantity if exists)
router.post('/cart', async (req, res) => {
  try {
    const { userId, productId, name, price, originalPrice, image, color, size } = req.body;
    const cartItemId = `${productId}-${color}-${size}`;

    // Check if item already exists
    const { data: existing } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('cart_item_id', cartItemId)
      .single();

    if (existing) {
      // Update quantity
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + 1 })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    // Insert new
    const { data, error } = await supabase
      .from('cart_items')
      .insert([{
        user_id: userId,
        cart_item_id: cartItemId,
        product_id: productId,
        name, price, original_price: originalPrice || null,
        image, color, size, quantity: 1
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE cart item quantity
router.put('/cart/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    if (quantity < 1) {
      const { error } = await supabase.from('cart_items').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ message: 'Item removed' });
    }
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE cart item
router.delete('/cart/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('cart_items').delete().eq('id', id);
    if (error) throw error;
    res.status(200).json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CLEAR entire cart for a user (after checkout)
router.delete('/cart/clear/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { error } = await supabase.from('cart_items').delete().eq('user_id', userId);
    if (error) throw error;
    res.status(200).json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ FAVORITES ============

// GET favorites for a user
router.get('/favorites/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn("Supabase favorites fetch error:", error.message);
      return res.status(200).json([]);
    }
    res.status(200).json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ADD to favorites
router.post('/favorites', async (req, res) => {
  try {
    const { userId, productId, name, price, originalPrice, image, category } = req.body;

    // Check if already favorited
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (existing) {
      return res.status(200).json({ message: 'Already in favorites', id: existing.id });
    }

    const { data, error } = await supabase
      .from('favorites')
      .insert([{
        user_id: userId,
        product_id: productId,
        name, price, original_price: originalPrice || null,
        image, category: category || null
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// REMOVE from favorites
router.delete('/favorites/:userId/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);
    if (error) throw error;
    res.status(200).json({ message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// ADD a new review
router.post('/', async (req, res) => {
  try {
    const { productId, userId, userName, avatarUrl, rating, reviewText } = req.body;

    if (!productId || !rating || !reviewText) {
      return res.status(400).json({ error: 'Product ID, rating, and review text are required' });
    }

    // 1. Insert the review
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert([{
        product_id: productId,
        user_id: userId || null,
        user_name: userName || 'Anonymous',
        avatar_url: avatarUrl || null,
        rating,
        review_text: reviewText
      }])
      .select()
      .single();

    if (reviewError) throw reviewError;

    // 2. Update product average rating and count
    // Fetch all reviews for this product
    const { data: allReviews, error: fetchError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId);

    if (!fetchError && allReviews) {
      const count = allReviews.length;
      const average = allReviews.reduce((sum, r) => sum + r.rating, 0) / count;

      await supabase
        .from('products')
        .update({
          rating: parseFloat(average.toFixed(1)),
          reviews_count: count
        })
        .eq('id', productId);
    }

    res.status(201).json(review);
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET reviews for a product
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ADMIN REVIEW MANAGEMENT ============

// GET all reviews
router.get('/all', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, products(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE review status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { data, error } = await supabase
      .from('reviews')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE review
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) throw error;
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

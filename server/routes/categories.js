const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// GET ALL CATEGORIES
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) {
      console.warn("Supabase categories fetch error:", error.message);
      return res.status(200).json(getMockCategories());
    }
    res.status(200).json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET TOP CATEGORIES
router.get('/top', async (req, res) => {
  try {
    // Assuming there is a 'categories' table in Supabase
    // To fetch only top categories, you can use .eq('is_top', true) if such column exists
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_top', true)
      .limit(6);

    // If table doesn't exist or we hit an error, we fallback to mock data or throw
    if (error) {
      console.warn("Supabase categories fetch error (returning mock data):", error.message);
      return res.status(200).json(getMockCategories());
    }

    if (!data || data.length === 0) {
      return res.status(200).json(getMockCategories());
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function getMockCategories() {
  return [
    { id: 1, name: 'Sneakers', description: 'Latest trending sneakers', image_url: '/assets/hero1.png' },
    { id: 2, name: 'Running', description: 'Performance running shoes', image_url: '/assets/hero2.png' },
    { id: 3, name: 'Basketball', description: 'Court-ready basketball kicks', image_url: '/assets/hero3.png' },
    { id: 4, name: 'Lifestyle', description: 'Everyday casual wear', image_url: '/assets/hero4.png' }
  ];
}

module.exports = router;

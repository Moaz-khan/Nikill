const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// GET settings (masked keys — cannot copy real key)
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*');

    if (error) {
      return res.status(200).json([]);
    }

    // Mask all secret values — only show last 4 characters
    const maskedData = (data || []).map(item => {
      if (item.is_secret && item.value) {
        const val = item.value;
        const masked = '•'.repeat(Math.max(val.length - 4, 8)) + val.slice(-4);
        return { ...item, value: masked, is_masked: true };
      }
      return { ...item, is_masked: false };
    });

    res.status(200).json(maskedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE or INSERT a setting
router.post('/update', async (req, res) => {
  try {
    const { key, value } = req.body;

    if (!key || !value) {
      return res.status(400).json({ error: 'Key and value are required' });
    }

    // Check if key already exists
    const { data: existing } = await supabase
      .from('app_settings')
      .select('id')
      .eq('key', key)
      .single();

    if (existing) {
      // Update
      const { error } = await supabase
        .from('app_settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('key', key);

      if (error) throw error;
    } else {
      // Insert
      const is_secret = key.toLowerCase().includes('secret') || key.toLowerCase().includes('key');
      const { error } = await supabase
        .from('app_settings')
        .insert([{ key, value, is_secret }]);

      if (error) throw error;
    }

    // If it's a Stripe key, also update the env (for current server session)
    if (key === 'STRIPE_SECRET_KEY') {
      process.env.STRIPE_SECRET_KEY = value;
    }
    if (key === 'STRIPE_PUBLISHABLE_KEY') {
      process.env.STRIPE_PUBLISHABLE_KEY = value;
    }

    res.status(200).json({ message: `Setting "${key}" updated successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET raw key value (for internal server use only — NOT exposed on frontend)
router.get('/internal/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { data } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', key)
      .single();

    if (data) {
      res.status(200).json({ value: data.value });
    } else {
      res.status(404).json({ error: 'Setting not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET Stripe publishable key (safe to expose to frontend — this is a PUBLIC key)
router.get('/stripe-publishable-key', async (req, res) => {
  try {
    const { data } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'STRIPE_PUBLISHABLE_KEY')
      .single();

    if (data) {
      res.status(200).json({ publishableKey: data.value });
    } else {
      res.status(404).json({ error: 'Stripe publishable key not configured' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

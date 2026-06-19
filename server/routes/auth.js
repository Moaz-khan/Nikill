const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const Stripe = require('stripe');

// Helper: get Stripe instance
async function getStripe() {
  try {
    const { data } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'STRIPE_SECRET_KEY')
      .single();
    if (data && data.value) return Stripe(data.value);
  } catch (e) {}
  if (process.env.STRIPE_SECRET_KEY) return Stripe(process.env.STRIPE_SECRET_KEY);
  return null;
}

// SIGNUP API — Also creates Stripe Customer
router.post('/signup', async (req, res) => {
  const { email, password, full_name } = req.body;

  try {
    // 1. Sign up user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
        }
      }
    });

    if (authError) throw authError;

    const userId = authData.user?.id;

    // 2. Create Stripe Customer
    let stripeCustomerId = null;
    try {
      const stripe = await getStripe();
      if (stripe) {
        const customer = await stripe.customers.create({
          email: email,
          name: full_name,
          metadata: { supabase_user_id: userId }
        });
        stripeCustomerId = customer.id;
      }
    } catch (stripeErr) {
      console.warn('Stripe customer creation failed (non-blocking):', stripeErr.message);
    }

    // 3. Save stripe_customer_id in profiles table
    if (userId && stripeCustomerId) {
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', userId);
    }

    res.status(201).json({ 
      message: 'User registered successfully. Please check your email for verification.',
      user: authData.user,
      stripeCustomerId
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// LOGIN API — Also ensures Stripe Customer exists
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const userId = data.user?.id;

    // Check if user has stripe_customer_id, if not create one
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', userId)
        .single();

      if (profile && !profile.stripe_customer_id) {
        try {
          const stripe = await getStripe();
          if (stripe) {
            const customer = await stripe.customers.create({
              email: data.user.email,
              name: data.user.user_metadata?.full_name || email,
              metadata: { supabase_user_id: userId }
            });
            await supabase
              .from('profiles')
              .update({ stripe_customer_id: customer.id })
              .eq('id', userId);
          }
        } catch (e) {
          console.warn('Stripe customer creation on login failed:', e.message);
        }
      }
    }

    res.status(200).json({
      message: 'Login successful',
      session: data.session,
      user: data.user
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

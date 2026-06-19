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
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Stripe secret key not configured. Add it from Admin Panel → Settings.');
  }
  return Stripe(process.env.STRIPE_SECRET_KEY);
}

// Helper: get stripe_customer_id for a user
async function getStripeCustomerId(userId) {
  if (!userId) return null;
  const { data } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();
  return data?.stripe_customer_id || null;
}

// ============ PAYMENT METHODS ============

// GET saved payment methods for a user
router.get('/payment-methods/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });

    if (error) throw error;
    res.status(200).json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SAVE a new payment method
router.post('/payment-methods/save', async (req, res) => {
  try {
    const { userId, cardBrand, last4, expMonth, expYear, cardholderName, stripePaymentMethodId, isDefault } = req.body;

    if (isDefault) {
      await supabase.from('payment_methods').update({ is_default: false }).eq('user_id', userId);
    }

    const { data, error } = await supabase
      .from('payment_methods')
      .insert([{
        user_id: userId, card_brand: cardBrand, last4,
        exp_month: expMonth, exp_year: expYear,
        cardholder_name: cardholderName,
        stripe_payment_method_id: stripePaymentMethodId || null,
        is_default: isDefault || false
      }])
      .select().single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE a payment method
router.delete('/payment-methods/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('payment_methods').delete().eq('id', id);
    if (error) throw error;
    res.status(200).json({ message: 'Payment method deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SET default payment method
router.put('/payment-methods/:id/default', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    await supabase.from('payment_methods').update({ is_default: false }).eq('user_id', userId);
    const { error } = await supabase.from('payment_methods').update({ is_default: true }).eq('id', id);
    if (error) throw error;
    res.status(200).json({ message: 'Default payment method updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ADMIN ORDER MANAGEMENT ============

// GET all orders
router.get('/all', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE order status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { data, error } = await supabase
      .from('orders')
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

// GET orders for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ CHECKOUT ============

// CREATE PAYMENT INTENT — with Stripe Customer & product IDs
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, items, userId } = req.body;
    const stripe = await getStripe();
    const amountInCents = Math.round(parseFloat(amount) * 100);

    // Get Stripe customer ID
    const stripeCustomerId = await getStripeCustomerId(userId);

    // Build line items metadata with stripe product/price IDs
    const itemsMeta = [];
    for (const item of items) {
      // Fetch stripe IDs from database
      let stripeProductId = null;
      let stripePriceId = null;
      if (item.productId) {
        const { data: prod } = await supabase
          .from('products')
          .select('stripe_product_id, stripe_price_id')
          .eq('id', item.productId)
          .single();
        if (prod) {
          stripeProductId = prod.stripe_product_id;
          stripePriceId = prod.stripe_price_id;
        }
      }
      itemsMeta.push({
        productId: item.productId, name: item.name,
        color: item.color, size: item.size,
        quantity: item.quantity, price: item.price,
        stripeProductId, stripePriceId
      });
    }

    const piParams = {
      amount: amountInCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: userId || 'guest',
        itemsJson: JSON.stringify(itemsMeta)
      }
    };

    // Attach Stripe Customer if exists
    if (stripeCustomerId) {
      piParams.customer = stripeCustomerId;
      piParams.setup_future_usage = 'on_session'; // allows saving card to customer
    }

    const paymentIntent = await stripe.paymentIntents.create(piParams);
    res.status(200).json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (error) {
    console.error('Payment Intent error:', error);
    res.status(500).json({ error: error.message });
  }
});

// CONFIRM ORDER — save order, invoice, payment method to database
router.post('/confirm', async (req, res) => {
  try {
    const { items, total, subtotal, discount, promoCode, userId, paymentIntentId, saveCard } = req.body;
    const stripe = await getStripe();

    // 1. Retrieve PaymentIntent from Stripe to get real card details & invoice
    let paymentIntent = null;
    let paymentMethodDetails = null;
    let stripeInvoiceId = null;
    let stripeInvoiceUrl = null;
    let stripePaymentMethodId = null;

    if (paymentIntentId) {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
        expand: ['payment_method', 'latest_charge']
      });

      if (paymentIntent.payment_method && typeof paymentIntent.payment_method === 'object') {
        paymentMethodDetails = paymentIntent.payment_method.card;
        stripePaymentMethodId = paymentIntent.payment_method.id;
      }

      // Get receipt/charge info
      const charge = paymentIntent.latest_charge;
      if (charge && typeof charge === 'object') {
        stripeInvoiceUrl = charge.receipt_url;
      }

      // Try to create a proper Stripe Invoice for record-keeping
      const stripeCustomerId = await getStripeCustomerId(userId);
      if (stripeCustomerId) {
        try {
          // Create invoice items for each product
          for (const item of items) {
            let stripePriceId = null;
            if (item.productId) {
              const { data: prod } = await supabase
                .from('products')
                .select('stripe_price_id, stripe_product_id')
                .eq('id', item.productId)
                .single();
              stripePriceId = prod?.stripe_price_id;
            }

            if (stripePriceId) {
              await stripe.invoiceItems.create({
                customer: stripeCustomerId,
                price: stripePriceId,
                quantity: item.quantity
              });
            } else {
              // Fallback: create with amount
              const unitAmount = Math.round(parseFloat(String(item.price).replace(/[^0-9.]/g, '')) * 100);
              await stripe.invoiceItems.create({
                customer: stripeCustomerId,
                amount: unitAmount * item.quantity,
                currency: 'usd',
                description: `${item.name} (${item.color}, Size ${item.size}) x${item.quantity}`
              });
            }
          }

          // Create and finalize invoice
          const invoice = await stripe.invoices.create({
            customer: stripeCustomerId,
            auto_advance: true,
            collection_method: 'charge_automatically',
            metadata: { payment_intent_id: paymentIntentId }
          });
          
          // Pay the invoice (since payment already collected via PaymentIntent)
          const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
          await stripe.invoices.pay(finalizedInvoice.id, { paid_out_of_band: true });
          
          stripeInvoiceId = finalizedInvoice.id;
          stripeInvoiceUrl = finalizedInvoice.hosted_invoice_url || stripeInvoiceUrl;
        } catch (invErr) {
          console.warn('Invoice creation failed (non-blocking):', invErr.message);
        }
      }
    }

    // 2. Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: userId || null,
        subtotal, discount_amount: discount || 0,
        total_amount: total,
        promo_code: promoCode || null,
        status: 'paid',
        stripe_payment_intent_id: paymentIntentId || null,
        stripe_invoice_id: stripeInvoiceId || null,
        stripe_invoice_url: stripeInvoiceUrl || null,
        stripe_payment_method_id: stripePaymentMethodId || null
      }])
      .select().single();

    if (orderError) throw orderError;

    // 3. Create order items (with stripe product/price IDs)
    const orderItems = [];
    for (const item of items) {
      let stripeProductId = null;
      let stripePriceId = null;
      if (item.productId) {
        const { data: prod } = await supabase
          .from('products')
          .select('stripe_product_id, stripe_price_id')
          .eq('id', item.productId)
          .single();
        stripeProductId = prod?.stripe_product_id;
        stripePriceId = prod?.stripe_price_id;
      }
      orderItems.push({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.name,
        selected_color: item.color,
        selected_size: item.size,
        quantity: item.quantity,
        price_at_purchase: parseFloat(String(item.price).replace(/[^0-9.]/g, '')),
        stripe_product_id: stripeProductId,
        stripe_price_id: stripePriceId
      });
    }
    await supabase.from('order_items').insert(orderItems);

    // 4. Save payment method if requested
    if (saveCard && paymentMethodDetails && userId) {
      const { data: existing } = await supabase
        .from('payment_methods')
        .select('id')
        .eq('user_id', userId)
        .eq('last4', paymentMethodDetails.last4)
        .single();

      if (!existing) {
        await supabase.from('payment_methods').insert([{
          user_id: userId,
          card_brand: paymentMethodDetails.brand,
          last4: paymentMethodDetails.last4,
          exp_month: paymentMethodDetails.exp_month,
          exp_year: paymentMethodDetails.exp_year,
          cardholder_name: 'Cardholder',
          stripe_payment_method_id: stripePaymentMethodId,
          is_default: false
        }]);
      }
    }

    res.status(200).json({
      success: true,
      order,
      invoiceUrl: stripeInvoiceUrl
    });
  } catch (error) {
    console.error('Order confirm error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET STRIPE PUBLISHABLE KEY
router.get('/stripe-key', async (req, res) => {
  try {
    const { data } = await supabase
      .from('app_settings').select('value')
      .eq('key', 'STRIPE_PUBLISHABLE_KEY').single();
    if (data && data.value) return res.status(200).json({ publishableKey: data.value });
    if (process.env.STRIPE_PUBLISHABLE_KEY) return res.status(200).json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
    res.status(404).json({ error: 'Stripe publishable key not configured' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ BULK SYNC ALL PRODUCTS TO STRIPE ============
router.post('/sync-products-to-stripe', async (req, res) => {
  try {
    const stripe = await getStripe();
    const { data: products, error } = await supabase.from('products').select('*, product_images(image_url)');
    if (error) throw error;
    if (!products || products.length === 0) return res.status(200).json({ message: 'No products to sync', synced: 0 });

    let synced = 0, skipped = 0, errors = [];

    for (const product of products) {
      try {
        const existing = await stripe.products.search({ query: `metadata['supabase_id']:'${product.id}'` });

        if (existing.data.length > 0) {
          const sp = existing.data[0];
          await stripe.products.update(sp.id, {
            name: product.name, description: product.description || '', active: true,
            metadata: { supabase_id: product.id, category: product.category_name || '', audience: product.target_audience || '' }
          });
          const prices = await stripe.prices.list({ product: sp.id, active: true });
          const currentPrice = Math.round(product.price * 100);
          let activePriceId = prices.data.length > 0 ? prices.data[0].id : null;
          if (prices.data.length > 0 && prices.data[0].unit_amount !== currentPrice) {
            const np = await stripe.prices.create({ product: sp.id, unit_amount: currentPrice, currency: 'usd' });
            await stripe.products.update(sp.id, { default_price: np.id });
            activePriceId = np.id;
            for (const op of prices.data) await stripe.prices.update(op.id, { active: false });
          }
          await supabase.from('products').update({ stripe_product_id: sp.id, stripe_price_id: activePriceId }).eq('id', product.id);
          skipped++;
        } else {
          let imageUrl = null;
          if (product.product_images?.length > 0) {
            const img = product.product_images[0].image_url;
            if (img?.startsWith('http')) imageUrl = img;
          }
          const sp = await stripe.products.create({
            name: product.name,
            description: product.description || `${product.target_audience || ''} ${product.category_name || ''} Shoes`.trim(),
            images: imageUrl ? [imageUrl] : [],
            metadata: { supabase_id: product.id, category: product.category_name || '', audience: product.target_audience || '' },
            default_price_data: { unit_amount: Math.round(product.price * 100), currency: 'usd' }
          });
          await supabase.from('products').update({ stripe_product_id: sp.id, stripe_price_id: sp.default_price }).eq('id', product.id);
          synced++;
        }
      } catch (e) {
        errors.push({ product: product.name, error: e.message });
      }
    }
    res.status(200).json({ message: `Sync complete! ${synced} new, ${skipped} updated.`, synced, skipped, total: products.length, errors: errors.length > 0 ? errors : undefined });
  } catch (error) {
    console.error('Stripe sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

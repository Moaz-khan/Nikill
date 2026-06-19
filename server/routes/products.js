const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// GET ALL PRODUCTS
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('products').select('*, product_images(image_url), product_colors(*)');
    if (error) {
      console.warn("Supabase products fetch error:", error.message);
      return res.status(200).json(getMockProducts());
    }
    if (!data || data.length === 0) {
      return res.status(200).json(getMockProducts());
    }
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET FEATURED PRODUCTS
router.get('/featured', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(image_url), product_colors(*)')
      .eq('is_featured', true)
      .limit(8);

    if (error) {
      console.warn("Supabase products fetch error (returning mock data):", error.message);
      return res.status(200).json(getMockProducts());
    }

    if (!data || data.length === 0) {
      return res.status(200).json(getMockProducts());
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET SINGLE PRODUCT BY ID
router.get('/detail/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(id, image_url, is_primary, display_order), product_colors(id, name, hex_code)')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Also fetch reviews
    const { data: reviews } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', id)
      .order('created_at', { ascending: false });

    // Also fetch related products from same category
    const { data: related } = await supabase
      .from('products')
      .select('*, product_images(image_url)')
      .eq('category_name', data.category_name)
      .neq('id', id)
      .limit(4);

    res.status(200).json({
      ...data,
      reviews: reviews || [],
      related_products: related || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET PRODUCTS BY CATEGORY NAME (Sneakers, Running, Sports, etc.)
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(image_url), product_colors(*)')
      .ilike('category_name', category);

    if (error) {
      return res.status(200).json([]);
    }
    res.status(200).json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET PRODUCTS BY TARGET AUDIENCE (Men, Women, Kids, Baby, Baba, New Born)
router.get('/audience/:audience', async (req, res) => {
  try {
    const audience = req.params.audience;
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(image_url), product_colors(*)')
      .ilike('target_audience', audience);

    if (error) {
      console.warn("Supabase fetch error:", error.message);
      return res.status(200).json(getMockProducts());
    }
    
    if (!data || data.length === 0) {
      return res.status(200).json(getMockProducts());
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET NEW ARRIVALS
router.get('/new-arrivals', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(image_url), product_colors(*)')
      .eq('discount_badge', 'New');

    if (error) {
      console.warn("Supabase fetch error:", error.message);
      return res.status(200).json(getMockProducts());
    }
    
    if (!data || data.length === 0) {
      return res.status(200).json(getMockProducts());
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET SALE PRODUCTS
router.get('/sale', async (req, res) => {
  try {
    // Fetch products where discount_badge contains "OFF"
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(image_url), product_colors(*)')
      .ilike('discount_badge', '%OFF%');

    if (error) {
      console.warn("Supabase fetch error:", error.message);
      return res.status(200).json(getMockProducts());
    }
    
    if (!data || data.length === 0) {
      return res.status(200).json(getMockProducts());
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ADD NEW PRODUCT (WITH COLORS, IMAGES, CATEGORY)
router.post('/add', upload.array('files', 4), async (req, res) => {
  try {
    const { name, description, price, category_name, targetAudience, isNewArrival, isOnSale, discountPercent, isFeatured, isTopCategory } = req.body;
    const colors = JSON.parse(req.body.colors || '[]');
    
    let uploadedFiles = req.files || [];
    let fileIndex = 0;
    
    let finalImages = [];
    for (let i = 0; i < 4; i++) {
        const type = req.body[`image_type_${i}`];
        if (type === 'file' && fileIndex < uploadedFiles.length) {
            const file = uploadedFiles[fileIndex];
            // Upload to Supabase Storage
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const fileName = uniqueSuffix + path.extname(file.originalname);
            
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('products')
              .upload(fileName, file.buffer, {
                contentType: file.mimetype
              });
              
            if (!uploadError) {
              const { data: publicUrlData } = supabase.storage.from('products').getPublicUrl(fileName);
              finalImages.push(publicUrlData.publicUrl);
            } else {
              console.warn("Supabase upload error:", uploadError.message);
            }
            fileIndex++;
        } else if (type === 'url' && req.body[`image_urls_${i}`]) {
            finalImages.push(req.body[`image_urls_${i}`]);
        }
    }
    
    let category_id = null;
    if (category_name) {
      // Find category
      let { data: catData } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', category_name)
        .single();
        
      if (catData) {
        category_id = catData.id;
        if (isTopCategory === 'true') {
          await supabase.from('categories').update({ is_top: true }).eq('id', category_id);
        }
      } else {
        // Create category
        const { data: newCat } = await supabase
          .from('categories')
          .insert([{ name: category_name, is_top: isTopCategory === 'true' }])
          .select()
          .single();
        
        if (newCat) category_id = newCat.id;
      }
    }

    // Calculate prices and badges
    let original_price = null;
    let final_price = parseFloat(price) || 0;
    let discount_badge = null;

    if (isOnSale && discountPercent) {
        const disc = parseFloat(discountPercent);
        if (disc > 0 && disc < 100) {
            original_price = final_price;
            final_price = final_price - (final_price * (disc / 100));
            discount_badge = `${disc}% OFF`;
        }
    } else if (isNewArrival) {
        discount_badge = 'New';
    }

    // Insert Product
    const { data: productData, error: productError } = await supabase
      .from('products')
      .insert([{ 
        name, 
        description, 
        price: final_price,
        original_price,
        discount_badge,
        is_featured: isFeatured === 'true',
        category_id,
        category_name,
        target_audience: targetAudience
      }])
      .select()
      .single();

    if (productError) throw productError;
    const productId = productData.id;

    // Insert Images
    if (finalImages.length > 0) {
      const imageRecords = finalImages.filter(img => img.trim() !== '').map((img, index) => ({
        product_id: productId,
        image_url: img,
        is_primary: index === 0,
        display_order: index
      }));
      if (imageRecords.length > 0) {
         await supabase.from('product_images').insert(imageRecords);
      }
    }

    // Insert Colors
    if (colors && colors.length > 0) {
      const colorRecords = colors.map(c => ({
        product_id: productId,
        name: c.name,
        hex_code: c.hex
      }));
      await supabase.from('product_colors').insert(colorRecords);
    }

    res.status(201).json({ message: 'Product added successfully', product: productData });

  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE PRODUCT
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete images and colors first (though foreign key cascade might handle it if set up)
    await supabase.from('product_images').delete().eq('product_id', id);
    await supabase.from('product_colors').delete().eq('product_id', id);
    
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function getMockProducts() {
  return [
    { id: 1, name: 'Nike Air Max 270', price: 150, category: 'Sneakers', image_url: '/assets/hero7.png', is_featured: true },
    { id: 2, name: 'Adidas Ultraboost 22', price: 190, category: 'Running', image_url: '/assets/hero5.png', is_featured: true },
    { id: 3, name: 'Puma RS-X3', price: 110, category: 'Sneakers', image_url: '/assets/hero6.png', is_featured: true },
    { id: 4, name: 'Nike Air Force 1', price: 120, category: 'Lifestyle', image_url: '/assets/hero1.png', is_featured: true }
  ];
}

module.exports = router;

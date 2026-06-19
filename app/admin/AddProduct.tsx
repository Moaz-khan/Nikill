'use client';
import { fetchJson } from '../utils/fetchApi';
import React, { useState } from 'react';
import styles from './admin.module.css';

const PREDEFINED_COLORS = [
  { name: 'Red', hex: '#E63946' },
  { name: 'Blue', hex: '#1D3557' },
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Grey', hex: '#808080' },
  { name: 'Green', hex: '#2A9D8F' },
  { name: 'Yellow', hex: '#E9C46A' },
];

const TARGET_AUDIENCE = ['Men', 'Women', 'Baby', 'Baba', 'New Born'];
const PRODUCT_CATEGORIES = ['Sneakers', 'Running', 'Sports', 'Joggers', 'Lifestyle', 'Training', 'Basketball', 'Football'];

export default function AddProduct() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [targetAudience, setTargetAudience] = useState('Men');
  const [category, setCategory] = useState('Sneakers');
  const [customCategory, setCustomCategory] = useState('');
  const [selectedColors, setSelectedColors] = useState<{name: string, hex: string}[]>([]);
  const [images, setImages] = useState(['', '', '', '']);
  const [files, setFiles] = useState<(File | null)>([null, null, null, null]);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isOnSale, setIsOnSale] = useState(false);
  const [discountPercent, setDiscountPercent] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTopCategory, setIsTopCategory] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleColorToggle = (color: {name: string, hex: string}) => {
    if (selectedColors.find(c => c.name === color.name)) {
      setSelectedColors(selectedColors.filter(c => c.name !== color.name));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);

    if (value) {
      const newFiles = [...files];
      newFiles[index] = null;
      setFiles(newFiles);
    }
  };

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newFiles = [...files];
      newFiles[index] = file;
      setFiles(newFiles);
      
      const newImages = [...images];
      newImages[index] = '';
      setImages(newImages);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const finalCategory = category === 'Custom' ? customCategory : category;

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('targetAudience', targetAudience);
      formData.append('category_name', finalCategory);
      formData.append('colors', JSON.stringify(selectedColors));
      formData.append('isNewArrival', String(isNewArrival));
      formData.append('isOnSale', String(isOnSale));
      formData.append('discountPercent', discountPercent);
      formData.append('isFeatured', String(isFeatured));
      formData.append('isTopCategory', String(isTopCategory));

      for (let i = 0; i < 4; i++) {
        if (files[i]) {
          formData.append('files', files[i] as File);
          formData.append(`image_type_${i}`, 'file');
        } else if (images[i]) {
          formData.append(`image_urls_${i}`, images[i]);
          formData.append(`image_type_${i}`, 'url');
        }
      }

      const response = await fetch('/api/products/add', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        alert('Product added successfully to Supabase database!');
        setName('');
        setDescription('');
        setPrice('');
        setCustomCategory('');
        setSelectedColors([]);
        setImages(['', '', '', '']);
        setFiles([null, null, null, null]);
        setIsNewArrival(false);
        setIsOnSale(false);
        setDiscountPercent('');
        setIsFeatured(false);
        setIsTopCategory(false);
      } else {
        const errorData = await response.json();
        alert('Error adding product: ' + errorData.error);
      }
    } catch (error) {
      alert('Error connecting to server.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h2>Add New Product</h2>
          <p>Fill in the details to add a new product to your store and Supabase database.</p>
        </div>
      </div>

      <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600 }}>Product Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600 }}>Price ($)</label>
              <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600 }}>Target Audience</label>
              <select value={targetAudience} onChange={e => setTargetAudience(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                {TARGET_AUDIENCE.map(ta => <option key={ta} value={ta}>{ta}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600 }}>Product Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="Custom">Other (Type below)</option>
              </select>
            </div>

            {category === 'Custom' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: 'span 2' }}>
                <label style={{ fontWeight: 600 }}>Custom Category</label>
                <input type="text" value={customCategory} onChange={e => setCustomCategory(e.target.value)} placeholder="e.g. Formal Shoes" required={category === 'Custom'} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', padding: '1rem', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={isNewArrival} onChange={e => setIsNewArrival(e.target.checked)} style={{ width: '18px', height: '18px' }} />
              <span style={{ fontWeight: 600 }}>Mark as New Arrival</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={isOnSale} onChange={e => setIsOnSale(e.target.checked)} style={{ width: '18px', height: '18px' }} />
              <span style={{ fontWeight: 600 }}>Is on Sale?</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} style={{ width: '18px', height: '18px' }} />
              <span style={{ fontWeight: 600 }}>Show in Featured</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={isTopCategory} onChange={e => setIsTopCategory(e.target.checked)} style={{ width: '18px', height: '18px' }} />
              <span style={{ fontWeight: 600 }}>Make Top Category</span>
            </label>
            
            {isOnSale && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
                <label style={{ fontWeight: 600 }}>Discount (%)</label>
                <input type="number" min="1" max="99" value={discountPercent} onChange={e => setDiscountPercent(e.target.value)} required style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd', width: '80px' }} />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 600 }}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} required style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 600 }}>Product Images (URLs or Uploads)</label>
            <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>You can add up to 4 images. Type a URL or click "Choose File" to upload from your computer.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', background: '#fafafa' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#555' }}>Image {i + 1}</span>
                  <input type="text" placeholder={`Type Image URL ${i + 1}`} value={images[i]} onChange={e => handleImageChange(i, e.target.value)} disabled={files[i] !== null} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd', opacity: files[i] ? 0.5 : 1 }} />
                  <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#888' }}>OR</div>
                  <input type="file" accept="image/*" onChange={e => handleFileChange(i, e)} style={{ fontSize: '0.8rem' }} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 600 }}>Available Colors</label>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {PREDEFINED_COLORS.map(color => {
                const isSelected = selectedColors.find(c => c.name === color.name);
                return (
                  <button 
                    type="button"
                    key={color.name}
                    onClick={() => handleColorToggle(color)}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      borderRadius: '20px', 
                      border: `2px solid ${isSelected ? 'var(--primary, #FF4500)' : '#ddd'}`,
                      background: isSelected ? '#fff0e6' : '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: color.hex, border: '1px solid #ccc' }}></span>
                    {color.name}
                  </button>
                )
              })}
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ background: 'var(--primary, #FF4500)', color: '#fff', padding: '1rem', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '1rem' }}>
            {loading ? 'Adding Product to Database...' : 'Save Product to Supabase'}
          </button>
        </form>
      </div>
    </div>
  );
}

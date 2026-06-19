'use client';
import { fetchJson } from '../utils/fetchApi';

import React, { useState } from 'react';
import styles from './admin.module.css';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Layers, 
  Users, 
  ShoppingCart, 
  Image as ImageIcon, 
  MessageSquare, 
  Settings, 
  Plus, 
  Search, 
  MoreVertical,
  TrendingUp,
  DollarSign,
  Package,
  UserCheck,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Edit2,
  Trash2,
  Eye
} from 'lucide-react';
import Image from 'next/image';
import AddProduct from './AddProduct';
import StripeSettings from './StripeSettings';
import { useAuthStore } from '../store/authStore';

const AdminPanel = () => {
  const { user, isLoggedIn } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // Basic Admin Protection
  React.useEffect(() => {
    if (!isLoggedIn || user?.role !== 'admin') {
      // Redirect or show access denied
      // window.location.href = '/login'; 
    }
  }, [isLoggedIn, user]);

  if (!isLoggedIn || user?.role !== 'admin') {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050505', color: 'white' }}>
        <div style={{ textAlign: 'center' }}>
          <h1>Access Denied</h1>
          <p>You do not have permission to access the admin panel.</p>
          <button onClick={() => window.location.href = '/'} style={{ marginTop: '20px', padding: '10px 20px', background: '#FF6B00', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>Go Home</button>
        </div>
      </div>
    );
  }
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  React.useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const data = await fetchJson('/api/admin/stats');
        setStats(data.stats);
        setRecentOrders(data.recentOrders);
        
        // Also fetch products for the top selling list
        const pData = await fetchJson('/api/products');
        setProducts(pData.slice(0, 3));
      } else if (activeTab === 'products') {
        const data = await fetchJson('/api/products');
        setProducts(Array.isArray(data) ? data : []);
      } else if (activeTab === 'categories') {
        const data = await fetchJson('/api/categories');
        setCategories(data);
      } else if (activeTab === 'orders') {
        const data = await fetchJson('/api/orders/all');
        setOrders(data);
      } else if (activeTab === 'users') {
        const data = await fetchJson('/api/users');
        setUsers(data);
      } else if (activeTab === 'reviews') {
        const data = await fetchJson('/api/reviews/all');
        setReviews(data);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (e) {}
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (e) {}
  };

  const handleReviewAction = async (id: string, action: string) => {
    try {
      if (action === 'delete') {
        await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      } else {
        await fetch(`/api/reviews/${id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: action })
        });
      }
      fetchData();
    } catch (e) {}
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (e) {}
  };

  const displayStats = [
    { label: 'Total Revenue', value: stats?.totalRevenue || '$0', change: stats?.revenueChange || '0%', trend: 'up', icon: <DollarSign size={24} /> },
    { label: 'Total Orders', value: stats?.totalOrders || '0', change: stats?.ordersChange || '0%', trend: 'up', icon: <ShoppingCart size={24} /> },
    { label: 'Active Users', value: stats?.activeUsers || '0', change: stats?.usersChange || '0%', trend: 'down', icon: <Users size={24} /> },
    { label: 'Products', value: stats?.totalProducts || '0', change: stats?.productsChange || '0%', trend: 'up', icon: <Package size={24} /> },
  ];

  return (
    <div className={styles.adminContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>N</div>
          <span>NIKILL Admin</span>
        </div>

        <nav className={styles.nav}>
          <button 
            className={`${styles.navItem} ${activeTab === 'overview' ? styles.active : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={20} /> Overview
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'products' ? styles.active : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <ShoppingBag size={20} /> Products
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'add-product' ? styles.active : ''}`}
            onClick={() => setActiveTab('add-product')}
          >
            <Plus size={20} /> Add Product
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'categories' ? styles.active : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            <Layers size={20} /> Categories
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'orders' ? styles.active : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingCart size={20} /> Orders
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'users' ? styles.active : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={20} /> Users
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'content' ? styles.active : ''}`}
            onClick={() => setActiveTab('content')}
          >
            <ImageIcon size={20} /> Site Content
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'reviews' ? styles.active : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <MessageSquare size={20} /> Reviews
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          <button 
            className={`${styles.navItem} ${activeTab === 'settings' ? styles.active : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={20} /> Settings
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.searchBar}>
            <Search size={20} />
            <input type="text" placeholder="Search for anything..." />
          </div>
          <div className={styles.headerActions}>
            <button className={styles.notificationBtn}>
              <div className={styles.dot}></div>
              <Plus size={20} />
            </button>
            <div className={styles.adminProfile}>
              <div className={styles.adminInfo}>
                <p className={styles.adminName}>Admin Moaz</p>
                <p className={styles.adminRole}>Super Admin</p>
              </div>
              <div className={styles.adminAvatar}>M</div>
            </div>
          </div>
        </header>

        <div className={styles.contentBody}>
          {activeTab === 'overview' && (
            <div className={styles.overview}>
              <div className={styles.sectionHeader}>
                <h2>Dashboard Overview</h2>
                <div className={styles.dateFilter}>Last 30 Days</div>
              </div>

              <div className={styles.statsGrid}>
                {displayStats.map((stat, i) => (
                  <div key={i} className={styles.statCard}>
                    <div className={styles.statHeader}>
                      <div className={styles.statIcon}>{stat.icon}</div>
                      <span className={`${styles.statChange} ${stat.trend === 'up' ? styles.up : styles.down}`}>
                        {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {stat.change}
                      </span>
                    </div>
                    <div className={styles.statInfo}>
                      <p className={styles.statLabel}>{stat.label}</p>
                      <h3 className={styles.statValue}>{stat.value}</h3>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.dashboardGrid}>
                <div className={styles.recentOrdersCard}>
                  <div className={styles.cardHeader}>
                    <h3>Recent Orders</h3>
                    <button className={styles.viewAllBtn}>View All</button>
                  </div>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Customer</th>
                        <th>Product</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order, i) => (
                        <tr key={i}>
                          <td>{order.id}</td>
                          <td>{order.customer}</td>
                          <td>{order.product}</td>
                          <td>{order.total}</td>
                          <td>
                            <span className={`${styles.badge} ${styles[order.status.toLowerCase()]}`}>
                              {order.status}
                            </span>
                          </td>
                          <td><MoreVertical size={16} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className={styles.topProductsCard}>
                  <div className={styles.cardHeader}>
                    <h3>Top Selling</h3>
                  </div>
                  <div className={styles.productList}>
                    {products.map((p, i) => (
                      <div key={i} className={styles.productItem}>
                        <div className={styles.pInfo}>
                          <div className={styles.pImage}>
                            <Image src={p.product_images?.[0]?.image_url || '/assets/hero1.png'} alt={p.name} width={40} height={40} />
                          </div>
                          <div>
                            <p className={styles.pName}>{p.name}</p>
                            <p className={styles.pCat}>{p.category_name}</p>
                          </div>
                        </div>
                        <div className={styles.pSales}>
                          <p className={styles.pValue}>${p.price}</p>
                          <p className={styles.pStock}>{p.stock || 0} in stock</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2>Products Management</h2>
                  <p>Manage your inventory and update product details.</p>
                </div>
                <button className={styles.primaryBtn} onClick={() => setActiveTab('add-product')}><Plus size={20} /> Add Product</button>
              </div>

              <div className={styles.tableCard}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div className={styles.tableImage}>
                            <Image src={p.product_images?.[0]?.image_url || '/assets/hero1.png'} alt={p.name} width={50} height={50} />
                          </div>
                        </td>
                        <td className={styles.bold}>{p.name}</td>
                        <td>{p.category_name}</td>
                        <td className={styles.bold}>${p.price}</td>
                        <td>{p.stock || 0}</td>
                        <td>
                          <span className={`${styles.badge} ${styles.shipped}`}>In Stock</span>
                        </td>
                        <td>
                          <div className={styles.actionGroup}>
                            <button className={styles.iconBtn}><Edit2 size={18} /></button>
                            <button className={styles.iconBtn}><Eye size={18} /></button>
                            <button className={`${styles.iconBtn} ${styles.delete}`} onClick={() => handleDeleteProduct(p.id)}><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'add-product' && <AddProduct />}

          {activeTab === 'settings' && <StripeSettings />}

          {activeTab === 'categories' && (
            <div className={styles.section}>
               <div className={styles.sectionHeader}>
                <div>
                  <h2>Category Management</h2>
                  <p>Organize your products into accessible categories.</p>
                </div>
                <button className={styles.primaryBtn}><Plus size={20} /> New Category</button>
              </div>

              <div className={styles.categoryGrid}>
                {categories.map(cat => (
                  <div key={cat.id} className={styles.catCard}>
                    <div className={styles.catImage}>
                      <Image src={cat.image_url || '/assets/hero1.png'} alt={cat.name} width={200} height={150} />
                    </div>
                    <div className={styles.catInfo}>
                      <h3>{cat.name}</h3>
                      <p>{cat.product_count || 0} Products</p>
                    </div>
                    <div className={styles.catActions}>
                      <button className={styles.iconBtn}><Edit2 size={18} /></button>
                      <button className={`${styles.iconBtn} ${styles.delete}`}><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders Management */}
          {activeTab === 'orders' && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2>Order Management</h2>
                  <p>Track, manage and fulfill customer orders.</p>
                </div>
                <div className={styles.filterGroup}>
                  <button className={styles.filterBtn}>Export CSV</button>
                </div>
              </div>

              <div className={styles.tableCard}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className={styles.bold}>#NK-{order.id.toString().slice(-4).toUpperCase()}</td>
                        <td>{order.profiles?.full_name || 'Guest'}</td>
                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className={styles.bold}>${order.total_amount}</td>
                        <td>
                          <span className={`${styles.badge} ${order.status === 'paid' ? styles.delivered : styles.processing}`}>
                            {order.status === 'paid' ? 'Paid' : 'Pending'}
                          </span>
                        </td>
                        <td>
                          <select 
                            className={styles.statusSelect}
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          >
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="paid">Paid</option>
                          </select>
                        </td>
                        <td>
                          <div className={styles.actionGroup}>
                            <button className={styles.iconBtn}><Eye size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* User Management */}
          {activeTab === 'users' && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2>User Management</h2>
                  <p>Manage your customer base and administrative roles.</p>
                </div>
                <button className={styles.primaryBtn}><Plus size={20} /> Add New User</button>
              </div>

              <div className={styles.tableCard}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, i) => (
                      <tr key={i}>
                        <td>
                          <div className={styles.userCell}>
                            <div className={styles.userAvatarSmall}>{user.full_name?.[0] || 'U'}</div>
                            <span className={styles.bold}>{user.full_name}</span>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <span className={user.role?.includes('admin') ? styles.adminText : ''}>
                            {user.role}
                          </span>
                        </td>
                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                        <td>
                          <span className={`${styles.badge} ${styles.delivered}`}>
                            Active
                          </span>
                        </td>
                        <td>
                          <div className={styles.actionGroup}>
                            <button className={`${styles.iconBtn} ${styles.delete}`} onClick={() => handleDeleteUser(user.id)}><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Site Content Management */}
          {activeTab === 'content' && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2>Site Content</h2>
                  <p>Customize your landing page text, banners, and brand story.</p>
                </div>
                <button className={styles.primaryBtn}>Save All Changes</button>
              </div>

              <div className={styles.contentGrid}>
                <div className={styles.contentCard}>
                  <div className={styles.cardHeader}>
                    <h3>Hero Section</h3>
                  </div>
                  <div className={styles.form}>
                    <div className={styles.inputGroup}>
                      <label>Main Heading</label>
                      <input type="text" defaultValue="STEP INTO THE FUTURE OF COMFORT" />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Sub Heading</label>
                      <textarea defaultValue="Experience the ultimate fusion of cutting-edge technology and premium aesthetics." />
                    </div>
                  </div>
                </div>

                <div className={styles.contentCard}>
                  <div className={styles.cardHeader}>
                    <h3>Brand Story</h3>
                  </div>
                  <div className={styles.form}>
                    <div className={styles.inputGroup}>
                      <label>Title</label>
                      <input type="text" defaultValue="OUR JOURNEY" />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Story Content</label>
                      <textarea defaultValue="From humble beginnings to global footwear innovation..." />
                    </div>
                  </div>
                </div>

                <div className={styles.contentCard}>
                  <div className={styles.cardHeader}>
                    <h3>Promo Banner</h3>
                  </div>
                  <div className={styles.form}>
                    <div className={styles.inputGroup}>
                      <label>Promo Text</label>
                      <input type="text" defaultValue="GET 20% OFF ON YOUR FIRST ORDER" />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Promo Link</label>
                      <input type="text" defaultValue="/shop" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reviews Management */}
          {activeTab === 'reviews' && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2>Customer Reviews</h2>
                  <p>Moderate and manage feedback from your customers.</p>
                </div>
              </div>

              <div className={styles.reviewsList}>
                {reviews.map((review, i) => (
                  <div key={i} className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <div className={styles.userCell}>
                        <div className={styles.userAvatarSmall}>{review.user_name?.[0] || 'A'}</div>
                        <span className={styles.bold}>{review.user_name}</span>
                      </div>
                      <span className={`${styles.badge} ${styles[review.status?.toLowerCase() || 'pending']}`}>
                        {review.status || 'Pending'}
                      </span>
                    </div>
                    <div className={styles.reviewSub}>
                      <span>Product: {review.products?.name}</span>
                    </div>
                    <div className={styles.rating}>
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                    <p className={styles.reviewComment}>{review.review_text}</p>
                    <div className={styles.reviewActions}>
                      <button className={styles.approveBtn} onClick={() => handleReviewAction(review.id, 'approved')}>Approve</button>
                      <button className={styles.flagBtn} onClick={() => handleReviewAction(review.id, 'flagged')}>Flag</button>
                      <button className={styles.deleteBtnSmall} onClick={() => handleReviewAction(review.id, 'delete')}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;

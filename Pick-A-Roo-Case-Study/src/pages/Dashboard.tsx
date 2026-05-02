import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { BarChart3, ClipboardList, LayoutDashboard, PackagePlus, ShoppingBag, Plus, X, Edit, Trash2 } from 'lucide-react';
import { mapOrder } from '../api/mappers';

interface Product {
  Prod_ID: number;
  Prod_StoreID: number;
  Prod_Name: string;
  Prod_Price: number;
  Prod_Stock: number;
  Prod_ImageURL: string;
}

export default function Dashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders'>('overview');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({ Prod_Name: '', Prod_Price: '', Prod_Stock: '', Prod_ImageURL: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          api.get('/orders'),
          api.get('/products')
        ]);
        setOrders(ordersRes.data.data?.map(mapOrder).filter(Boolean) || []);
        setProducts(productsRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const revenue = useMemo(() => orders.reduce((acc, cur) => acc + (cur.total || 0), 0), [orders]);
  const pending = orders.filter((order) => order.status === 'pending').length;

  const handleSaveProduct = async () => {
    try {
      const payload = {
        Prod_StoreID: 1,
        Prod_Name: productForm.Prod_Name,
        Prod_Price: parseFloat(productForm.Prod_Price),
        Prod_Stock: parseInt(productForm.Prod_Stock),
        Prod_ImageURL: productForm.Prod_ImageURL || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.Prod_ID}`, payload);
      } else {
        await api.post('/products', payload);
      }

      const res = await api.get('/products');
      setProducts(res.data.data || []);
      setShowProductModal(false);
      setEditingProduct(null);
      setProductForm({ Prod_Name: '', Prod_Price: '', Prod_Stock: '', Prod_ImageURL: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to save product');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter(p => p.Prod_ID !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      Prod_Name: product.Prod_Name,
      Prod_Price: product.Prod_Price.toString(),
      Prod_Stock: product.Prod_Stock.toString(),
      Prod_ImageURL: product.Prod_ImageURL || ''
    });
    setShowProductModal(true);
  };

  const sidebarItems = [
    { label: 'Overview', icon: LayoutDashboard, active: activeTab === 'overview' },
    { label: 'Products', icon: PackagePlus, active: activeTab === 'products' },
    { label: 'Orders', icon: ClipboardList, active: activeTab === 'orders' },
    { label: 'Reports', icon: BarChart3, active: false }
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="soft-card hidden h-fit rounded-2xl p-4 lg:sticky lg:top-28 lg:block">
        <div className="mb-6 px-2">
          <p className="text-sm font-extrabold uppercase tracking-wide text-orange-500">Owner</p>
          <h2 className="mt-1 text-xl font-extrabold text-[#333333]">Store tools</h2>
        </div>
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.label as any)}
              className={`mb-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left font-extrabold transition-all ${
                item.active 
                  ? 'app-gradient text-white shadow-lg shadow-orange-200' 
                  : 'text-[#777777] hover:bg-orange-50 hover:text-orange-500'
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </aside>

      <main className="space-y-6">
        {activeTab === 'overview' && (
          <>
            <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-wide text-orange-500">Dashboard</p>
                <h1 className="mt-1 text-3xl font-extrabold text-[#333333]">Manage your store</h1>
                <p className="mt-2 font-medium text-[#777777]">Track incoming orders and keep the catalog moving.</p>
              </div>
              <button 
                onClick={() => { setEditingProduct(null); setProductForm({ Prod_Name: '', Prod_Price: '', Prod_Stock: '', Prod_ImageURL: '' }); setShowProductModal(true); }}
                className="pressable app-gradient flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-extrabold text-white shadow-lg shadow-orange-200"
              >
                <Plus className="h-5 w-5" />
                Add product
              </button>
            </header>

            <section className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Revenue', value: `$${revenue.toFixed(2)}`, icon: BarChart3 },
                { label: 'Orders', value: orders.length, icon: ShoppingBag },
                { label: 'Pending', value: pending, icon: ClipboardList }
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="soft-card rounded-2xl p-5">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-bold text-[#777777]">{stat.label}</p>
                    <p className="mt-1 text-3xl font-extrabold text-[#333333]">{stat.value}</p>
                  </div>
                );
              })}
            </section>
          </>
        )}

        {activeTab === 'products' && (
          <section className="soft-card overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h2 className="text-xl font-extrabold text-[#333333]">Products</h2>
                <p className="mt-1 text-sm font-medium text-[#777777]">Manage your product catalog.</p>
              </div>
              <button 
                onClick={() => { setEditingProduct(null); setProductForm({ Prod_Name: '', Prod_Price: '', Prod_Stock: '', Prod_ImageURL: '' }); setShowProductModal(true); }}
                className="pressable app-gradient flex items-center gap-2 rounded-2xl px-4 py-2 font-extrabold text-white"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </button>
            </div>
            {loading ? (
              <div className="space-y-3 p-5">
                {[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-gray-100" />)}
              </div>
            ) : (
              <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <div key={product.Prod_ID} className="soft-card-hover group relative overflow-hidden rounded-2xl bg-white">
                    <div className="aspect-video w-full overflow-hidden bg-gray-100">
                      <img 
                        src={product.Prod_ImageURL || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'} 
                        alt={product.Prod_Name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-extrabold text-[#333333]">{product.Prod_Name}</h3>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-lg font-extrabold text-orange-500">${product.Prod_Price.toFixed(2)}</span>
                        <span className="text-sm text-[#777777]">Stock: {product.Prod_Stock}</span>
                      </div>
                    </div>
                    <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button 
                        onClick={() => openEditProduct(product)}
                        className="rounded-xl bg-white p-2 shadow-lg"
                      >
                        <Edit className="h-4 w-4 text-orange-500" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.Prod_ID)}
                        className="rounded-xl bg-white p-2 shadow-lg"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
                {products.length === 0 && (
                  <div className="col-span-full py-10 text-center">
                    <PackagePlus className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-2 font-medium text-[#777777]">No products yet</p>
                    <button 
                      onClick={() => setShowProductModal(true)}
                      className="mt-4 text-orange-500 font-extrabold"
                    >
                      Add your first product
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {(activeTab === 'overview' || activeTab === 'orders') && (
          <section className="soft-card overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h2 className="text-xl font-extrabold text-[#333333]">Recent orders</h2>
                <p className="mt-1 text-sm font-medium text-[#777777]">Update status as orders move.</p>
              </div>
            </div>
            {loading ? (
              <div className="space-y-3 p-5">
                {[1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-2xl bg-gray-100" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left">
                  <thead className="bg-gray-50 text-sm font-extrabold text-[#777777]">
                    <tr>
                      <th className="px-5 py-4">Order</th>
                      <th className="px-5 py-4">Date</th>
                      <th className="px-5 py-4">Total</th>
                      <th className="px-5 py-4">Payment</th>
                      <th className="px-5 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((order) => (
                      <tr key={order.id} className="bg-white">
                        <td className="px-5 py-4 font-extrabold text-[#333333]">#{order.id}</td>
                        <td className="px-5 py-4 font-medium text-[#777777]">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-5 py-4 font-extrabold text-[#333333]">${(order.total || 0).toFixed(2)}</td>
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold uppercase text-blue-700">{order.paymentStatus || 'pending'}</span>
                        </td>
                        <td className="px-5 py-4">
                          <select defaultValue={order.status} className="rounded-full border-0 bg-orange-50 px-3 py-2 text-xs font-extrabold uppercase text-orange-700 outline-none ring-1 ring-orange-100">
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="in_progress">In progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-10 text-center font-semibold text-[#777777]">No orders yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>

      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="soft-card w-full max-w-md rounded-2xl p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-[#333333]">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="rounded-full p-2 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-extrabold text-[#777777]">Product Name</label>
                <input
                  type="text"
                  value={productForm.Prod_Name}
                  onChange={(e) => setProductForm({ ...productForm, Prod_Name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  placeholder="Enter product name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-extrabold text-[#777777]">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.Prod_Price}
                    onChange={(e) => setProductForm({ ...productForm, Prod_Price: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-extrabold text-[#777777]">Stock</label>
                  <input
                    type="number"
                    value={productForm.Prod_Stock}
                    onChange={(e) => setProductForm({ ...productForm, Prod_Stock: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-extrabold text-[#777777]">Image URL</label>
                <input
                  type="url"
                  value={productForm.Prod_ImageURL}
                  onChange={(e) => setProductForm({ ...productForm, Prod_ImageURL: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowProductModal(false)}
                className="flex-1 rounded-xl border-2 border-gray-200 py-3 font-extrabold text-[#777777]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProduct}
                className="flex-1 app-gradient rounded-xl py-3 font-extrabold text-white"
              >
                {editingProduct ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

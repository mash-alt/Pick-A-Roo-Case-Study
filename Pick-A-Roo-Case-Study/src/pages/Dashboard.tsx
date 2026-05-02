import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { BarChart3, ClipboardList, LayoutDashboard, PackagePlus, ShoppingBag, Plus, X, Edit, Trash2, Truck, CheckCircle2, AlertCircle } from 'lucide-react';
import { mapOrder } from '../api/mappers';
import { toast } from 'sonner';

interface Product {
  Prod_ID: number;
  Prod_StoreID: number;
  Prod_Name: string;
  Prod_Price: number;
  Prod_Stock: number;
  Prod_ImageURL: string;
}

interface Order {
  Order_ID: number;
  Order_UserID: number;
  Order_StoreID: number;
  Order_ShoprID?: number;
  Order_OrderDate: string;
  Order_Total: number;
  Order_Status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  Order_PaymentStatus: string;
  Order_DeliveryAddress: string;
}

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
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
        const ordersData = ordersRes.data?.data || ordersRes.data || [];
        const productsData = productsRes.data?.data || productsRes.data || [];
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const revenue = useMemo(() => orders.reduce((acc, cur) => acc + (cur.Order_Total || 0), 0), [orders]);
  const pending = orders.filter((order) => order.Order_Status === 'PENDING').length;
  const completed = orders.filter((order) => order.Order_Status === 'COMPLETED').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-gray-50 text-gray-700 ring-gray-200';
      case 'CONFIRMED':
        return 'bg-blue-50 text-blue-700 ring-blue-200';
      case 'IN_PROGRESS':
        return 'bg-amber-50 text-amber-700 ring-amber-200';
      case 'COMPLETED':
        return 'bg-green-50 text-green-700 ring-green-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 ring-red-200';
      default:
        return 'bg-gray-50 text-gray-700 ring-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ').split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  };
    const oldOrder = orders.find(o => o.Order_ID === orderId);
    if (!oldOrder) return;

    // Optimistically update the UI
    setUpdating(orderId);
    setOrders(orders.map(o =>
      o.Order_ID === orderId ? { ...o, Order_Status: newStatus as any } : o
    ));

    try {
      const res = await api.put(`/orders/${orderId}`, { Order_Status: newStatus });
      const updatedOrder = res.data?.data || res.data;

      // Update with server response
      setOrders(orders.map(o =>
        o.Order_ID === orderId ? { ...updatedOrder } : o
      ));

      // Show success toast with status transition
      const statusLabel = {
        'PENDING': 'Pending',
        'CONFIRMED': 'Confirmed',
        'IN_PROGRESS': 'In Progress',
        'COMPLETED': 'Delivered',
        'CANCELLED': 'Cancelled'
      }[newStatus] || newStatus;

      toast.success(`Order #${orderId} updated to ${statusLabel}`, {
        description: new Date().toLocaleTimeString(),
      });
    } catch (err: any) {
      // Revert on error
      setOrders(orders.map(o =>
        o.Order_ID === orderId ? oldOrder : o
      ));

      const errorMsg = err.response?.data?.message || 'Failed to update order status';
      console.error('Failed to update order status:', err);
      toast.error('Update Failed', {
        description: errorMsg,
      });
    } finally {
      setUpdating(null);
    }
  };

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
                { label: 'Total Orders', value: orders.length, icon: ShoppingBag },
                { label: 'Delivered', value: completed, icon: CheckCircle2 }
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
                <p className="mt-1 text-sm font-medium text-[#777777]">Update status as orders move through fulfillment.</p>
              </div>
            </div>
            {loading ? (
              <div className="space-y-3 p-5">
                {[1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-2xl bg-gray-100" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left">
                  <thead className="bg-gray-50 text-sm font-extrabold text-[#777777]">
                    <tr>
                      <th className="px-5 py-4">Order ID</th>
                      <th className="px-5 py-4">Date</th>
                      <th className="px-5 py-4">Total</th>
                      <th className="px-5 py-4">Payment</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Delivery</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((order) => (
                      <tr key={order.Order_ID} className={`bg-white transition-all duration-300 ${updating === order.Order_ID ? 'bg-orange-50 scale-[1.01]' : ''}`}>
                        <td className="px-5 py-4 font-extrabold text-[#333333]">#{order.Order_ID}</td>
                        <td className="px-5 py-4 font-medium text-[#777777]">
                          {new Date(order.Order_OrderDate).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4 font-extrabold text-[#333333]">${order.Order_Total?.toFixed(2) || '0.00'}</td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase transition-all ${
                            order.Order_PaymentStatus === 'PAID' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                          }`}>
                            {order.Order_PaymentStatus || 'PENDING'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={order.Order_Status}
                            onChange={(e) => handleUpdateStatus(order.Order_ID, e.target.value)}
                            disabled={updating === order.Order_ID}
                            className={`rounded-full border-0 px-3 py-2 text-xs font-extrabold uppercase outline-none ring-1 transition-all duration-300 ${
                              getStatusColor(order.Order_Status)
                            } ${updating === order.Order_ID ? 'opacity-70 cursor-wait ring-2' : 'cursor-pointer hover:ring-2'}`}
                          >
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-5 py-4">
                          {order.Order_Status === 'COMPLETED' ? (
                            <div className="flex items-center gap-2 text-green-600 font-medium animate-pulse">
                              <CheckCircle2 className="h-4 w-4" />
                              Delivered
                            </div>
                          ) : order.Order_Status === 'IN_PROGRESS' ? (
                            <div className="flex items-center gap-2 text-blue-600 font-medium animate-bounce">
                              <Truck className="h-4 w-4" />
                              In Transit
                            </div>
                          ) : order.Order_Status === 'CANCELLED' ? (
                            <div className="flex items-center gap-2 text-red-600 font-medium">
                              <AlertCircle className="h-4 w-4" />
                              Cancelled
                            </div>
                          ) : (
                            <span className="text-[#777777] text-sm">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-10 text-center font-semibold text-[#777777]">No orders yet</td>
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

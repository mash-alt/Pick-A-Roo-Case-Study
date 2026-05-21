import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  CircleDollarSign,
  ClipboardList,
  Edit,
  LayoutDashboard,
  PackagePlus,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  TrendingUp,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../api/axios';
import { mapOrder, mapProduct, mapStore } from '../api/mappers';
import { useAuthStore } from '../store';

type OwnerTab = 'dashboard' | 'products' | 'orders' | 'reports';
type RangeKey = '7d' | '30d' | 'all';
type OrderStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

interface Product {
  id: number;
  storeId: number;
  name: string;
  price: number;
  stock: number;
  image: string;
}

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  subtotal: number;
  name?: string;
}

interface Order {
  id: number;
  storeId: number;
  userId: number;
  createdAt: string;
  total: number;
  status: string;
  paymentStatus: string;
  deliveryAddress: string;
  items: OrderItem[];
}

interface Store {
  id: number;
  name: string;
  city: string;
  location: string;
  ownerId: number;
  status: string;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=900&q=80';

const STATUS_OPTIONS: OrderStatus[] = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

const STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700 ring-yellow-200',
  CONFIRMED: 'bg-blue-50 text-blue-700 ring-blue-200',
  IN_PROGRESS: 'bg-orange-50 text-orange-700 ring-orange-200',
  COMPLETED: 'bg-green-50 text-green-700 ring-green-200',
  CANCELLED: 'bg-red-50 text-red-700 ring-red-200'
};

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<OwnerTab>('dashboard');
  const [range, setRange] = useState<RangeKey>('7d');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    stock: '',
    image: '',
    storeId: ''
  });

  const loadOwnerData = async (showLoader = false) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const [storesRes, productsRes, ordersRes] = await Promise.all([
        api.get('/stores'),
        api.get('/products'),
        api.get('/orders')
      ]);

      const allStores = (storesRes.data || []).map(mapStore).filter(Boolean) as Store[];
      const ownerStores = allStores.filter((store) => {
        if (user?.role === 'store_owner') {
          return store.ownerId === user.id;
        }
        return true;
      });

      const ownerStoreIds = new Set(ownerStores.map((store) => store.id));
      const mappedProducts = ((productsRes.data?.data || productsRes.data || []) as any[])
        .map(mapProduct)
        .filter(Boolean) as Product[];
      const ownerProducts = mappedProducts.filter((product) => ownerStoreIds.has(product.storeId));

      const mappedOrders = ((ordersRes.data?.data || ordersRes.data || []) as any[])
        .map(mapOrder)
        .filter(Boolean) as Order[];
      const ownerOrders = mappedOrders.filter((order) => ownerStoreIds.has(order.storeId));

      setStores(ownerStores);
      setProducts(ownerProducts);
      setOrders(ownerOrders);

      if (ownerStores.length > 0 && !ownerStores.some((store) => store.id === selectedStoreId)) {
        setSelectedStoreId(ownerStores[0].id);
      }
      if (ownerStores.length === 0) {
        setSelectedStoreId(null);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load owner dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOwnerData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scopedProducts = useMemo(() => {
    if (!selectedStoreId) return products;
    return products.filter((product) => product.storeId === selectedStoreId);
  }, [products, selectedStoreId]);

  const scopedOrders = useMemo(() => {
    if (!selectedStoreId) return orders;
    return orders.filter((order) => order.storeId === selectedStoreId);
  }, [orders, selectedStoreId]);

  const dashboardMetrics = useMemo(() => {
    const completedRevenue = scopedOrders
      .filter((order) => order.status.toUpperCase() === 'COMPLETED')
      .reduce((sum, order) => sum + order.total, 0);
    const pendingOrders = scopedOrders.filter((order) => order.status.toUpperCase() === 'PENDING').length;
    const lowStockItems = scopedProducts.filter((product) => product.stock <= 10).length;

    return {
      completedRevenue,
      totalOrders: scopedOrders.length,
      pendingOrders,
      lowStockItems
    };
  }, [scopedOrders, scopedProducts]);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return scopedProducts;

    return scopedProducts.filter((product) => {
      return product.name.toLowerCase().includes(term);
    });
  }, [scopedProducts, searchTerm]);

  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return scopedOrders;

    return scopedOrders.filter((order) => {
      return String(order.id).includes(term) || order.deliveryAddress?.toLowerCase().includes(term);
    });
  }, [scopedOrders, searchTerm]);

  const reportOrders = useMemo(() => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    return scopedOrders.filter((order) => {
      const createdAt = new Date(order.createdAt).getTime();
      if (range === '7d') return now - createdAt <= 7 * dayMs;
      if (range === '30d') return now - createdAt <= 30 * dayMs;
      return true;
    });
  }, [scopedOrders, range]);

  const reportSummary = useMemo(() => {
    const revenue = reportOrders
      .filter((order) => order.status.toUpperCase() !== 'CANCELLED')
      .reduce((sum, order) => sum + order.total, 0);

    const completedOrders = reportOrders.filter((order) => order.status.toUpperCase() === 'COMPLETED').length;
    const averageOrderValue = reportOrders.length > 0 ? revenue / reportOrders.length : 0;

    const topProductMap = new Map<number, { name: string; quantity: number; revenue: number }>();
    for (const order of reportOrders) {
      for (const item of order.items || []) {
        const existing = topProductMap.get(item.productId) || {
          name: item.name || products.find((entry) => entry.id === item.productId)?.name || `Product #${item.productId}`,
          quantity: 0,
          revenue: 0
        };
        existing.quantity += item.quantity;
        existing.revenue += item.subtotal;
        topProductMap.set(item.productId, existing);
      }
    }

    const topProducts = [...topProductMap.values()]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const byDayMap = new Map<string, number>();
    for (const order of reportOrders) {
      const key = new Date(order.createdAt).toLocaleDateString();
      byDayMap.set(key, (byDayMap.get(key) || 0) + order.total);
    }

    const dailyRevenue = [...byDayMap.entries()]
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7);

    return {
      revenue,
      completedOrders,
      averageOrderValue,
      topProducts,
      dailyRevenue
    };
  }, [reportOrders, products]);

  const openNewProductModal = () => {
    if (!selectedStoreId) {
      toast.error('Create or assign a store first before adding products');
      return;
    }

    setEditingProduct(null);
    setProductForm({
      name: '',
      price: '',
      stock: '',
      image: '',
      storeId: String(selectedStoreId)
    });
    setShowProductModal(true);
  };

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: String(product.price),
      stock: String(product.stock),
      image: product.image || '',
      storeId: String(product.storeId)
    });
    setShowProductModal(true);
  };

  const closeProductModal = () => {
    setShowProductModal(false);
    setEditingProduct(null);
    setProductForm({ name: '', price: '', stock: '', image: '', storeId: selectedStoreId ? String(selectedStoreId) : '' });
  };

  const saveProduct = async () => {
    const payload = {
      Prod_StoreID: Number(productForm.storeId),
      Prod_Name: productForm.name.trim(),
      Prod_Price: Number(productForm.price),
      Prod_Stock: Number(productForm.stock),
      Prod_ImageURL: productForm.image.trim() || FALLBACK_IMAGE
    };

    if (!payload.Prod_StoreID || !payload.Prod_Name) {
      toast.error('Product name and store are required');
      return;
    }
    if (Number.isNaN(payload.Prod_Price) || payload.Prod_Price < 0) {
      toast.error('Enter a valid product price');
      return;
    }
    if (Number.isNaN(payload.Prod_Stock) || payload.Prod_Stock < 0) {
      toast.error('Enter a valid stock value');
      return;
    }

    setSavingProduct(true);
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/products', payload);
        toast.success('Product created');
      }

      closeProductModal();
      await loadOwnerData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save product');
    } finally {
      setSavingProduct(false);
    }
  };

  const deleteProduct = async (productId: number) => {
    if (!window.confirm('Delete this product?')) return;

    try {
      await api.delete(`/products/${productId}`);
      toast.success('Product removed');
      await loadOwnerData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete product');
    }
  };

  const updateOrderStatus = async (orderId: number, status: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await api.put(`/orders/${orderId}`, { Order_Status: status });
      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: status.toLowerCase(),
                paymentStatus: status === 'COMPLETED' ? 'paid' : order.paymentStatus
              }
            : order
        )
      );
      toast.success(`Order #${orderId} updated to ${status.replace('_', ' ')}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const selectedStore = stores.find((store) => store.id === selectedStoreId);

  const navigationItems: Array<{ key: OwnerTab; label: string; icon: React.ComponentType<any> }> = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'products', label: 'Products', icon: PackagePlus },
    { key: 'orders', label: 'Orders', icon: ClipboardList },
    { key: 'reports', label: 'Reports', icon: BarChart3 }
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-28 animate-pulse rounded-2xl bg-white" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="soft-card h-fit rounded-2xl p-4 lg:sticky lg:top-28">
        <div className="mb-4 px-2">
          <p className="text-sm font-extrabold uppercase tracking-wide text-orange-500">Owner Dashboard</p>
          <h2 className="mt-1 text-xl font-extrabold text-[#333333]">{selectedStore?.name || 'My Store'}</h2>
          <p className="mt-1 text-sm font-semibold text-[#777777]">{selectedStore?.location || 'No store assigned yet'}</p>
        </div>

        <div className="mb-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setActiveTab(item.key);
                  setSearchTerm('');
                }}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left font-extrabold transition-all ${
                  active ? 'app-gradient text-white shadow-lg shadow-orange-200' : 'text-[#777777] hover:bg-orange-50 hover:text-orange-500'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </div>

        {stores.length > 0 && (
          <div>
            <label className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-[#777777]">Working Store</label>
            <select
              value={selectedStoreId || ''}
              onChange={(event) => setSelectedStoreId(Number(event.target.value))}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-orange-400"
            >
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </aside>

      <main className="space-y-6">
        <div className="grid grid-cols-2 gap-2 lg:hidden">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setActiveTab(item.key);
                  setSearchTerm('');
                }}
                className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-extrabold ${
                  active ? 'app-gradient text-white' : 'bg-white text-[#777777]'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-orange-500">{activeTab}</p>
            <h1 className="mt-1 text-3xl font-extrabold text-[#333333]">Store Owner Workspace</h1>
            <p className="mt-2 font-medium text-[#777777]">
              {refreshing ? 'Refreshing data...' : 'Manage products, track orders, and monitor performance in one place.'}
            </p>
          </div>
          {activeTab === 'products' && (
            <button
              onClick={openNewProductModal}
              className="pressable app-gradient flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-extrabold text-white shadow-lg shadow-orange-200"
            >
              <Plus className="h-5 w-5" />
              Add Product
            </button>
          )}
        </header>

        {activeTab === 'dashboard' && (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <article className="soft-card rounded-2xl p-5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                  <CircleDollarSign className="h-5 w-5" />
                </div>
                <p className="text-sm font-bold text-[#777777]">Completed Revenue</p>
                <p className="mt-1 text-3xl font-extrabold text-[#333333]">{currency.format(dashboardMetrics.completedRevenue)}</p>
              </article>

              <article className="soft-card rounded-2xl p-5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <p className="text-sm font-bold text-[#777777]">Total Orders</p>
                <p className="mt-1 text-3xl font-extrabold text-[#333333]">{dashboardMetrics.totalOrders}</p>
              </article>

              <article className="soft-card rounded-2xl p-5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-600">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <p className="text-sm font-bold text-[#777777]">Pending Orders</p>
                <p className="mt-1 text-3xl font-extrabold text-[#333333]">{dashboardMetrics.pendingOrders}</p>
              </article>

              <article className="soft-card rounded-2xl p-5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <p className="text-sm font-bold text-[#777777]">Low Stock Items</p>
                <p className="mt-1 text-3xl font-extrabold text-[#333333]">{dashboardMetrics.lowStockItems}</p>
              </article>
            </section>

            <section className="soft-card rounded-2xl p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-[#333333]">Recent Orders</h2>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-sm font-extrabold text-orange-500 hover:underline"
                >
                  See all orders
                </button>
              </div>

              <div className="space-y-3">
                {scopedOrders.slice(0, 5).map((order) => {
                  const statusKey = order.status.toUpperCase();
                  return (
                    <div key={order.id} className="rounded-2xl border border-gray-100 bg-white p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-extrabold text-[#333333]">Order #{order.id}</p>
                        <span className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase ring-1 ${STATUS_STYLE[statusKey] || STATUS_STYLE.PENDING}`}>
                          {statusKey.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-[#777777]">
                        {new Date(order.createdAt).toLocaleString()} • {currency.format(order.total)}
                      </p>
                    </div>
                  );
                })}

                {scopedOrders.length === 0 && (
                  <p className="rounded-2xl bg-gray-50 p-6 text-center font-semibold text-[#777777]">No orders for this store yet.</p>
                )}
              </div>
            </section>
          </>
        )}

        {activeTab === 'products' && (
          <section className="soft-card overflow-hidden rounded-2xl">
            <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-[#333333]">Products</h2>
                <p className="mt-1 text-sm font-medium text-[#777777]">Create, edit, and remove store items.</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search products"
                  className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-3 text-sm font-semibold outline-none focus:border-orange-400"
                />
              </div>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <article key={product.id} className="soft-card-hover group overflow-hidden rounded-2xl border border-gray-100 bg-white">
                  <div className="relative h-40 bg-gray-100">
                    <img src={product.image || FALLBACK_IMAGE} alt={product.name} className="h-full w-full object-cover" />
                    <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button onClick={() => openEditProductModal(product)} className="rounded-lg bg-white p-2 shadow-md">
                        <Edit className="h-4 w-4 text-orange-500" />
                      </button>
                      <button onClick={() => deleteProduct(product.id)} className="rounded-lg bg-white p-2 shadow-md">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="line-clamp-1 font-extrabold text-[#333333]">{product.name}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-lg font-extrabold text-orange-500">{currency.format(product.price)}</span>
                      <span className={`rounded-full px-2 py-1 text-xs font-extrabold ${product.stock <= 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        Stock: {product.stock}
                      </span>
                    </div>
                  </div>
                </article>
              ))}

              {filteredProducts.length === 0 && (
                <div className="col-span-full rounded-2xl bg-gray-50 py-12 text-center">
                  <p className="font-semibold text-[#777777]">No products matched your filter.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'orders' && (
          <section className="soft-card overflow-hidden rounded-2xl">
            <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-[#333333]">Orders</h2>
                <p className="mt-1 text-sm font-medium text-[#777777]">Update status as fulfillment progresses.</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search order ID/address"
                  className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-3 text-sm font-semibold outline-none focus:border-orange-400"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-gray-50 text-sm font-extrabold text-[#777777]">
                  <tr>
                    <th className="px-5 py-4">Order</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Items</th>
                    <th className="px-5 py-4">Total</th>
                    <th className="px-5 py-4">Payment</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => {
                    const statusKey = order.status.toUpperCase();
                    return (
                      <tr key={order.id}>
                        <td className="px-5 py-4">
                          <p className="font-extrabold text-[#333333]">#{order.id}</p>
                          <p className="text-xs font-semibold text-[#777777]">{order.deliveryAddress || 'No address'}</p>
                        </td>
                        <td className="px-5 py-4 font-medium text-[#777777]">{new Date(order.createdAt).toLocaleString()}</td>
                        <td className="px-5 py-4 font-medium text-[#777777]">{order.items?.length || 0}</td>
                        <td className="px-5 py-4 font-extrabold text-[#333333]">{currency.format(order.total)}</td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={statusKey}
                            onChange={(event) => updateOrderStatus(order.id, event.target.value as OrderStatus)}
                            disabled={updatingOrderId === order.id}
                            className={`rounded-full border-0 px-3 py-2 text-xs font-extrabold uppercase outline-none ring-1 ${STATUS_STYLE[statusKey] || STATUS_STYLE.PENDING}`}
                          >
                            {STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {status.replace('_', ' ')}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center font-semibold text-[#777777]">
                        No orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'reports' && (
          <section className="space-y-5">
            <div className="soft-card rounded-2xl p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-[#333333]">Performance Reports</h2>
                  <p className="mt-1 text-sm font-medium text-[#777777]">Track revenue trends and top-selling products.</p>
                </div>

                <div className="flex items-center gap-2">
                  {([
                    { key: '7d', label: '7 Days' },
                    { key: '30d', label: '30 Days' },
                    { key: 'all', label: 'All Time' }
                  ] as Array<{ key: RangeKey; label: string }>).map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setRange(item.key)}
                      className={`rounded-xl px-4 py-2 text-sm font-extrabold ${
                        range === item.key ? 'app-gradient text-white' : 'bg-gray-100 text-[#777777]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <article className="soft-card rounded-2xl p-5">
                <p className="text-sm font-bold text-[#777777]">Revenue</p>
                <p className="mt-2 text-3xl font-extrabold text-[#333333]">{currency.format(reportSummary.revenue)}</p>
              </article>
              <article className="soft-card rounded-2xl p-5">
                <p className="text-sm font-bold text-[#777777]">Completed Orders</p>
                <p className="mt-2 text-3xl font-extrabold text-[#333333]">{reportSummary.completedOrders}</p>
              </article>
              <article className="soft-card rounded-2xl p-5">
                <p className="text-sm font-bold text-[#777777]">Avg. Order Value</p>
                <p className="mt-2 text-3xl font-extrabold text-[#333333]">{currency.format(reportSummary.averageOrderValue)}</p>
              </article>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <article className="soft-card rounded-2xl p-5">
                <h3 className="flex items-center gap-2 text-lg font-extrabold text-[#333333]">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                  Revenue Trend (Last 7 points)
                </h3>
                <div className="mt-5 space-y-3">
                  {reportSummary.dailyRevenue.length > 0 ? (
                    reportSummary.dailyRevenue.map((point) => {
                      const max = Math.max(...reportSummary.dailyRevenue.map((entry) => entry.total), 1);
                      const width = `${Math.max((point.total / max) * 100, 5)}%`;
                      return (
                        <div key={point.date}>
                          <div className="mb-1 flex items-center justify-between text-xs font-bold text-[#777777]">
                            <span>{point.date}</span>
                            <span>{currency.format(point.total)}</span>
                          </div>
                          <div className="h-2.5 rounded-full bg-gray-100">
                            <div className="app-gradient h-2.5 rounded-full" style={{ width }} />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="rounded-xl bg-gray-50 p-4 text-sm font-semibold text-[#777777]">No revenue points for this range.</p>
                  )}
                </div>
              </article>

              <article className="soft-card rounded-2xl p-5">
                <h3 className="text-lg font-extrabold text-[#333333]">Top Products</h3>
                <div className="mt-4 space-y-3">
                  {reportSummary.topProducts.length > 0 ? (
                    reportSummary.topProducts.map((entry) => (
                      <div key={entry.name} className="rounded-xl border border-gray-100 p-3">
                        <p className="font-extrabold text-[#333333]">{entry.name}</p>
                        <p className="mt-1 text-sm font-semibold text-[#777777]">
                          Sold: {entry.quantity} • Revenue: {currency.format(entry.revenue)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-xl bg-gray-50 p-4 text-sm font-semibold text-[#777777]">No sales data yet.</p>
                  )}
                </div>
              </article>
            </div>
          </section>
        )}
      </main>

      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="soft-card w-full max-w-md rounded-2xl p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-[#333333]">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={closeProductModal} className="rounded-full p-2 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-extrabold text-[#777777]">Store</label>
                <select
                  value={productForm.storeId}
                  onChange={(event) => setProductForm((current) => ({ ...current, storeId: event.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 font-medium outline-none focus:border-orange-400"
                >
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-extrabold text-[#777777]">Product Name</label>
                <input
                  value={productForm.name}
                  onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Product name"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 font-medium outline-none focus:border-orange-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-extrabold text-[#777777]">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={productForm.price}
                    onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value }))}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 font-medium outline-none focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-extrabold text-[#777777]">Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={(event) => setProductForm((current) => ({ ...current, stock: event.target.value }))}
                    placeholder="0"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 font-medium outline-none focus:border-orange-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-extrabold text-[#777777]">Image URL</label>
                <input
                  value={productForm.image}
                  onChange={(event) => setProductForm((current) => ({ ...current, image: event.target.value }))}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 font-medium outline-none focus:border-orange-400"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={closeProductModal}
                className="flex-1 rounded-xl border-2 border-gray-200 py-3 font-extrabold text-[#777777]"
              >
                Cancel
              </button>
              <button
                onClick={saveProduct}
                disabled={savingProduct}
                className="flex-1 app-gradient rounded-xl py-3 font-extrabold text-white disabled:opacity-60"
              >
                {savingProduct ? 'Saving...' : editingProduct ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import express, { NextFunction, Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';

type Role = 'customer' | 'store_owner' | 'admin';
type StoreStatus = 'OPEN' | 'INACTIVE';
type OrderStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type PaymentStatus = 'PENDING' | 'PAID';

interface AppUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
  role: Role;
}

interface AppStore {
  id: number;
  name: string;
  city: string;
  location: string;
  contactNumber: string;
  ownerId: number;
  status: StoreStatus;
  category: string;
  rating: number;
  image: string;
}

interface AppProduct {
  id: number;
  storeId: number;
  name: string;
  price: number;
  stock: number;
  image: string;
}

interface AppOrderItem {
  id: number;
  productId: number;
  quantity: number;
  subtotal: number;
}

interface AppOrder {
  id: number;
  userId: number;
  storeId: number;
  orderDate: string;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveryAddress: string;
  items: AppOrderItem[];
}

interface AuthTokenPayload {
  id: number;
  role: Role;
}

interface AuthedRequest extends Request {
  user?: AuthTokenPayload;
}

let users: AppUser[] = [
  {
    id: 1,
    firstName: 'Demo',
    lastName: 'Customer',
    email: 'user@example.com',
    password: 'password',
    phoneNumber: '09171234567',
    address: 'Makati City',
    role: 'customer'
  },
  {
    id: 2,
    firstName: 'Store',
    lastName: 'Owner',
    email: 'store@example.com',
    password: 'password',
    phoneNumber: '09179876543',
    address: 'Quezon City',
    role: 'store_owner'
  },
  {
    id: 3,
    firstName: 'Platform',
    lastName: 'Admin',
    email: 'admin@example.com',
    password: 'password',
    phoneNumber: '09170000000',
    address: 'Taguig City',
    role: 'admin'
  }
];

let stores: AppStore[] = [
  {
    id: 1,
    name: 'Fresh Groceries',
    city: 'Makati',
    location: 'Legazpi Village',
    contactNumber: '09171112222',
    ownerId: 2,
    status: 'OPEN',
    category: 'Grocery',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 2,
    name: 'Burger Joint',
    city: 'Quezon City',
    location: 'Tomas Morato',
    contactNumber: '09173334444',
    ownerId: 2,
    status: 'OPEN',
    category: 'Food',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=800'
  }
];

let products: AppProduct[] = [
  {
    id: 1,
    storeId: 1,
    name: 'Organic Bananas',
    price: 2.99,
    stock: 120,
    image: 'https://images.unsplash.com/photo-1571501715200-bef8600cdca5?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 2,
    storeId: 1,
    name: 'Whole Milk',
    price: 1.99,
    stock: 80,
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 3,
    storeId: 2,
    name: 'Cheeseburger',
    price: 8.99,
    stock: 45,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 4,
    storeId: 2,
    name: 'French Fries',
    price: 3.99,
    stock: 70,
    image: 'https://images.unsplash.com/photo-1576107232684-1279f3908581?auto=format&fit=crop&q=80&w=800'
  }
];

let orders: AppOrder[] = [
  {
    id: 1,
    userId: 1,
    storeId: 1,
    orderDate: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    total: 11.96,
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    deliveryAddress: 'Makati City',
    items: [
      { id: 1, productId: 1, quantity: 2, subtotal: 5.98 },
      { id: 2, productId: 2, quantity: 3, subtotal: 5.97 }
    ]
  },
  {
    id: 2,
    userId: 1,
    storeId: 2,
    orderDate: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    total: 17.98,
    status: 'IN_PROGRESS',
    paymentStatus: 'PAID',
    deliveryAddress: 'Makati City',
    items: [{ id: 3, productId: 3, quantity: 2, subtotal: 17.98 }]
  }
];

let nextUserId = users.length + 1;
let nextStoreId = stores.length + 1;
let nextProductId = products.length + 1;
let nextOrderId = orders.length + 1;
let nextOrderItemId = orders.reduce((max, order) => Math.max(max, ...order.items.map((item) => item.id)), 0) + 1;

const IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80';

function normalizeRole(input?: string): Role {
  const value = String(input || '').trim().toLowerCase();
  if (value === 'admin') return 'admin';
  if (value === 'store_owner') return 'store_owner';
  return 'customer';
}

function normalizeStoreStatus(input?: string): StoreStatus {
  const value = String(input || '').trim().toUpperCase();
  return value === 'INACTIVE' ? 'INACTIVE' : 'OPEN';
}

function normalizeOrderStatus(input?: string): OrderStatus {
  const value = String(input || '').trim().toUpperCase();
  if (value === 'CONFIRMED') return 'CONFIRMED';
  if (value === 'IN_PROGRESS') return 'IN_PROGRESS';
  if (value === 'COMPLETED') return 'COMPLETED';
  if (value === 'CANCELLED') return 'CANCELLED';
  return 'PENDING';
}

function encodeToken(payload: AuthTokenPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

function decodeToken(token: string): AuthTokenPayload | null {
  try {
    const parsed = JSON.parse(Buffer.from(token, 'base64').toString());
    if (!parsed?.id || !parsed?.role) return null;
    return { id: Number(parsed.id), role: normalizeRole(parsed.role) };
  } catch {
    return null;
  }
}

function toUserResponse(user: AppUser) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    address: user.address,
    role: user.role,
    User_ID: user.id,
    User_FName: user.firstName,
    User_LName: user.lastName,
    User_Email: user.email,
    User_PhoneNum: user.phoneNumber,
    User_Address: user.address,
    User_Role: user.role.toUpperCase()
  };
}

function toStoreResponse(store: AppStore) {
  return {
    id: store.id,
    name: store.name,
    city: store.city,
    location: store.location,
    contactNumber: store.contactNumber,
    ownerId: store.ownerId,
    status: store.status,
    category: store.category,
    rating: store.rating,
    image: store.image,
    Store_ID: store.id,
    Store_Name: store.name,
    Store_City: store.city,
    Store_Loc: store.location,
    Store_ContactNum: store.contactNumber,
    Store_OwnerID: store.ownerId,
    Store_Status: store.status
  };
}

function toProductResponse(product: AppProduct) {
  return {
    id: product.id,
    storeId: product.storeId,
    name: product.name,
    price: product.price,
    stock: product.stock,
    image: product.image,
    Prod_ID: product.id,
    Prod_StoreID: product.storeId,
    Prod_Name: product.name,
    Prod_Price: product.price,
    Prod_Stock: product.stock,
    Prod_ImageURL: product.image
  };
}

function toOrderResponse(order: AppOrder) {
  return {
    id: order.id,
    userId: order.userId,
    storeId: order.storeId,
    createdAt: order.orderDate,
    total: order.total,
    status: order.status.toLowerCase(),
    paymentStatus: order.paymentStatus.toLowerCase(),
    deliveryAddress: order.deliveryAddress,
    items: order.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        subtotal: item.subtotal,
        name: product?.name,
        image: product?.image,
        OItem_ID: item.id,
        OItem_ProdID: item.productId,
        OItem_Quantity: item.quantity,
        OItem_SubTotal: item.subtotal,
        Prod_Name: product?.name,
        Prod_ImageURL: product?.image
      };
    }),
    Order_ID: order.id,
    Order_UserID: order.userId,
    Order_StoreID: order.storeId,
    Order_OrderDate: order.orderDate,
    Order_Total: order.total,
    Order_Status: order.status,
    Order_PaymentStatus: order.paymentStatus,
    Order_DeliveryAddress: order.deliveryAddress
  };
}

function authenticate(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const decoded = decodeToken(token);
  if (!decoded) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  req.user = decoded;
  next();
}

function requireRoles(roles: Role[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

function getOwnedStoreIds(userId: number): number[] {
  return stores.filter((store) => store.ownerId === userId).map((store) => store.id);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post('/api/auth/login', (req: Request, res: Response) => {
    const email = req.body?.User_Email ?? req.body?.email;
    const password = req.body?.User_Password ?? req.body?.password;

    const user = users.find((entry) => entry.email.toLowerCase() === String(email || '').toLowerCase() && entry.password === password);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = encodeToken({ id: user.id, role: user.role });
    res.json({ token, user: toUserResponse(user) });
  });

  app.post('/api/auth/register', (req: Request, res: Response) => {
    const email = String(req.body?.User_Email ?? req.body?.email ?? '').trim().toLowerCase();
    const password = String(req.body?.User_Password ?? req.body?.password ?? '').trim();

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (users.some((entry) => entry.email.toLowerCase() === email)) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const role = normalizeRole(req.body?.User_Role ?? req.body?.role);

    const newUser: AppUser = {
      id: nextUserId++,
      firstName: String(req.body?.User_FName ?? req.body?.firstName ?? 'New').trim() || 'New',
      lastName: String(req.body?.User_LName ?? req.body?.lastName ?? 'User').trim() || 'User',
      email,
      password,
      phoneNumber: String(req.body?.User_PhoneNum ?? req.body?.phoneNumber ?? '').trim(),
      address: String(req.body?.User_Address ?? req.body?.address ?? 'Customer delivery address').trim(),
      role
    };

    users.push(newUser);

    const token = encodeToken({ id: newUser.id, role: newUser.role });
    res.status(201).json({ token, user: toUserResponse(newUser) });
  });

  app.get('/api/stores', (_req: Request, res: Response) => {
    res.json(stores.map(toStoreResponse));
  });

  app.get('/api/stores/:id', (req: Request, res: Response) => {
    const storeId = Number(req.params.id);
    const store = stores.find((entry) => entry.id === storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.json(toStoreResponse(store));
  });

  app.get('/api/products', (req: Request, res: Response) => {
    const requestedStoreId = req.query.storeId ? Number(req.query.storeId) : null;
    const filtered = requestedStoreId ? products.filter((entry) => entry.storeId === requestedStoreId) : products;
    res.json({ data: filtered.map(toProductResponse) });
  });

  app.post('/api/products', authenticate, requireRoles(['store_owner', 'admin']), (req: AuthedRequest, res: Response) => {
    const storeId = Number(req.body?.Prod_StoreID ?? req.body?.storeId ?? req.body?.Store_ID);
    const productName = String(req.body?.Prod_Name ?? req.body?.name ?? '').trim();
    const price = Number(req.body?.Prod_Price ?? req.body?.price ?? 0);
    const stock = Number(req.body?.Prod_Stock ?? req.body?.stock ?? 0);

    if (!storeId || !productName || Number.isNaN(price) || price < 0 || Number.isNaN(stock) || stock < 0) {
      return res.status(400).json({ message: 'Invalid product payload' });
    }

    const targetStore = stores.find((entry) => entry.id === storeId);
    if (!targetStore) {
      return res.status(404).json({ message: 'Store not found' });
    }

    if (req.user?.role === 'store_owner' && targetStore.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'You can only manage your own store products' });
    }

    const newProduct: AppProduct = {
      id: nextProductId++,
      storeId,
      name: productName,
      price,
      stock,
      image: String(req.body?.Prod_ImageURL ?? req.body?.image ?? '').trim() || IMAGE_FALLBACK
    };

    products.push(newProduct);
    res.status(201).json({ data: toProductResponse(newProduct) });
  });

  app.put('/api/products/:id', authenticate, requireRoles(['store_owner', 'admin']), (req: AuthedRequest, res: Response) => {
    const productId = Number(req.params.id);
    const existing = products.find((entry) => entry.id === productId);

    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const targetStore = stores.find((entry) => entry.id === existing.storeId);
    if (!targetStore) {
      return res.status(404).json({ message: 'Store not found' });
    }

    if (req.user?.role === 'store_owner' && targetStore.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'You can only manage your own store products' });
    }

    const productName = String(req.body?.Prod_Name ?? req.body?.name ?? existing.name).trim() || existing.name;
    const price = Number(req.body?.Prod_Price ?? req.body?.price ?? existing.price);
    const stock = Number(req.body?.Prod_Stock ?? req.body?.stock ?? existing.stock);

    if (Number.isNaN(price) || price < 0 || Number.isNaN(stock) || stock < 0) {
      return res.status(400).json({ message: 'Invalid product payload' });
    }

    existing.name = productName;
    existing.price = price;
    existing.stock = stock;
    existing.image = String(req.body?.Prod_ImageURL ?? req.body?.image ?? existing.image).trim() || existing.image;

    res.json({ data: toProductResponse(existing) });
  });

  app.delete('/api/products/:id', authenticate, requireRoles(['store_owner', 'admin']), (req: AuthedRequest, res: Response) => {
    const productId = Number(req.params.id);
    const target = products.find((entry) => entry.id === productId);
    if (!target) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const targetStore = stores.find((entry) => entry.id === target.storeId);
    if (!targetStore) {
      return res.status(404).json({ message: 'Store not found' });
    }

    if (req.user?.role === 'store_owner' && targetStore.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'You can only manage your own store products' });
    }

    products = products.filter((entry) => entry.id !== productId);
    res.json({ message: 'Product deleted' });
  });

  app.post('/api/orders', authenticate, requireRoles(['customer', 'admin']), (req: AuthedRequest, res: Response) => {
    const storeId = Number(req.body?.Order_StoreID ?? req.body?.storeId);
    const rawItems = Array.isArray(req.body?.items) ? req.body.items : [];

    if (!storeId || rawItems.length === 0) {
      return res.status(400).json({ message: 'Order requires a store and at least one item' });
    }

    const store = stores.find((entry) => entry.id === storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const computedItems: AppOrderItem[] = [];
    for (const item of rawItems) {
      const productId = Number(item?.OItem_ProdID ?? item?.productId);
      const quantity = Number(item?.OItem_Quantity ?? item?.quantity ?? 0);

      if (!productId || quantity <= 0) {
        return res.status(400).json({ message: 'Invalid order item payload' });
      }

      const product = products.find((entry) => entry.id === productId && entry.storeId === storeId);
      if (!product) {
        return res.status(404).json({ message: `Product ${productId} not found in this store` });
      }

      const subtotal = Number((product.price * quantity).toFixed(2));
      computedItems.push({
        id: nextOrderItemId++,
        productId,
        quantity,
        subtotal
      });
    }

    const total = Number(computedItems.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));

    const newOrder: AppOrder = {
      id: nextOrderId++,
      userId: req.user?.id ?? 0,
      storeId,
      orderDate: new Date().toISOString(),
      total,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      deliveryAddress: String(req.body?.Order_DeliveryAddress ?? req.body?.deliveryAddress ?? 'Customer delivery address').trim() || 'Customer delivery address',
      items: computedItems
    };

    orders.push(newOrder);
    res.status(201).json({ data: toOrderResponse(newOrder) });
  });

  app.get('/api/orders', authenticate, (req: AuthedRequest, res: Response) => {
    const role = req.user?.role;

    if (role === 'customer') {
      return res.json({ data: orders.filter((entry) => entry.userId === req.user?.id).map(toOrderResponse) });
    }

    if (role === 'store_owner') {
      const ownedStoreIds = getOwnedStoreIds(req.user?.id || 0);
      const ownerOrders = orders.filter((entry) => ownedStoreIds.includes(entry.storeId)).map(toOrderResponse);
      return res.json({ data: ownerOrders });
    }

    res.json({ data: orders.map(toOrderResponse) });
  });

  app.put('/api/orders/:id', authenticate, requireRoles(['store_owner', 'admin']), (req: AuthedRequest, res: Response) => {
    const orderId = Number(req.params.id);
    const target = orders.find((entry) => entry.id === orderId);
    if (!target) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (req.user?.role === 'store_owner') {
      const ownedStoreIds = getOwnedStoreIds(req.user.id);
      if (!ownedStoreIds.includes(target.storeId)) {
        return res.status(403).json({ message: 'You can only update your own store orders' });
      }
    }

    target.status = normalizeOrderStatus(req.body?.Order_Status ?? req.body?.status);
    if (target.status === 'COMPLETED') {
      target.paymentStatus = 'PAID';
    }

    res.json({ data: toOrderResponse(target) });
  });

  app.get('/api/admin/users', authenticate, requireRoles(['admin']), (_req: AuthedRequest, res: Response) => {
    res.json({ data: users.map(toUserResponse) });
  });

  app.post('/api/admin/users', authenticate, requireRoles(['admin']), (req: Request, res: Response) => {
    const email = String(req.body?.User_Email ?? req.body?.email ?? '').trim().toLowerCase();
    const password = String(req.body?.User_Password ?? req.body?.password ?? '').trim();

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (users.some((entry) => entry.email.toLowerCase() === email)) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const newUser: AppUser = {
      id: nextUserId++,
      firstName: String(req.body?.User_FName ?? req.body?.firstName ?? 'New').trim() || 'New',
      lastName: String(req.body?.User_LName ?? req.body?.lastName ?? 'User').trim() || 'User',
      email,
      password,
      phoneNumber: String(req.body?.User_PhoneNum ?? req.body?.phoneNumber ?? '').trim(),
      address: String(req.body?.User_Address ?? req.body?.address ?? '').trim(),
      role: normalizeRole(req.body?.User_Role ?? req.body?.role)
    };

    users.push(newUser);
    res.status(201).json({ data: toUserResponse(newUser) });
  });

  app.put('/api/admin/users/:id', authenticate, requireRoles(['admin']), (req: Request, res: Response) => {
    const userId = Number(req.params.id);
    const target = users.find((entry) => entry.id === userId);
    if (!target) {
      return res.status(404).json({ message: 'User not found' });
    }

    const email = String(req.body?.User_Email ?? req.body?.email ?? target.email).trim().toLowerCase();
    if (users.some((entry) => entry.id !== userId && entry.email.toLowerCase() === email)) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    target.firstName = String(req.body?.User_FName ?? req.body?.firstName ?? target.firstName).trim() || target.firstName;
    target.lastName = String(req.body?.User_LName ?? req.body?.lastName ?? target.lastName).trim() || target.lastName;
    target.email = email;
    target.phoneNumber = String(req.body?.User_PhoneNum ?? req.body?.phoneNumber ?? target.phoneNumber).trim();
    target.address = String(req.body?.User_Address ?? req.body?.address ?? target.address).trim();
    target.role = normalizeRole(req.body?.User_Role ?? req.body?.role ?? target.role);

    res.json({ data: toUserResponse(target) });
  });

  app.delete('/api/admin/users/:id', authenticate, requireRoles(['admin']), (req: Request, res: Response) => {
    const userId = Number(req.params.id);
    if (!users.some((entry) => entry.id === userId)) {
      return res.status(404).json({ message: 'User not found' });
    }

    users = users.filter((entry) => entry.id !== userId);
    stores = stores.filter((store) => store.ownerId !== userId);

    const existingStoreIds = new Set(stores.map((store) => store.id));
    products = products.filter((product) => existingStoreIds.has(product.storeId));
    orders = orders.filter((order) => existingStoreIds.has(order.storeId));

    res.json({ message: 'User deleted' });
  });

  app.get('/api/admin/stores', authenticate, requireRoles(['admin']), (_req: Request, res: Response) => {
    res.json({ data: stores.map(toStoreResponse) });
  });

  app.post('/api/admin/stores', authenticate, requireRoles(['admin']), (req: Request, res: Response) => {
    const ownerId = Number(req.body?.Store_OwnerID ?? req.body?.ownerId);
    const owner = users.find((entry) => entry.id === ownerId && entry.role === 'store_owner');

    if (!owner) {
      return res.status(400).json({ message: 'Owner must be a valid store owner account' });
    }

    const newStore: AppStore = {
      id: nextStoreId++,
      name: String(req.body?.Store_Name ?? req.body?.name ?? '').trim() || 'New Store',
      city: String(req.body?.Store_City ?? req.body?.city ?? '').trim() || 'Unknown City',
      location: String(req.body?.Store_Loc ?? req.body?.location ?? '').trim() || 'Unknown location',
      contactNumber: String(req.body?.Store_ContactNum ?? req.body?.contactNumber ?? '').trim(),
      ownerId,
      status: normalizeStoreStatus(req.body?.Store_Status ?? req.body?.status),
      category: String(req.body?.category ?? 'General').trim() || 'General',
      rating: Number(req.body?.rating ?? 4.5),
      image: String(req.body?.image ?? IMAGE_FALLBACK).trim() || IMAGE_FALLBACK
    };

    stores.push(newStore);
    res.status(201).json({ data: toStoreResponse(newStore) });
  });

  app.put('/api/admin/stores/:id', authenticate, requireRoles(['admin']), (req: Request, res: Response) => {
    const storeId = Number(req.params.id);
    const target = stores.find((entry) => entry.id === storeId);
    if (!target) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const nextOwnerId = Number(req.body?.Store_OwnerID ?? req.body?.ownerId ?? target.ownerId);
    const owner = users.find((entry) => entry.id === nextOwnerId && entry.role === 'store_owner');
    if (!owner) {
      return res.status(400).json({ message: 'Owner must be a valid store owner account' });
    }

    target.name = String(req.body?.Store_Name ?? req.body?.name ?? target.name).trim() || target.name;
    target.city = String(req.body?.Store_City ?? req.body?.city ?? target.city).trim() || target.city;
    target.location = String(req.body?.Store_Loc ?? req.body?.location ?? target.location).trim() || target.location;
    target.contactNumber = String(req.body?.Store_ContactNum ?? req.body?.contactNumber ?? target.contactNumber).trim();
    target.ownerId = nextOwnerId;
    target.status = normalizeStoreStatus(req.body?.Store_Status ?? req.body?.status ?? target.status);

    res.json({ data: toStoreResponse(target) });
  });

  app.delete('/api/admin/stores/:id', authenticate, requireRoles(['admin']), (req: Request, res: Response) => {
    const storeId = Number(req.params.id);
    if (!stores.some((entry) => entry.id === storeId)) {
      return res.status(404).json({ message: 'Store not found' });
    }

    stores = stores.filter((entry) => entry.id !== storeId);
    products = products.filter((entry) => entry.storeId !== storeId);
    orders = orders.filter((entry) => entry.storeId !== storeId);

    res.json({ message: 'Store deleted' });
  });

  app.get('/api/users', authenticate, requireRoles(['admin']), (_req: Request, res: Response) => {
    res.json(users.map(toUserResponse));
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Demo logins: user@example.com | store@example.com | admin@example.com (password: password)');
  });
}

startServer();

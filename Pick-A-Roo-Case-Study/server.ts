import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';

// Mock Data
let users = [
  { id: 1, email: 'user@example.com', password: 'password', role: 'customer' },
  { id: 2, email: 'store@example.com', password: 'password', role: 'store_owner' },
  { id: 3, email: 'admin@example.com', password: 'password', role: 'admin' },
];

let stores = [
  { id: 1, name: 'Fresh Groceries', category: 'Grocery', rating: 4.8, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800' },
  { id: 2, name: 'Burger Joint', category: 'Food', rating: 4.5, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=800' },
];

let products = [
  { id: 1, storeId: 1, name: 'Organic Bananas', price: 2.99, image: 'https://images.unsplash.com/photo-1571501715200-bef8600cdca5?auto=format&fit=crop&q=80&w=800' },
  { id: 2, storeId: 1, name: 'Whole Milk', price: 1.99, image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=800' },
  { id: 3, storeId: 2, name: 'Cheeseburger', price: 8.99, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800' },
  { id: 4, storeId: 2, name: 'French Fries', price: 3.99, image: 'https://images.unsplash.com/photo-1576107232684-1279f3908581?auto=format&fit=crop&q=80&w=800' },
];

let orders = [];
let nextOrderId = 1;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Simple auth middleware mock
  const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    try {
      const user = JSON.parse(Buffer.from(token, 'base64').toString());
      req.user = user;
      next();
    } catch {
      res.status(401).json({ message: 'Invalid token' });
    }
  };

  // API Routes
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const token = Buffer.from(JSON.stringify({ id: user.id, role: user.role })).toString('base64');
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  });

  app.post('/api/auth/register', (req, res) => {
    const { email, password, role } = req.body;
    if (users.find(u => u.email === email)) return res.status(400).json({ message: 'Email exists' });
    const newUser = { id: users.length + 1, email, password, role };
    users.push(newUser);
    const token = Buffer.from(JSON.stringify({ id: newUser.id, role: newUser.role })).toString('base64');
    res.json({ token, user: { id: newUser.id, email: newUser.email, role: newUser.role } });
  });

  app.get('/api/users', authenticate, (req: any, res: any) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    res.json(users.map(u => ({ id: u.id, email: u.email, role: u.role })));
  });

  app.get('/api/stores', (req, res) => res.json(stores));
  
  app.get('/api/stores/:id', (req, res) => {
    const store = stores.find(s => s.id === parseInt(req.params.id));
    if (!store) return res.status(404).json({ message: 'Store not found' });
    res.json(store);
  });

  app.get('/api/products', (req: any, res: any) => {
    if (req.query.storeId) {
      return res.json(products.filter(p => p.storeId === parseInt(req.query.storeId as string)));
    }
    res.json(products);
  });

  app.post('/api/orders', authenticate, (req: any, res: any) => {
    const order = {
      id: nextOrderId++,
      userId: req.user.id,
      items: req.body.items,
      total: req.body.total,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    orders.push(order);
    res.json(order);
  });

  app.get('/api/orders', authenticate, (req: any, res: any) => {
    if (req.user.role === 'customer') {
      return res.json(orders.filter(o => o.userId === req.user.id));
    }
    // Store owner logic would be here, but keeping it simple
    res.json(orders); 
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

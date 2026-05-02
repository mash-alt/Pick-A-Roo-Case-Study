import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import StoreDetails from './pages/StoreDetails';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import { useAuthStore } from './store';
import { Toaster } from 'sonner';
import CartDrawer from './components/CartDrawer';

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: string }) {
  const { user, token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (role && user?.role?.toLowerCase() !== role.toLowerCase()) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F7F7F7] text-[#333333]">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/store/:id" element={<StoreDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Customer Routes */}
            <Route path="/orders" element={<ProtectedRoute role="customer"><Orders /></ProtectedRoute>} />
            
            {/* Store Owner Routes */}
            <Route path="/dashboard" element={<ProtectedRoute role="store_owner"><Dashboard /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute role="admin"><Admin /></ProtectedRoute>} />
          </Routes>
        </main>
        <CartDrawer />
        <Toaster position="bottom-right" richColors />
      </div>
    </BrowserRouter>
  );
}

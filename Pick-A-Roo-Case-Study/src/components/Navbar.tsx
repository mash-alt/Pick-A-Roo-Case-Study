import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Package, Search, ShoppingCart, Store, UserRound, X, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore, useCartStore } from '../store';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { items, openCart } = useCartStore();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const cartTotalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login');
  };

  const navLinks = (
    <>
      {user?.role === 'customer' && (
        <Link to="/orders" className="rounded-full px-4 py-2 text-sm font-bold text-[#555555] hover:bg-orange-50 hover:text-orange-500">
          Orders
        </Link>
      )}
      {user?.role === 'store_owner' && (
        <Link to="/dashboard" className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-[#555555] hover:bg-orange-50 hover:text-orange-500">
          <Store className="h-4 w-4" />
          Dashboard
        </Link>
      )}
      {user?.role === 'admin' && (
        <Link to="/admin" className="rounded-full px-4 py-2 text-sm font-bold text-[#555555] hover:bg-orange-50 hover:text-orange-500">
          Admin
        </Link>
      )}
    </>
  );

  return (
    <nav className={`fixed left-0 right-0 top-0 z-50 bg-white/90 backdrop-blur-xl transition-shadow duration-300 ${scrolled ? 'shadow-md shadow-gray-200/70' : 'shadow-sm shadow-gray-100/60'}`}>
      <div className="mx-auto flex h-18 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="app-gradient flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-lg shadow-orange-200">
            <Package className="h-5 w-5" />
          </span>
          <span className="hidden text-xl font-extrabold tracking-tight text-[#333333] sm:inline">Pickaroo</span>
        </Link>

        <div className="mx-auto hidden w-full max-w-xl items-center rounded-full bg-[#f7f7f7] px-4 py-2.5 ring-1 ring-gray-200 transition focus-within:bg-white focus-within:ring-orange-300 md:flex">
          <Search className="mr-3 h-5 w-5 text-[#777777]" />
          <input
            className="w-full bg-transparent text-sm font-medium text-[#333333] outline-none placeholder:text-[#777777]"
            placeholder="Search stores, snacks, groceries..."
          />
        </div>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          {user && navLinks}
          <button
            onClick={openCart}
            className="pressable relative rounded-full bg-[#f7f7f7] p-3 text-[#333333] hover:bg-orange-50 hover:text-orange-500"
            aria-label="Open cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartTotalItems > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-xs font-extrabold text-white"
              >
                {cartTotalItems}
              </motion.span>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-2 rounded-full bg-[#f7f7f7] py-1 pl-3 pr-1">
              <span className="max-w-36 truncate text-sm font-bold text-[#333333]">{user.email}</span>
              <button
                onClick={handleLogout}
                className="pressable rounded-full bg-white p-2 text-[#777777] hover:text-red-500"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="rounded-full px-4 py-2 text-sm font-bold text-[#555555] hover:bg-gray-100">
                Log in
              </Link>
              <Link to="/register" className="pressable app-gradient rounded-full px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-orange-200">
                Sign up
              </Link>
            </>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2 md:hidden">
          <button
            onClick={openCart}
            className="pressable relative rounded-full bg-[#f7f7f7] p-3 text-[#333333]"
            aria-label="Open cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartTotalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-xs font-extrabold text-white">
                {cartTotalItems}
              </span>
            )}
          </button>
          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="pressable rounded-full bg-[#f7f7f7] p-3 text-[#333333]"
            aria-label="Open menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="border-t border-gray-100 bg-white px-4 py-4 md:hidden"
          >
            <div className="mb-4 flex items-center rounded-full bg-[#f7f7f7] px-4 py-3">
              <Search className="mr-3 h-5 w-5 text-[#777777]" />
              <input className="w-full bg-transparent text-sm font-medium outline-none" placeholder="Search food..." />
            </div>
            <div className="flex flex-col gap-2">
              {user ? (
                <>
                  {navLinks}
                  <div className="flex items-center justify-between rounded-2xl bg-[#f7f7f7] p-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <UserRound className="h-5 w-5 shrink-0 text-orange-500" />
                      <span className="truncate text-sm font-bold text-[#333333]">{user.email}</span>
                    </div>
                    <button onClick={handleLogout} className="pressable rounded-full bg-white p-2 text-[#777777]">
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="rounded-2xl bg-[#f7f7f7] px-4 py-3 font-bold text-[#333333]">
                    Log in
                  </Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="app-gradient rounded-2xl px-4 py-3 text-center font-extrabold text-white">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useAuthStore, useCartStore } from '../store';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'sonner';

export default function CartDrawer() {
  const { items, isCartOpen, closeCart, updateQuantity, removeItem, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = items.length > 0 ? 2.99 : 0;

  const checkout = async () => {
    if (!user) {
      closeCart();
      navigate('/login');
      toast.error('Please log in to checkout');
      return;
    }

    const storeIds = new Set(items.map((item) => item.storeId));
    if (storeIds.size > 1) {
      toast.error('Checkout one store at a time');
      return;
    }

    setLoading(true);
    try {
      await api.post('/orders', {
        Order_StoreID: items[0].storeId,
        Order_DeliveryAddress: user.address || 'Customer delivery address',
        items: items.map((item) => ({
          OItem_ProdID: item.id,
          OItem_Quantity: item.quantity
        }))
      });
      clearCart();
      closeCart();
      toast.success('Order placed successfully');
      navigate('/orders');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.button
            aria-label="Close cart"
            className="fixed inset-0 z-[70] bg-black/30 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          <motion.aside
            className="fixed inset-y-0 right-0 z-[80] flex w-full flex-col bg-white shadow-2xl sm:max-w-md"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
          >
            <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">Your bag</p>
                <h2 className="text-xl font-extrabold text-[#333333]">{items.length} selected items</h2>
              </div>
              <button
                onClick={closeCart}
                className="pressable rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <div className="app-gradient mb-5 flex h-20 w-20 items-center justify-center rounded-2xl text-white shadow-lg shadow-orange-200">
                  <ShoppingBag className="h-9 w-9" />
                </div>
                <h3 className="text-xl font-extrabold text-[#333333]">Ready when you are</h3>
                <p className="mt-2 text-sm font-medium text-[#777777]">
                  Add a few favorites and your cart will appear here.
                </p>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                  {items.map((item) => (
                    <div key={item.id} className="soft-card flex gap-3 rounded-2xl p-3">
                      <img src={item.image} alt={item.name} className="h-20 w-20 rounded-xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="line-clamp-1 font-bold text-[#333333]">{item.name}</h3>
                            <p className="mt-1 text-sm font-semibold text-orange-500">${item.price.toFixed(2)}</p>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="pressable rounded-full p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center rounded-full bg-gray-100 p-1">
                            <button
                              onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeItem(item.id)}
                              className="pressable rounded-full bg-white p-1.5 text-gray-700 shadow-sm"
                              aria-label={`Decrease ${item.name}`}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-9 text-center text-sm font-bold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="pressable rounded-full bg-white p-1.5 text-gray-700 shadow-sm"
                              aria-label={`Increase ${item.name}`}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="font-extrabold text-[#333333]">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <footer className="border-t border-gray-100 bg-white px-5 py-5">
                  <div className="mb-4 space-y-2 text-sm font-medium text-[#777777]">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery</span>
                      <span>${deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-100 pt-3 text-lg font-extrabold text-[#333333]">
                      <span>Total</span>
                      <span>${(subtotal + deliveryFee).toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    onClick={checkout}
                    disabled={loading}
                    className="pressable app-gradient flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 font-extrabold text-white shadow-lg shadow-orange-200 disabled:opacity-60"
                  >
                    {loading ? 'Placing order...' : 'Checkout'}
                    {!loading && <ArrowRight className="h-5 w-5" />}
                  </button>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

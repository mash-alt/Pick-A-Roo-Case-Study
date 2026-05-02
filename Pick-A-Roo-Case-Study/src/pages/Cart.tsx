import React, { useState } from 'react';
import { useCartStore, useAuthStore } from '../store';
import { ArrowRight, CheckCircle2, MapPin, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'sonner';

export default function Cart() {
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = items.length > 0 ? 2.99 : 0;

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please log in to checkout');
      navigate('/login');
      return;
    }

    const storeIds = new Set(items.map((item) => item.storeId));
    if (storeIds.size > 1) {
      toast.error('Please checkout items from one store at a time');
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
      toast.success('Order placed successfully');
      navigate('/orders');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[62vh] max-w-lg flex-col items-center justify-center text-center">
        <div className="app-gradient mb-6 flex h-24 w-24 items-center justify-center rounded-2xl text-white shadow-lg shadow-orange-200">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-[#333333]">Your cart is empty</h1>
        <p className="mt-3 font-medium text-[#777777]">Find a store, tap a few favorites, and they will show up here.</p>
        <button onClick={() => navigate('/')} className="pressable app-gradient mt-8 rounded-2xl px-6 py-3 font-extrabold text-white shadow-lg shadow-orange-200">
          Start shopping
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_380px]">
      <section className="space-y-5">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wide text-orange-500">Checkout</p>
          <h1 className="mt-1 text-3xl font-extrabold text-[#333333]">Review your order</h1>
        </div>

        <div className="soft-card rounded-2xl p-5">
          <div className="mb-4 flex items-center gap-3">
            <span className="app-gradient flex h-11 w-11 items-center justify-center rounded-2xl text-white">
              <MapPin className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-extrabold text-[#333333]">Delivery address</h2>
              <p className="text-sm font-medium text-[#777777]">{user?.address || 'Customer delivery address'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="soft-card flex gap-4 rounded-2xl p-4">
              <img src={item.image} alt={item.name} className="h-24 w-24 rounded-2xl object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-[#333333]">{item.name}</h3>
                    <p className="mt-1 font-bold text-orange-500">${item.price.toFixed(2)}</p>
                  </div>
                  <p className="font-extrabold text-[#333333]">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div className="mt-4 flex w-fit items-center rounded-full bg-gray-100 p-1">
                  <button
                    onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeItem(item.id)}
                    className="pressable rounded-full bg-white p-2 shadow-sm"
                    aria-label={`Decrease ${item.name}`}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center font-extrabold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="pressable rounded-full bg-white p-2 shadow-sm"
                    aria-label={`Increase ${item.name}`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <aside className="soft-card h-fit rounded-2xl p-5 lg:sticky lg:top-28">
        <h2 className="text-xl font-extrabold text-[#333333]">Order summary</h2>
        <div className="mt-5 space-y-3 text-sm font-semibold text-[#777777]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery fee</span>
            <span>${deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-4 text-lg font-extrabold text-[#333333]">
            <span>Total</span>
            <span>${(subtotal + deliveryFee).toFixed(2)}</span>
          </div>
        </div>
        <div className="mt-5 rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-700">
          <CheckCircle2 className="mr-2 inline h-4 w-4" />
          Payment status will start as pending.
        </div>
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="pressable app-gradient mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 font-extrabold text-white shadow-lg shadow-orange-200 disabled:opacity-60"
        >
          {loading ? 'Placing order...' : 'Place order'}
          {!loading && <ArrowRight className="h-5 w-5" />}
        </button>
      </aside>
    </div>
  );
}

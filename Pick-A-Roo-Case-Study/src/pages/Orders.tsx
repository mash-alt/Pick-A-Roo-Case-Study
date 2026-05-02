import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { CheckCircle, Clock, Package, Truck } from 'lucide-react';
import { mapOrder } from '../api/mappers';

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 ring-yellow-100',
  confirmed: 'bg-blue-50 text-blue-700 ring-blue-100',
  in_progress: 'bg-orange-50 text-orange-700 ring-orange-100',
  completed: 'bg-green-50 text-green-700 ring-green-100',
  cancelled: 'bg-red-50 text-red-700 ring-red-100'
};

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders')
      .then((res) => setOrders(res.data.map(mapOrder).filter(Boolean)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        {[1, 2, 3].map((item) => <div key={item} className="h-40 animate-pulse rounded-2xl bg-white" />)}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto flex min-h-[62vh] max-w-lg flex-col items-center justify-center text-center">
        <div className="app-gradient mb-6 flex h-24 w-24 items-center justify-center rounded-2xl text-white shadow-lg shadow-orange-200">
          <Package className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-[#333333]">No orders yet</h1>
        <p className="mt-3 font-medium text-[#777777]">Your order history will appear here after checkout.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-sm font-extrabold uppercase tracking-wide text-orange-500">Order history</p>
        <h1 className="mt-1 text-3xl font-extrabold text-[#333333]">Your orders</h1>
      </div>

      {orders.map((order) => (
        <article key={order.id} className="soft-card rounded-2xl p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-bold text-[#777777]">Order #{order.id}</p>
              <h2 className="mt-1 text-xl font-extrabold text-[#333333]">
                {order.items?.length ? `${order.items.length} selected items` : 'Order summary'}
              </h2>
              <p className="mt-1 text-sm font-semibold text-[#777777]">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-3 py-1.5 text-xs font-extrabold uppercase ring-1 ${statusStyles[order.status] || statusStyles.pending}`}>
                {order.status.replace('_', ' ')}
              </span>
              <p className="text-xl font-extrabold text-[#333333]">${order.total.toFixed(2)}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 border-t border-gray-100 pt-5 sm:grid-cols-3">
            {[
              { label: 'Placed', icon: Clock, active: true },
              { label: 'Preparing', icon: Package, active: ['confirmed', 'in_progress', 'completed'].includes(order.status) },
              { label: 'Delivered', icon: CheckCircle, active: order.status === 'completed' }
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.label} className={`flex items-center gap-3 rounded-2xl p-3 ${step.active ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-[#777777]'}`}>
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-extrabold">{step.label}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#777777]">
            <Truck className="h-4 w-4 text-orange-500" />
            {order.deliveryAddress || 'Delivery address saved with order'}
          </div>
        </article>
      ))}
    </div>
  );
}

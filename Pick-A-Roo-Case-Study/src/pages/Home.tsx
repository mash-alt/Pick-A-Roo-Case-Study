import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import StoreCard from '../components/StoreCard';
import { Search, Sparkles, Timer, Truck } from 'lucide-react';
import { mapStore } from '../api/mappers';

export default function Home() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/stores')
      .then((res) => setStores(res.data.map(mapStore).filter(Boolean)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = stores.filter((store) => {
    return (
      store.name?.toLowerCase().includes(search.toLowerCase()) ||
      store.city?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl bg-[#333333] text-white shadow-xl shadow-orange-100">
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1800&q=80"
          alt="Fresh groceries"
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-orange-500/20" />
        <div className="relative grid min-h-[390px] content-end gap-8 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
          <div className="max-w-2xl pb-2">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold backdrop-blur">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              Fresh drops near you
            </div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Cravings, groceries, and quick wins delivered fast.
            </h1>
            <p className="mt-4 max-w-xl text-base font-medium text-white/85 sm:text-lg">
              Discover local stores, add favorites in a tap, and checkout without losing momentum.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <div className="flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-3 text-sm font-bold backdrop-blur">
                <Timer className="h-4 w-4 text-yellow-300" />
                20-30 min delivery
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-3 text-sm font-bold backdrop-blur">
                <Truck className="h-4 w-4 text-yellow-300" />
                Local stores, fresh picks
              </div>
            </div>
          </div>

          <div className="hidden place-self-end rounded-2xl bg-white p-4 text-[#333333] shadow-2xl lg:block">
            <p className="text-sm font-bold text-[#777777]">Today&apos;s pick</p>
            <div className="mt-3 flex items-center gap-4">
              <img
                src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=500&q=80"
                alt="Prepared meal"
                className="h-24 w-24 rounded-2xl object-cover"
              />
              <div>
                <h2 className="text-xl font-extrabold">Dinner basket</h2>
                <p className="mt-1 text-sm font-medium text-[#777777]">Fresh ingredients, one quick cart.</p>
                <p className="mt-2 text-lg font-extrabold text-orange-500">from $18.99</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-orange-500">Explore</p>
            <h2 className="mt-1 text-3xl font-extrabold text-[#333333]">Popular stores</h2>
            <p className="mt-2 font-medium text-[#777777]">Tap a store and build your basket in seconds.</p>
          </div>
          <div className="flex w-full items-center rounded-full bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100 lg:max-w-sm">
            <Search className="mr-3 h-5 w-5 text-[#777777]" />
            <input
              type="text"
              placeholder="Search stores or city"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-[#777777]"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-72 animate-pulse rounded-2xl bg-white shadow-sm" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full rounded-2xl bg-white py-14 text-center font-semibold text-[#777777] shadow-sm">
                No stores found for &quot;{search}&quot;
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

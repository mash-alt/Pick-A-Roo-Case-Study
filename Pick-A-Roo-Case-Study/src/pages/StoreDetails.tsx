import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import { ArrowLeft, Clock, MapPin, Search, Star } from 'lucide-react';
import { mapProduct, mapStore } from '../api/mappers';

export default function StoreDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/stores/${id}`),
      api.get(`/products?storeId=${id}`)
    ])
      .then(([storeRes, prodRes]) => {
        setStore(mapStore(storeRes.data));
        setProducts((prodRes.data.data || prodRes.data).map(mapProduct).filter(Boolean));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(query.toLowerCase()));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-80 animate-pulse rounded-2xl bg-white shadow-sm" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => <div key={item} className="h-72 animate-pulse rounded-2xl bg-white" />)}
        </div>
      </div>
    );
  }

  if (!store) return <div className="rounded-2xl bg-white p-10 text-center font-bold text-[#777777]">Store not found</div>;

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-24">
      <button
        onClick={() => navigate(-1)}
        className="pressable flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#333333] shadow-sm ring-1 ring-gray-100 hover:text-orange-500"
        aria-label="Go back"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <section className="relative overflow-hidden rounded-2xl bg-[#333333] shadow-xl shadow-orange-100">
        <img src={store.image} alt={store.name} className="absolute inset-0 h-full w-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
        <div className="relative flex min-h-[330px] flex-col justify-end p-6 text-white sm:p-8">
          <span className="mb-4 w-fit rounded-full bg-green-500 px-3 py-1 text-xs font-extrabold shadow-sm">
            {String(store.status || 'OPEN').toUpperCase()}
          </span>
          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">{store.name}</h1>
          <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold text-white/90">
            <span className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur">
              <MapPin className="h-4 w-4 text-yellow-300" />
              {store.location || store.city}
            </span>
            <span className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur">
              <Clock className="h-4 w-4 text-yellow-300" />
              20-30 min
            </span>
            <span className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur">
              <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
              {store.rating} rating
            </span>
          </div>
        </div>
      </section>

      <div className="sticky top-[72px] z-30 -mx-4 border-y border-gray-100 bg-[#F7F7F7]/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:bg-white/95">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-orange-500">Products</p>
            <h2 className="mt-1 text-2xl font-extrabold text-[#333333]">Add something tasty</h2>
          </div>
          <div className="flex items-center rounded-full bg-white px-4 py-2.5 shadow-sm ring-1 ring-gray-100 lg:w-80">
            <Search className="mr-3 h-4 w-4 text-[#777777]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products"
              className="w-full bg-transparent text-sm font-semibold outline-none"
            />
          </div>
        </div>
      </div>

      <section>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-orange-500">Available now</p>
            <h2 className="mt-1 text-2xl font-extrabold text-[#333333]">Browse the full menu</h2>
          </div>
          <p className="hidden text-sm font-bold text-[#777777] sm:block">{filteredProducts.length} items</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full rounded-2xl bg-white py-14 text-center font-semibold text-[#777777] shadow-sm">
              No products match your search.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

import React from 'react';
import { motion } from 'motion/react';
import { Clock, MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StoreCard({ store }: { store: any }) {
  const isOpen = String(store.status || 'OPEN').toUpperCase() === 'OPEN';

  return (
    <Link to={`/store/${store.id}`} className="block">
      <motion.article
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.98 }}
        className="soft-card soft-card-hover group overflow-hidden rounded-2xl"
      >
        <div className="relative h-44 overflow-hidden bg-gray-100">
          <img
            src={store.image}
            alt={store.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 to-transparent" />
          <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-extrabold shadow-sm ${
            isOpen ? 'bg-green-500 text-white' : 'bg-gray-800 text-white'
          }`}>
            {isOpen ? 'OPEN' : 'CLOSED'}
          </span>
          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-extrabold text-[#333333] shadow-sm">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            {store.rating}
          </div>
        </div>

        <div className="p-4">
          <h3 className="line-clamp-1 text-lg font-extrabold text-[#333333]">{store.name}</h3>
          <div className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-[#777777]">
            <MapPin className="h-4 w-4 shrink-0 text-orange-500" />
            <span className="line-clamp-1">{store.location || store.city}</span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-extrabold text-orange-600">
              {store.category}
            </span>
            <span className="flex items-center gap-1 text-xs font-bold text-[#777777]">
              <Clock className="h-3.5 w-3.5" />
              20-30 min
            </span>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, ShoppingBag, X } from 'lucide-react';
import { useCartStore } from '../store';
import { toast } from 'sonner';

export default function ProductCard({ product }: { product: any }) {
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleAdd = () => {
    addItem({ ...product });
    toast.success(`Added ${product.name}`);
  };

  const handleAddAndOpen = () => {
    handleAdd();
    setDetailsOpen(false);
    openCart();
  };

  return (
    <>
      <motion.article
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setDetailsOpen(true)}
        className="soft-card soft-card-hover group cursor-pointer overflow-hidden rounded-2xl"
      >
        <div className="relative h-44 overflow-hidden bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <button
            onClick={(event) => {
              event.stopPropagation();
              handleAdd();
            }}
            className="pressable app-gradient absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg shadow-orange-200"
            aria-label={`Add ${product.name} to cart`}
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h4 className="line-clamp-1 font-extrabold text-[#333333]">{product.name}</h4>
              <p className="mt-1 text-sm font-medium text-[#777777]">Fresh, ready to add.</p>
            </div>
            <span className="shrink-0 text-lg font-extrabold text-orange-500">${product.price.toFixed(2)}</span>
          </div>
        </div>
      </motion.article>

      <AnimatePresence>
        {detailsOpen && (
          <>
            <motion.button
              aria-label="Close product details"
              className="fixed inset-0 z-[60] bg-black/35 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDetailsOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              className="fixed left-1/2 top-1/2 z-[70] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white shadow-2xl"
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative h-60 bg-gray-100">
                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                <button
                  onClick={() => setDetailsOpen(false)}
                  className="pressable absolute right-4 top-4 rounded-full bg-white/95 p-2 text-[#333333] shadow-md"
                  aria-label="Close product details"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-5">
                <p className="text-sm font-extrabold uppercase tracking-wide text-orange-500">Fresh pick</p>
                <h3 className="mt-1 text-2xl font-extrabold text-[#333333]">{product.name}</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-[#777777]">
                  A quick add for your basket. Great for topping up the essentials or building dinner in one go.
                </p>
                <div className="mt-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase text-[#777777]">Price</p>
                    <p className="text-2xl font-extrabold text-orange-500">${product.price.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={handleAddAndOpen}
                    className="pressable app-gradient flex items-center gap-2 rounded-2xl px-5 py-3 font-extrabold text-white shadow-lg shadow-orange-200"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    Add to cart
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

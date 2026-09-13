'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { rentalsAPI, Rental } from '@/lib/api';
import { RentalCard, SkeletonCard } from '@/components/PropertyCards';
import { SlidersHorizontal, ChevronDown, RotateCcw, Search, X, Key, MapPin } from 'lucide-react';
import { cn, capitalize } from '@/lib/utils';

const LOCALITIES = [
  'banjara hills',
  'kondapur',
  'gachibowli',
  'madhapur',
  'hitech city',
  'jubilee hills',
  'kukatpally',
  'miyapur',
  'uppal',
  'secunderabad',
  'manikonda',
  'nanakramguda',
];

const FURNISHING_OPTIONS = ['unfurnished', 'semi-furnished', 'fully-furnished'];
const BHK_OPTIONS = [1, 2, 3, 4, 5];

export default function RentalsPage() {
  const searchParams = useSearchParams();
  const initialLocality = searchParams.get('locality') || undefined;

  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [filters, setFilters] = useState<{ locality?: string; bhk?: number; furnishing?: string }>({
    locality: initialLocality,
  });
  const [sortKey, setSortKey] = useState('price_asc');
  const LIMIT = 24;

  const fetchRentals = useCallback(
    async (f: typeof filters, off: number, reset = false) => {
      if (off === 0) setLoading(true);
      else setLoadingMore(true);

      try {
        const [sort_by, order] =
          sortKey === 'price_asc'
            ? ['price', 'asc']
            : sortKey === 'price_desc'
            ? ['price', 'desc']
            : ['posted_at', 'desc'];

        const res = await rentalsAPI.getAll({
          ...f,
          sort_by,
          order: order as 'asc' | 'desc',
          limit: LIMIT,
          offset: off,
        });

        setTotal(res.total);
        setHasMore(res.has_more);
        setOffset(off + res.count);
        setRentals((prev) => (reset || off === 0 ? res.results : [...prev, ...res.results]));
      } catch (e) {
        console.error('Error fetching rentals:', e);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [sortKey]
  );

  useEffect(() => {
    fetchRentals(filters, 0, true);
  }, [filters, sortKey, fetchRentals]);

  const activeCount = Object.values(filters).filter(Boolean).length;

  const displayedRentals = useMemo(() => {
    if (!searchQuery.trim()) return rentals;
    const q = searchQuery.toLowerCase();
    return rentals.filter(
      (r) =>
        r.apartment_name?.toLowerCase().includes(q) ||
        r.title?.toLowerCase().includes(q) ||
        r.locality?.toLowerCase().includes(q)
    );
  }, [rentals, searchQuery]);

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-4 sm:py-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-300 uppercase tracking-wider">
              Rental Collection
            </span>
            <span className="text-xs text-slate-400">Hyderabad</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Rent Luxury Residences</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {loading ? 'Fetching available rentals...' : `${total.toLocaleString()} rental properties across Hyderabad`}
          </p>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search rental apartment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl glass border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="relative">
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2.5 rounded-xl glass border border-white/10 text-xs font-semibold text-slate-200 bg-[#0A0F24] focus:outline-none focus:border-teal-400/40 cursor-pointer"
            >
              <option value="price_asc" className="bg-slate-900 text-white">Rent: Low to High</option>
              <option value="price_desc" className="bg-slate-900 text-white">Rent: High to Low</option>
              <option value="newest" className="bg-slate-900 text-white">Newest First</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all',
              showFilters || activeCount > 0
                ? 'bg-teal-400 text-black border-teal-400 shadow-md shadow-teal-500/20'
                : 'glass border-white/10 text-slate-200 hover:border-white/20'
            )}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
            {activeCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-black text-teal-300 text-[10px] font-black flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Locality Quick Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-2 mb-6 scrollbar-none">
        <button
          onClick={() => setFilters((f) => ({ ...f, locality: undefined }))}
          className={cn(
            'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
            !filters.locality
              ? 'bg-teal-400 text-black font-bold shadow-sm'
              : 'bg-white/5 border border-white/8 text-slate-400 hover:text-white hover:bg-white/10'
          )}
        >
          All Areas
        </button>
        {LOCALITIES.map((loc) => {
          const active = filters.locality === loc;
          return (
            <button
              key={loc}
              onClick={() => setFilters((f) => ({ ...f, locality: active ? undefined : loc }))}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
                active
                  ? 'bg-teal-400 text-black font-bold shadow-sm'
                  : 'bg-white/5 border border-white/8 text-slate-400 hover:text-white hover:bg-white/10'
              )}
            >
              {capitalize(loc)}
            </button>
          );
        })}
      </div>

      {/* Expandable Filter Box */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="glass-strong rounded-3xl p-6 gradient-border shadow-2xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {/* Locality */}
                <div>
                  <label className="text-slate-400 font-bold block mb-1.5">Locality / Zone</label>
                  <select
                    value={filters.locality || ''}
                    onChange={(e) => setFilters((f) => ({ ...f, locality: e.target.value || undefined }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-white text-xs focus:border-teal-400/50 focus:outline-none"
                  >
                    <option value="">All Hyderabad Areas</option>
                    {LOCALITIES.map((l) => (
                      <option key={l} value={l}>
                        {capitalize(l)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* BHK */}
                <div>
                  <label className="text-slate-400 font-bold block mb-1.5">Bedrooms</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {BHK_OPTIONS.map((n) => (
                      <button
                        key={n}
                        onClick={() => setFilters((f) => ({ ...f, bhk: f.bhk === n ? undefined : n }))}
                        className={cn(
                          'px-3 py-2 rounded-xl text-xs font-bold transition-all',
                          filters.bhk === n
                            ? 'bg-teal-400 text-black'
                            : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                        )}
                      >
                        {n} BHK
                      </button>
                    ))}
                  </div>
                </div>

                {/* Furnishing */}
                <div>
                  <label className="text-slate-400 font-bold block mb-1.5">Furnishing</label>
                  <select
                    value={filters.furnishing || ''}
                    onChange={(e) => setFilters((f) => ({ ...f, furnishing: e.target.value || undefined }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-white text-xs focus:border-teal-400/50 focus:outline-none"
                  >
                    <option value="">Any Furnishing</option>
                    {FURNISHING_OPTIONS.map((f) => (
                      <option key={f} value={f}>
                        {capitalize(f)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {activeCount > 0 && (
                <button
                  onClick={() => setFilters({})}
                  className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 font-semibold"
                >
                  <RotateCcw className="w-3 h-3" /> Clear filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 items-stretch">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : displayedRentals.length === 0 ? (
        <div className="text-center py-24 glass rounded-3xl p-8 max-w-md mx-auto gradient-border">
          <div className="text-4xl mb-3">🔑</div>
          <h3 className="text-lg font-bold text-white mb-1">No Rentals Found</h3>
          <p className="text-slate-400 text-xs mb-4">Try broadening your search or adjusting filters.</p>
          <button
            onClick={() => setFilters({})}
            className="px-5 py-2 rounded-xl bg-teal-400 text-black font-bold text-xs"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 items-stretch">
            {displayedRentals.map((r, i) => (
              <RentalCard key={r.listing_id} rental={r} index={i} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-12 text-center">
              <button
                onClick={() => fetchRentals(filters, offset)}
                disabled={loadingMore}
                className="px-8 py-3.5 rounded-2xl glass-strong border border-white/15 hover:border-teal-400/40 text-slate-200 hover:text-teal-300 text-xs font-bold transition-all shadow-xl shadow-black/60 disabled:opacity-50"
              >
                {loadingMore ? 'Loading more rentals...' : `Load More Rentals (${total - offset} remaining)`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

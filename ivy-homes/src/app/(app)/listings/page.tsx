'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { listingsAPI, Listing, ListingFilters } from '@/lib/api';
import { ListingCard, SkeletonCard } from '@/components/PropertyCards';
import { ComparisonDrawer } from '@/components/ComparisonDrawer';
import {
  SlidersHorizontal, X, ChevronDown, Search, RotateCcw,
  LayoutGrid, List, CheckCircle, Sparkles, MapPin, Building
} from 'lucide-react';
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
const PROPERTY_TYPES = ['apartment', 'villa', 'independent house', 'builder floor', 'plot'];

const PRICE_PRESETS = [
  { label: 'Under ₹50L', min: undefined, max: 5000000 },
  { label: '₹50L - ₹1Cr', min: 5000000, max: 10000000 },
  { label: '₹1Cr - ₹2Cr', min: 10000000, max: 20000000 },
  { label: '₹2Cr - ₹5Cr', min: 20000000, max: 50000000 },
  { label: '₹5Cr+', min: 50000000, max: undefined },
];

const SORT_OPTIONS = [
  { value: 'posted_at_desc', label: 'Newest Listings', sort_by: 'posted_at', order: 'desc' },
  { value: 'price_asc', label: 'Price: Low to High', sort_by: 'price', order: 'asc' },
  { value: 'price_desc', label: 'Price: High to Low', sort_by: 'price', order: 'desc' },
  { value: 'carpet_area_desc', label: 'Carpet Area: Largest First', sort_by: 'carpet_area', order: 'desc' },
];

function ListingsContent() {
  const searchParams = useSearchParams();
  const initialLocality = searchParams.get('locality') || undefined;
  const initialBhk = searchParams.get('bhk') ? Number(searchParams.get('bhk')) : undefined;

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const LIMIT = 24;

  const [filters, setFilters] = useState<ListingFilters>({
    locality: initialLocality,
    bhk: initialBhk,
  });

  const [sortKey, setSortKey] = useState('posted_at_desc');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedPropertyType, setSelectedPropertyType] = useState<string | undefined>(undefined);

  // Property comparison state
  const [comparedProperties, setComparedProperties] = useState<Listing[]>([]);

  const toggleCompare = (listing: Listing) => {
    setComparedProperties((prev) => {
      const exists = prev.some((p) => p.listing_id === listing.listing_id);
      if (exists) {
        return prev.filter((p) => p.listing_id !== listing.listing_id);
      }
      if (prev.length >= 4) {
        alert('You can compare up to 4 properties simultaneously.');
        return prev;
      }
      return [...prev, listing];
    });
  };

  const getSortParams = (key: string) => {
    const opt = SORT_OPTIONS.find((o) => o.value === key);
    return opt ? { sort_by: opt.sort_by, order: opt.order as 'asc' | 'desc' } : {};
  };

  const fetchListings = useCallback(
    async (currentFilters: ListingFilters, newOffset: number, reset = false) => {
      if (newOffset === 0) setLoading(true);
      else setLoadingMore(true);

      try {
        const sortParams = getSortParams(sortKey);
        const res = await listingsAPI.getAll({
          ...currentFilters,
          ...sortParams,
          property_type: selectedPropertyType,
          limit: LIMIT,
          offset: newOffset,
        });

        setTotal(res.total);
        setHasMore(res.has_more);
        setOffset(newOffset + res.count);
        setListings((prev) => (reset || newOffset === 0 ? res.results : [...prev, ...res.results]));
      } catch (e) {
        console.error('Error fetching listings:', e);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [sortKey, selectedPropertyType]
  );

  useEffect(() => {
    fetchListings(filters, 0, true);
  }, [filters, sortKey, selectedPropertyType, fetchListings]);

  const applyFilter = (key: keyof ListingFilters, val: string | number | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: val || undefined }));
  };

  const applyPricePreset = (min?: number, max?: number) => {
    setFilters((prev) => ({
      ...prev,
      min_price: min,
      max_price: max,
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setVerifiedOnly(false);
    setSelectedPropertyType(undefined);
  };

  // Client-side text & verified filtering for immediate response
  const displayedListings = useMemo(() => {
    let result = listings;
    if (verifiedOnly) {
      result = result.filter((l) => l.is_verified);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.apartment_name?.toLowerCase().includes(q) ||
          l.locality?.toLowerCase().includes(q) ||
          l.posted_by_name?.toLowerCase().includes(q) ||
          l.property_type?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [listings, verifiedOnly, searchQuery]);

  const activeFilterCount =
    Object.values(filters).filter(Boolean).length +
    (verifiedOnly ? 1 : 0) +
    (selectedPropertyType ? 1 : 0);

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-4 sm:py-6">
      {/* ── Page Header & Quick Search Bar ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-400 uppercase tracking-wider">
              Residential Marketplace
            </span>
            <span className="text-xs text-slate-400">Hyderabad</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Buy Verified Properties</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {loading ? 'Searching verified homes...' : `${total.toLocaleString()} listings in Hyderabad database`}
          </p>
        </div>

        {/* Right Search & Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Quick search input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search apartment, area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl glass border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/40"
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

          {/* Sort Selector */}
          <div className="relative">
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2.5 rounded-xl glass border border-white/10 text-xs font-semibold text-slate-200 bg-[#0A0F24] focus:outline-none focus:border-amber-400/40 cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-slate-900 text-white">
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center glass rounded-xl border border-white/10 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                viewMode === 'grid' ? 'bg-amber-400 text-black' : 'text-slate-400 hover:text-white'
              )}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                viewMode === 'list' ? 'bg-amber-400 text-black' : 'text-slate-400 hover:text-white'
              )}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all duration-200',
              showFilters || activeFilterCount > 0
                ? 'bg-amber-400 text-black border-amber-400 shadow-md shadow-amber-500/20'
                : 'glass border-white/10 text-slate-200 hover:border-white/20'
            )}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-black text-amber-400 text-[10px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Quick Locality Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-2 mb-6 scrollbar-none">
        <button
          onClick={() => applyFilter('locality', undefined)}
          className={cn(
            'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
            !filters.locality
              ? 'bg-amber-400 text-black font-bold shadow-sm'
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
              onClick={() => applyFilter('locality', active ? undefined : loc)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
                active
                  ? 'bg-amber-400 text-black font-bold shadow-sm'
                  : 'bg-white/5 border border-white/8 text-slate-400 hover:text-white hover:bg-white/10'
              )}
            >
              {capitalize(loc)}
            </button>
          );
        })}
      </div>

      {/* ── Advanced Expandable Filter Panel ── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden mb-6"
          >
            <div className="glass-strong rounded-3xl p-6 gradient-border border border-amber-400/20 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-white/8 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                  Filter Property Specifications
                </h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset All Filters
                  </button>
                )}
              </div>

              {/* Grid of filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-xs">
                {/* Bedrooms (BHK) */}
                <div>
                  <label className="text-slate-400 font-bold block mb-2">Bedrooms (BHK)</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {BHK_OPTIONS.map((n) => (
                      <button
                        key={n}
                        onClick={() => applyFilter('bhk', filters.bhk === n ? undefined : n)}
                        className={cn(
                          'px-3 py-2 rounded-xl text-xs font-bold transition-all',
                          filters.bhk === n
                            ? 'bg-amber-400 text-black'
                            : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                        )}
                      >
                        {n} BHK
                      </button>
                    ))}
                  </div>
                </div>

                {/* Property Type */}
                <div>
                  <label className="text-slate-400 font-bold block mb-2">Property Type</label>
                  <select
                    value={selectedPropertyType || ''}
                    onChange={(e) => setSelectedPropertyType(e.target.value || undefined)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-white text-xs focus:border-amber-400/50 focus:outline-none"
                  >
                    <option value="">All Types (Apartments, Villas, etc.)</option>
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {capitalize(t)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Furnishing */}
                <div>
                  <label className="text-slate-400 font-bold block mb-2">Furnishing Status</label>
                  <select
                    value={filters.furnishing || ''}
                    onChange={(e) => applyFilter('furnishing', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-white text-xs focus:border-amber-400/50 focus:outline-none"
                  >
                    <option value="">Any Furnishing</option>
                    {FURNISHING_OPTIONS.map((f) => (
                      <option key={f} value={f}>
                        {capitalize(f)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Verified Toggle */}
                <div>
                  <label className="text-slate-400 font-bold block mb-2">Verification Filter</label>
                  <button
                    onClick={() => setVerifiedOnly(!verifiedOnly)}
                    className={cn(
                      'w-full py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all text-xs',
                      verifiedOnly
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/20'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    )}
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    {verifiedOnly ? 'Verified Only (Active)' : 'Show Verified Only'}
                  </button>
                </div>
              </div>

              {/* Price Band Presets */}
              <div>
                <label className="text-slate-400 font-bold block mb-2 text-xs">Quick Budget Presets</label>
                <div className="flex gap-2 flex-wrap">
                  {PRICE_PRESETS.map((p) => {
                    const isSelected = filters.min_price === p.min && filters.max_price === p.max;
                    return (
                      <button
                        key={p.label}
                        onClick={() => applyPricePreset(p.min, p.max)}
                        className={cn(
                          'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all',
                          isSelected
                            ? 'bg-amber-400 text-black font-bold'
                            : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                        )}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Active Filters Chips Row ── */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-6 text-xs">
          <span className="text-slate-400 font-semibold">Active:</span>
          {filters.locality && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300">
              Locality: {capitalize(filters.locality)}
              <button onClick={() => applyFilter('locality', undefined)}>
                <X className="w-3 h-3 ml-1 hover:text-white" />
              </button>
            </span>
          )}
          {filters.bhk && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300">
              {filters.bhk} BHK
              <button onClick={() => applyFilter('bhk', undefined)}>
                <X className="w-3 h-3 ml-1 hover:text-white" />
              </button>
            </span>
          )}
          {selectedPropertyType && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 capitalize">
              Type: {selectedPropertyType}
              <button onClick={() => setSelectedPropertyType(undefined)}>
                <X className="w-3 h-3 ml-1 hover:text-white" />
              </button>
            </span>
          )}
          {verifiedOnly && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300">
              Verified Only
              <button onClick={() => setVerifiedOnly(false)}>
                <X className="w-3 h-3 ml-1 hover:text-white" />
              </button>
            </span>
          )}
          <button
            onClick={clearFilters}
            className="text-slate-400 hover:text-amber-400 underline ml-2 text-xs"
          >
            Clear all
          </button>
        </div>
      )}

      {/* ── Listings Grid / List ── */}
      {loading ? (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 items-stretch'
              : 'space-y-6'
          )}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} viewMode={viewMode} />
          ))}
        </div>
      ) : displayedListings.length === 0 ? (
        <div className="text-center py-28 glass rounded-3xl p-8 max-w-xl mx-auto gradient-border">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/15 text-amber-400 flex items-center justify-center mx-auto mb-4 text-3xl">
            🏠
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Matching Listings</h3>
          <p className="text-slate-400 text-xs sm:text-sm mb-6 max-w-sm mx-auto">
            We could not find properties matching all active filters. Try broadening your criteria or reset filters.
          </p>
          <button
            onClick={clearFilters}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold text-xs hover:opacity-90 transition-opacity"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <>
          <div
            className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 items-stretch'
                : 'space-y-6'
            )}
          >
            {displayedListings.map((l, i) => {
              const isCompared = comparedProperties.some((p) => p.listing_id === l.listing_id);
              return (
                <ListingCard
                  key={l.listing_id}
                  listing={l}
                  index={i}
                  viewMode={viewMode}
                  isCompared={isCompared}
                  onCompareToggle={toggleCompare}
                />
              );
            })}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="mt-12 text-center">
              <button
                onClick={() => fetchListings(filters, offset)}
                disabled={loadingMore}
                className="px-8 py-3.5 rounded-2xl glass-strong border border-white/15 hover:border-amber-400/40 text-slate-200 hover:text-amber-300 text-xs font-bold transition-all shadow-xl shadow-black/60 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {loadingMore ? (
                  <span>Loading additional listings...</span>
                ) : (
                  <>
                    <span>Load More Properties</span>
                    <span className="text-slate-500 font-normal">
                      ({total - offset} remaining)
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Comparison Drawer */}
      <ComparisonDrawer
        selectedProperties={comparedProperties}
        onRemove={(id) => setComparedProperties((prev) => prev.filter((p) => p.listing_id !== id))}
        onClear={() => setComparedProperties([])}
      />
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div></div>}>
      <ListingsContent />
    </Suspense>
  );
}

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { Listing, Rental, savedAPI } from '@/lib/api';
import {
  formatPrice, formatRent, capitalize, getFurnishingColor, cn,
  pricePerSqft, getPropertyImages, calculateEMI
} from '@/lib/utils';
import {
  BedDouble, Bath, Maximize2, MapPin, CheckCircle, Heart,
  Scale, ChevronLeft, ChevronRight
} from 'lucide-react';

// ─── Luxury Listing Card ────────────────────────────────────────────────────

interface ListingCardProps {
  listing: Listing;
  index?: number;
  isSaved?: boolean;
  onSaveToggle?: (id: string, saved: boolean) => void;
  isCompared?: boolean;
  onCompareToggle?: (listing: Listing) => void;
  viewMode?: 'grid' | 'list';
}

export function ListingCard({
  listing,
  index = 0,
  isSaved = false,
  onSaveToggle,
  isCompared = false,
  onCompareToggle,
  viewMode = 'grid',
}: ListingCardProps) {
  const [saved, setSaved] = useState(isSaved);
  const [saving, setSaving] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const images = getPropertyImages(listing.property_type, listing.listing_id);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (saving) return;
    setSaving(true);
    try {
      if (saved) {
        await savedAPI.remove(listing.listing_id);
        setSaved(false);
        onSaveToggle?.(listing.listing_id, false);
      } else {
        await savedAPI.save(listing.listing_id);
        setSaved(true);
        onSaveToggle?.(listing.listing_id, true);
      }
    } catch {}
    setSaving(false);
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCompareToggle?.(listing);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const furnLabel =
    listing.furnishing === 'fully-furnished'
      ? 'Furnished'
      : listing.furnishing === 'semi-furnished'
      ? 'Semi-Furnished'
      : 'Unfurnished';

  const emiCalc = calculateEMI(listing.price > 0 ? listing.price * 0.8 : 5000000, 8.5, 20);
  const estEMI = emiCalc.monthlyEMI;

  // ─── Compact List View ───
  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.2) }}
        className="w-full mb-5"
      >
        <Link href={`/listings/${listing.listing_id}`} className="block">
          <div className="flex flex-col sm:flex-row rounded-2xl overflow-hidden glass border border-white/10 card-hover group cursor-pointer bg-[#0D152D]">
            {/* Thumbnail */}
            <div className="relative sm:w-80 h-56 sm:h-auto shrink-0 overflow-hidden bg-slate-900">
              <img
                src={images[currentImgIndex]}
                alt={listing.apartment_name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

              {/* Stacked badges */}
              <div className="absolute top-3.5 left-3.5 flex flex-col items-start gap-2 z-10 pointer-events-none">
                {listing.is_verified && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/90 text-emerald-950 text-[11px] font-extrabold shadow-md backdrop-blur-md">
                    <CheckCircle className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
                {!listing.is_live && (
                  <span className="inline-block px-3 py-1 rounded-full bg-rose-600/90 text-white text-[11px] font-bold shadow-md backdrop-blur-md">
                    Off Market
                  </span>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="flex flex-col flex-1 p-6 justify-between gap-5">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                      {listing.apartment_name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1.5">
                      <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="truncate">{capitalize(listing.locality)}, Hyderabad</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-2xl font-black text-white">{formatPrice(listing.price)}</p>
                    <p className="text-xs text-amber-400 font-semibold mt-1">
                      Est. EMI ₹{(estEMI / 1000).toFixed(0)}k/mo
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap mt-5 text-xs text-slate-300">
                  <span className="flex items-center gap-2 bg-white/5 px-3.5 py-2 rounded-xl border border-white/8 font-medium">
                    <BedDouble className="w-4 h-4 text-amber-400" /> {listing.bedroom} BHK
                  </span>
                  <span className="flex items-center gap-2 bg-white/5 px-3.5 py-2 rounded-xl border border-white/8 font-medium">
                    <Bath className="w-4 h-4 text-amber-400" /> {listing.bathroom} Baths
                  </span>
                  <span className="flex items-center gap-2 bg-white/5 px-3.5 py-2 rounded-xl border border-white/8 font-medium">
                    <Maximize2 className="w-4 h-4 text-amber-400" /> {listing.carpet_area} sqft
                  </span>
                  <span className="text-xs text-slate-400 font-semibold bg-white/5 px-3.5 py-2 rounded-xl border border-white/8">
                    {pricePerSqft(listing.price, listing.carpet_area)}
                  </span>
                </div>
              </div>

              {/* Action Buttons row */}
              <div className="flex items-center justify-between pt-4 border-t border-white/8">
                <span className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold', getFurnishingColor(listing.furnishing))}>
                  {furnLabel}
                </span>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={handleCompare}
                    className={cn(
                      'px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors',
                      isCompared
                        ? 'bg-amber-400 text-black border-amber-400 font-bold'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    )}
                  >
                    <Scale className="w-3.5 h-3.5" />
                    {isCompared ? 'Comparing' : 'Compare'}
                  </button>

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={cn(
                      'p-2.5 rounded-xl border transition-colors',
                      saved
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:text-rose-400'
                    )}
                  >
                    <Heart className={cn('w-4 h-4', saved && 'fill-current')} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // ─── Default Luxury Grid Card (Clean, Spacious, Beautiful Typography) ───
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.2) }}
      className="flex flex-col h-full"
    >
      <Link href={`/listings/${listing.listing_id}`} className="block h-full group">
        <div className="flex flex-col h-full rounded-3xl overflow-hidden card-hover glass border border-white/10 bg-[#0D152D] transition-all">
          {/* ── 1. Image Container (Self-contained, generous height) ── */}
          <div className="relative w-full h-52 sm:h-56 shrink-0 overflow-hidden bg-slate-900">
            <img
              src={images[currentImgIndex]}
              alt={listing.apartment_name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

            {/* Carousel navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 backdrop-blur-md text-white/90 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 backdrop-blur-md text-white/90 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Stacked Badges Top-Left */}
            <div className="absolute top-3.5 left-3.5 flex flex-col items-start gap-1.5 z-10 pointer-events-none">
              {listing.is_verified && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-emerald-950 text-[11px] font-extrabold shadow-lg backdrop-blur-md">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  Verified
                </span>
              )}
              {!listing.is_live && (
                <span className="inline-block px-3 py-1 rounded-full bg-rose-600 text-white text-[11px] font-bold shadow-lg backdrop-blur-md">
                  Off Market
                </span>
              )}
            </div>

            {/* Top-Right Quick Actions */}
            <div className="absolute top-3.5 right-3.5 flex items-center gap-2 z-10">
              <button
                onClick={handleCompare}
                aria-label="Compare property"
                className={cn(
                  'w-8 h-8 rounded-full backdrop-blur-md border flex items-center justify-center transition-all duration-200',
                  isCompared
                    ? 'bg-amber-400 border-amber-400 text-black shadow-lg shadow-amber-500/30 font-bold'
                    : 'bg-black/60 border-white/20 text-white hover:bg-amber-400 hover:text-black hover:border-amber-400'
                )}
                title="Compare side-by-side"
              >
                <Scale className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                aria-label={saved ? 'Unsave' : 'Save'}
                className={cn(
                  'w-8 h-8 rounded-full backdrop-blur-md border flex items-center justify-center transition-all duration-200 disabled:opacity-60',
                  saved
                    ? 'bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-500/40'
                    : 'bg-black/60 border-white/20 text-white hover:bg-rose-500/40 hover:border-rose-400/50 hover:text-rose-300'
                )}
                title="Save property"
              >
                <Heart className={cn('w-3.5 h-3.5 transition-all', saved && 'fill-current scale-110')} />
              </button>
            </div>

            {/* Carousel Dots */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-sm pointer-events-none">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-300',
                      i === currentImgIndex ? 'w-4 bg-amber-400' : 'w-1.5 bg-white/40'
                    )}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── 2. Content Body (Spacious, Well-Organized, High Readability) ── */}
          <div className="flex flex-col flex-1 p-5 sm:p-6 gap-4 bg-[#0D152D] justify-between">
            {/* Section A: Price & Rate */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight tabular-nums break-words">
                  {formatPrice(listing.price)}
                </span>
                <span className="text-xs font-semibold text-slate-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 shrink-0 whitespace-nowrap">
                  {pricePerSqft(listing.price, listing.carpet_area)}
                </span>
              </div>
              {listing.price > 0 && (
                <p className="text-xs text-amber-400 font-semibold tracking-wide whitespace-nowrap">
                  Est. EMI ₹{(estEMI / 1000).toFixed(0)}k/mo
                </p>
              )}
            </div>

            {/* Section B: Property Name & Locality */}
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white leading-snug line-clamp-1 group-hover:text-amber-400 transition-colors">
                {listing.apartment_name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{capitalize(listing.locality)}, Hyderabad</span>
              </div>
            </div>

            {/* Section C: 3-Column Specs Matrix with Clean Dividers & Zero Number Overflow */}
            <div className="grid grid-cols-3 gap-2.5 py-3 px-3 rounded-2xl bg-white/[0.04] border border-white/8 text-xs text-slate-200">
              <div className="flex items-center justify-center gap-1.5 font-semibold text-center whitespace-nowrap">
                <BedDouble className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="tabular-nums">{listing.bedroom} BHK</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 font-semibold text-center border-x border-white/10 whitespace-nowrap">
                <Bath className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="tabular-nums">{listing.bathroom} Baths</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 font-semibold text-center whitespace-nowrap">
                <Maximize2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="tabular-nums">{listing.carpet_area} sqft</span>
              </div>
            </div>

            {/* Section D: Card Footer (Furnishing & Type) */}
            <div className="flex items-center justify-between pt-3.5 border-t border-white/10 gap-2 flex-wrap">
              <span className={cn('px-3 py-1 rounded-lg text-xs font-semibold leading-none whitespace-nowrap', getFurnishingColor(listing.furnishing))}>
                {furnLabel}
              </span>
              <span className="capitalize text-slate-400 font-medium text-xs tracking-wide truncate">
                {listing.property_type || 'Apartment'}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Luxury Rental Card ─────────────────────────────────────────────────────

interface RentalCardProps {
  rental: Rental;
  index?: number;
}

export function RentalCard({ rental, index = 0 }: RentalCardProps) {
  const images = getPropertyImages(rental.property_type, rental.listing_id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.2) }}
      className="flex flex-col h-full"
    >
      <Link href={`/rentals/${rental.listing_id}`} className="block h-full group">
        <div className="flex flex-col h-full rounded-3xl overflow-hidden card-hover glass border border-white/10 bg-[#0D152D] transition-all">
          {/* Image */}
          <div className="relative w-full h-52 sm:h-56 shrink-0 overflow-hidden bg-slate-900">
            <img
              src={images[0]}
              alt={rental.apartment_name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

            <div className="absolute top-3.5 left-3.5 flex flex-col items-start gap-1.5 z-10 pointer-events-none">
              <span className="inline-block px-3 py-1 rounded-full bg-teal-500 text-teal-950 text-[11px] font-extrabold shadow-lg backdrop-blur-md">
                Rental
              </span>
              {!rental.is_live && (
                <span className="inline-block px-3 py-1 rounded-full bg-rose-600 text-white text-[11px] font-bold shadow-lg backdrop-blur-md">
                  Leased
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col flex-1 p-5 sm:p-6 gap-4 bg-[#0D152D] justify-between">
            <div className="space-y-1.5">
              <span className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight block tabular-nums break-words">
                {formatRent(rental.price)}
              </span>
              {rental.deposit > 0 && (
                <p className="text-xs text-teal-300 font-semibold tracking-wide whitespace-nowrap">
                  Deposit: ₹{rental.deposit.toLocaleString('en-IN')}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white leading-snug line-clamp-1 group-hover:text-teal-400 transition-colors">
                {rental.apartment_name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{capitalize(rental.locality)}, Hyderabad</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 py-3 px-3 rounded-2xl bg-white/[0.04] border border-white/8 text-xs text-slate-200">
              <div className="flex items-center justify-center gap-1.5 font-semibold text-center border-r border-white/10 whitespace-nowrap">
                <BedDouble className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="tabular-nums">{rental.bedroom} BHK</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 font-semibold text-center whitespace-nowrap">
                <Maximize2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="tabular-nums">{rental.carpet_area} sqft</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3.5 border-t border-white/10 gap-2 flex-wrap">
              <span className={cn('px-3 py-1 rounded-lg text-xs font-semibold leading-none whitespace-nowrap', getFurnishingColor(rental.furnishing))}>
                {capitalize(rental.furnishing)}
              </span>
              <span className="capitalize text-slate-400 font-medium text-xs tracking-wide truncate">
                Floor {rental.floor} of {rental.total_floors}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Luxury Skeleton Card ───────────────────────────────────────────────────

export function SkeletonCard({ viewMode = 'grid' }: { viewMode?: 'grid' | 'list' }) {
  if (viewMode === 'list') {
    return (
      <div className="rounded-2xl overflow-hidden glass p-5 flex flex-col sm:flex-row gap-5 mb-5">
        <div className="skeleton h-52 sm:w-80 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-4 py-2">
          <div className="skeleton h-7 w-3/4 rounded-xl" />
          <div className="skeleton h-4 w-1/2 rounded-lg" />
          <div className="flex gap-3 pt-4">
            <div className="skeleton h-9 w-24 rounded-xl" />
            <div className="skeleton h-9 w-24 rounded-xl" />
            <div className="skeleton h-9 w-24 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl overflow-hidden glass border border-white/10">
      <div className="skeleton h-52 sm:h-56 w-full" />
      <div className="p-5 sm:p-6 space-y-4 bg-[#0D152D]">
        <div className="flex justify-between items-center">
          <div className="skeleton h-8 w-32 rounded-xl" />
          <div className="skeleton h-6 w-24 rounded-lg" />
        </div>
        <div className="skeleton h-5 w-3/4 rounded-lg" />
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/8">
          <div className="skeleton h-9 rounded-xl" />
          <div className="skeleton h-9 rounded-xl" />
          <div className="skeleton h-9 rounded-xl" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="skeleton h-6 w-20 rounded-lg" />
          <div className="skeleton h-4 w-16 rounded-md" />
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { savedAPI, Listing } from '@/lib/api';
import { ListingCard, SkeletonCard } from '@/components/PropertyCards';
import { ComparisonDrawer } from '@/components/ComparisonDrawer';
import { Heart, Scale, Share2, ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function SavedPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparedProperties, setComparedProperties] = useState<Listing[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    savedAPI
      .getAll()
      .then((data) => {
        if (isMounted) {
          setListings(data.results || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleUnsave = (id: string) => {
    setListings((prev) => prev.filter((l) => l.listing_id !== id));
    setComparedProperties((prev) => prev.filter((p) => p.listing_id !== id));
  };

  const toggleCompare = (listing: Listing) => {
    setComparedProperties((prev) => {
      const exists = prev.some((p) => p.listing_id === listing.listing_id);
      if (exists) return prev.filter((p) => p.listing_id !== listing.listing_id);
      if (prev.length >= 4) {
        alert('You can compare up to 4 properties.');
        return prev;
      }
      return [...prev, listing];
    });
  };

  const compareAll = () => {
    setComparedProperties(listings.slice(0, 4));
  };

  const handleExportShortlist = () => {
    if (typeof window !== 'undefined') {
      const text = listings
        .map(
          (l, i) =>
            `${i + 1}. ${l.apartment_name} (${l.bedroom} BHK in ${l.locality}) - ${formatPrice(l.price)} | Ref: ${l.listing_id}`
        )
        .join('\n');
      navigator.clipboard.writeText(`Ivy Homes — My Shortlisted Properties:\n\n${text}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-4 sm:py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-400 uppercase tracking-wider">
              Curated Shortlist
            </span>
            <span className="text-xs text-slate-400">Personal Vault</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white flex items-center gap-3">
            <Heart className="w-8 h-8 text-rose-400 fill-rose-400" />
            My Saved Properties
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {loading ? 'Retrieving saved homes...' : `${listings.length} ${listings.length === 1 ? 'property' : 'properties'} saved to your account`}
          </p>
        </div>

        {listings.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            {listings.length >= 2 && (
              <button
                onClick={compareAll}
                className="px-4 py-2.5 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 hover:bg-amber-400 hover:text-black font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <Scale className="w-4 h-4" /> Compare Shortlist
              </button>
            )}

            <button
              onClick={handleExportShortlist}
              className="px-4 py-2.5 rounded-xl glass border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Share2 className="w-4 h-4" /> {copied ? 'Shortlist Copied!' : 'Export Shortlist'}
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 items-stretch">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-28 glass rounded-3xl p-8 max-w-lg mx-auto gradient-border"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-6">
            <Heart className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Your Shortlist is Empty</h3>
          <p className="text-slate-400 text-xs sm:text-sm max-w-sm mx-auto mb-6">
            Browse our verified residential marketplace and click the heart icon on properties you wish to track.
          </p>
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-black font-extrabold text-xs hover:opacity-95 shadow-xl shadow-amber-500/20"
          >
            Explore Verified Homes <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 items-stretch">
          {listings.map((l, i) => {
            const isCompared = comparedProperties.some((p) => p.listing_id === l.listing_id);
            return (
              <ListingCard
                key={l.listing_id}
                listing={l}
                index={i}
                isSaved={true}
                onSaveToggle={(id, isStillSaved) => {
                  if (!isStillSaved) handleUnsave(id);
                }}
                isCompared={isCompared}
                onCompareToggle={toggleCompare}
              />
            );
          })}
        </div>
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

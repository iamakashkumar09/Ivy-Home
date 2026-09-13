'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Listing } from '@/lib/api';
import { formatPrice, pricePerSqft, capitalize, formatArea } from '@/lib/utils';
import { X, Scale, ArrowRight, BedDouble, MapPin, CheckCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface ComparisonDrawerProps {
  selectedProperties: Listing[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export function ComparisonDrawer({ selectedProperties, onRemove, onClear }: ComparisonDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (selectedProperties.length === 0) return null;

  return (
    <>
      {/* Floating Bottom Bar */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-2xl"
      >
        <div className="glass-strong rounded-2xl p-3 sm:p-4 gradient-border shadow-2xl shadow-black/80 flex items-center justify-between gap-3 border border-amber-400/30">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-black flex items-center justify-center font-bold shrink-0 shadow-lg shadow-amber-500/30">
              <Scale className="w-5 h-5" />
            </div>
            <div className="truncate">
              <p className="text-sm font-bold text-white flex items-center gap-2">
                Compare Properties ({selectedProperties.length}/4)
              </p>
              <p className="text-xs text-slate-400 truncate">
                {selectedProperties.map((p) => p.apartment_name).join(', ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClear}
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-white/5 transition-colors text-xs flex items-center gap-1"
              title="Clear comparison"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold text-xs hover:opacity-90 transition-opacity shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
            >
              Compare Side-by-Side <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Fullscreen Comparison Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-lg">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-6xl max-h-[90vh] glass-strong rounded-3xl p-6 sm:p-8 gradient-border shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 border border-amber-400/40 flex items-center justify-center">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Side-by-Side Property Comparison</h2>
                    <p className="text-xs text-slate-400">Comparing {selectedProperties.length} shortlisted homes in Hyderabad</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Matrix Table */}
              <div className="overflow-x-auto flex-1 pr-2">
                <div className="grid grid-cols-5 gap-4 min-w-[760px]">
                  {/* Parameter Column */}
                  <div className="space-y-4 pt-24 font-semibold text-xs text-slate-400">
                    <div className="h-10 flex items-center">Price</div>
                    <div className="h-10 flex items-center">Price / sqft</div>
                    <div className="h-10 flex items-center">Configuration</div>
                    <div className="h-10 flex items-center">Carpet Area</div>
                    <div className="h-10 flex items-center">Locality</div>
                    <div className="h-10 flex items-center">Floor Level</div>
                    <div className="h-10 flex items-center">Furnishing</div>
                    <div className="h-10 flex items-center">Facing Direction</div>
                    <div className="h-10 flex items-center">Verification Status</div>
                    <div className="h-12 flex items-center">Action</div>
                  </div>

                  {/* Property Columns */}
                  {selectedProperties.map((p) => (
                    <div key={p.listing_id} className="glass rounded-2xl p-4 border border-white/10 space-y-4 relative">
                      <button
                        onClick={() => onRemove(p.listing_id)}
                        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/40 hover:bg-red-500/20 text-slate-400 hover:text-red-400 flex items-center justify-center transition-colors z-10"
                        title="Remove from comparison"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      {/* Header */}
                      <div className="h-20 flex flex-col justify-between pr-6">
                        <h4 className="text-sm font-bold text-white line-clamp-2">{p.apartment_name}</h4>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-amber-400" /> {capitalize(p.locality)}
                        </span>
                      </div>

                      {/* Rows */}
                      <div className="h-10 flex items-center text-base font-black text-amber-400">
                        {formatPrice(p.price)}
                      </div>
                      <div className="h-10 flex items-center text-xs font-semibold text-slate-300">
                        {pricePerSqft(p.price, p.carpet_area)}
                      </div>
                      <div className="h-10 flex items-center text-xs font-medium text-white gap-1">
                        <BedDouble className="w-3.5 h-3.5 text-amber-400" /> {p.bedroom} BHK ({p.bathroom} Baths)
                      </div>
                      <div className="h-10 flex items-center text-xs text-slate-300">
                        {formatArea(p.carpet_area)}
                      </div>
                      <div className="h-10 flex items-center text-xs text-slate-300 capitalize">
                        {p.locality}
                      </div>
                      <div className="h-10 flex items-center text-xs text-slate-300">
                        Floor {p.floor} of {p.total_floors}
                      </div>
                      <div className="h-10 flex items-center text-xs text-slate-300 capitalize">
                        {p.furnishing?.replace('-', ' ')}
                      </div>
                      <div className="h-10 flex items-center text-xs text-slate-300 capitalize">
                        {p.facing_direction || 'N/A'}
                      </div>
                      <div className="h-10 flex items-center text-xs">
                        {p.is_verified ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[11px]">
                            <CheckCircle className="w-3 h-3" /> Verified
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Standard</span>
                        )}
                      </div>

                      {/* View Button */}
                      <div className="h-12 flex items-center">
                        <Link
                          href={`/listings/${p.listing_id}`}
                          onClick={() => setIsOpen(false)}
                          className="w-full py-2 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 hover:bg-amber-400 hover:text-black font-semibold text-xs text-center transition-colors block"
                        >
                          View Full Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

'use client';

import { useState } from 'react';
import { HYDERABAD_LOCALITIES, LocalityGuide, formatPrice } from '@/lib/utils';
import { TrendingUp, Car, Sparkles, ArrowRight, ShieldCheck, Building2 } from 'lucide-react';
import Link from 'next/link';

export function LocalityExplorer() {
  const [selectedLocality, setSelectedLocality] = useState<LocalityGuide>(HYDERABAD_LOCALITIES[0]);

  return (
    <div className="glass rounded-3xl p-6 sm:p-10 gradient-border shadow-2xl relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Hyderabad Neighborhood Hotspots
          </div>
          <h2 className="text-3xl font-extrabold text-white">Explore Micro-Markets & Lifestyle</h2>
          <p className="text-slate-400 text-sm mt-1">
            Real estate dynamics, commute benchmarks, and property price trends across top localities.
          </p>
        </div>

        {/* Locality Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {HYDERABAD_LOCALITIES.map((loc) => (
            <button
              key={loc.id}
              onClick={() => setSelectedLocality(loc)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                selectedLocality.id === loc.id
                  ? 'bg-amber-400 text-black shadow-lg shadow-amber-500/25'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              {loc.name}
            </button>
          ))}
        </div>
      </div>

      {/* Active Locality Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Image & Badge */}
        <div className="lg:col-span-5 relative group">
          <div className="rounded-2xl overflow-hidden aspect-[4/3] border border-white/10 shadow-2xl relative">
            <img
              src={selectedLocality.image}
              alt={selectedLocality.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <span className="text-xs px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-amber-300 font-medium">
                {selectedLocality.vibe}
              </span>
              <h3 className="text-2xl font-black text-white mt-1.5 drop-shadow">{selectedLocality.name}</h3>
            </div>
          </div>
        </div>

        {/* Right: Insights & Stats */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <span className="text-amber-400 text-sm font-semibold">{selectedLocality.tagline}</span>
            <p className="text-slate-300 text-sm mt-2 leading-relaxed">{selectedLocality.description}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="glass rounded-xl p-3.5 border border-white/10">
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> Avg Sale Rate
              </p>
              <p className="text-lg font-black text-white">₹{selectedLocality.avgSqft.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-emerald-400">per sq.ft</p>
            </div>

            <div className="glass rounded-xl p-3.5 border border-white/10">
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                <Building2 className="w-3.5 h-3.5 text-teal-400" /> Avg 3BHK Rent
              </p>
              <p className="text-lg font-black text-white">{formatPrice(selectedLocality.avgRent)}</p>
              <p className="text-[10px] text-slate-400">monthly</p>
            </div>

            <div className="glass rounded-xl p-3.5 border border-white/10">
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                <Car className="w-3.5 h-3.5 text-violet-400" /> Commute to Hitec
              </p>
              <p className="text-lg font-black text-white">{selectedLocality.commuteHitec}</p>
              <p className="text-[10px] text-slate-400">Airport: {selectedLocality.commuteAirport}</p>
            </div>
          </div>

          {/* Highlights */}
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Neighborhood Highlights</p>
            <div className="flex flex-wrap gap-2">
              {selectedLocality.highlights.map((h, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> {h}
                </span>
              ))}
            </div>
          </div>

          {/* Action Link */}
          <div className="pt-2">
            <Link
              href={`/listings?locality=${encodeURIComponent(selectedLocality.id)}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold text-xs hover:opacity-90 transition-opacity shadow-lg shadow-amber-500/20"
            >
              Explore Homes in {selectedLocality.name} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

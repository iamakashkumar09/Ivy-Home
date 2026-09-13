'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LocalityExplorer } from '@/components/LocalityExplorer';
import { EMICalculator } from '@/components/EMICalculator';
import {
  Search, Building2, Key, ShieldCheck, ArrowRight,
  CheckCircle2, Sparkles, Award, Users, PhoneCall
} from 'lucide-react';

const LOCALITIES = [
  'All Areas',
  'Banjara Hills',
  'Jubilee Hills',
  'Gachibowli',
  'Hitec City',
  'Kondapur',
  'Madhapur',
  'Kukatpally',
  'Manikonda',
  'Nanakramguda',
];

const CURATED_COLLECTIONS = [
  {
    title: 'Cyberabad Tech Corridor',
    tagline: 'Walk-to-work luxury high-rises in Gachibowli & Hitec City',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    count: '1,200+ Homes',
    href: '/listings?locality=gachibowli',
    price: 'From ₹85 Lakh',
  },
  {
    title: 'Banjara & Jubilee Hills Mansions',
    tagline: 'Elite bungalows and designer penthouses with private decks',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    count: '450+ Estates',
    href: '/listings?locality=banjara+hills',
    price: 'From ₹2.8 Crore',
  },
  {
    title: 'High-Yield Kondapur Rentals',
    tagline: 'Modern fully-furnished residences curated for executives',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    count: '600+ Rentals',
    href: '/rentals?locality=kondapur',
    price: 'From ₹32,000/mo',
  },
  {
    title: 'Pre-Launch Builder Projects',
    tagline: 'RERA-approved iconic towers with world-class clubhouses',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    count: '120+ Projects',
    href: '/projects',
    price: 'Possession 2026-2028',
  },
];

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'buy' | 'rent' | 'projects'>('buy');
  const [locality, setLocality] = useState('All Areas');
  const [bhk, setBhk] = useState<number | 'any'>('any');
  const [budget, setBudget] = useState('any');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const targetRoute = activeTab === 'buy' ? '/listings' : activeTab === 'rent' ? '/rentals' : '/projects';
    const params = new URLSearchParams();
    if (locality !== 'All Areas') params.set('locality', locality.toLowerCase());
    if (bhk !== 'any') params.set('bhk', String(bhk));
    router.push(`${targetRoute}${params.toString() ? '?' + params.toString() : ''}`);
  };

  return (
    <div className="min-h-screen bg-[#050814] text-white selection:bg-amber-400 selection:text-black">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-16 pb-20 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 overflow-hidden hero-gradient w-full">
        {/* Glow Spheres */}
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)' }} />
        <div className="absolute top-40 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(20, 184, 166, 0.12) 0%, transparent 70%)' }} />

        <div className="w-full max-w-5xl mx-auto text-center relative z-10">
          {/* VIP Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-amber-400/30 text-amber-300 text-xs font-semibold mb-6 shadow-lg shadow-amber-500/10"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Hyderabad’s Premier Verified Real Estate Ecosystem
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] mb-6"
          >
            Discover Your Next <br />
            <span className="gold-text">Luxury Residence</span> in Hyderabad
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal"
          >
            Explore verified penthouses, contemporary high-rises, and gated estates across Cyberabad and historic luxury corridors. Zero brokerage misinformation.
          </motion.p>

          {/* Multi-Tab Luxury Quick Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="w-full glass-strong rounded-3xl p-5 sm:p-7 gradient-border shadow-2xl shadow-black/80"
          >
            {/* Tabs */}
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-5">
              {[
                { id: 'buy', label: 'Buy Property', icon: Search },
                { id: 'rent', label: 'Rent Luxury', icon: Key },
                { id: 'projects', label: 'Builder Projects', icon: Building2 },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'buy' | 'rent' | 'projects')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      active
                        ? 'bg-amber-400 text-black shadow-lg shadow-amber-500/25'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Filter controls row */}
            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left mt-2">
              {/* Locality */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-amber-400/50 hover:bg-white/10 transition-all duration-300">
                <label className="text-[11px] sm:text-xs uppercase font-bold tracking-wider text-amber-400 block mb-1.5">
                  Location / Area
                </label>
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full bg-transparent text-white text-sm sm:text-base font-semibold focus:outline-none cursor-pointer"
                >
                  {LOCALITIES.map((l) => (
                    <option key={l} value={l} className="bg-slate-900 text-white">
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              {/* BHK */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-amber-400/50 hover:bg-white/10 transition-all duration-300">
                <label className="text-[11px] sm:text-xs uppercase font-bold tracking-wider text-amber-400 block mb-1.5">
                  Bedrooms (BHK)
                </label>
                <select
                  value={bhk}
                  onChange={(e) => setBhk(e.target.value === 'any' ? 'any' : Number(e.target.value))}
                  className="w-full bg-transparent text-white text-sm sm:text-base font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="any" className="bg-slate-900 text-white">Any BHK</option>
                  <option value={1} className="bg-slate-900 text-white">1 BHK</option>
                  <option value={2} className="bg-slate-900 text-white">2 BHK</option>
                  <option value={3} className="bg-slate-900 text-white">3 BHK</option>
                  <option value={4} className="bg-slate-900 text-white">4 BHK</option>
                  <option value={5} className="bg-slate-900 text-white">5+ BHK Penthouse</option>
                </select>
              </div>

              {/* Budget */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-amber-400/50 hover:bg-white/10 transition-all duration-300">
                <label className="text-[11px] sm:text-xs uppercase font-bold tracking-wider text-amber-400 block mb-1.5">
                  Price Range
                </label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-transparent text-white text-sm sm:text-base font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="any" className="bg-slate-900 text-white">Any Budget</option>
                  <option value="under50" className="bg-slate-900 text-white">Under ₹50 Lakh</option>
                  <option value="50to100" className="bg-slate-900 text-white">₹50L – ₹1.0 Crore</option>
                  <option value="100to200" className="bg-slate-900 text-white">₹1.0Cr – ₹2.0 Crore</option>
                  <option value="above200" className="bg-slate-900 text-white">₹2.0 Crore & Above</option>
                </select>
              </div>

              {/* Search Submit */}
              <button
                type="submit"
                className="h-full min-h-[60px] rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-black font-extrabold text-sm sm:text-base hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Find Homes
              </button>
            </form>
          </motion.div>

          {/* Quick Metrics Ticker */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-white/8 text-center"
          >
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white">4,000+</p>
              <p className="text-xs text-slate-400 mt-0.5">Verified Properties</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-amber-400">₹65.2 L</p>
              <p className="text-xs text-slate-400 mt-0.5">Avg 2BHK Price</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400">100%</p>
              <p className="text-xs text-slate-400 mt-0.5">Direct Seller Link</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-teal-400">15 min</p>
              <p className="text-xs text-slate-400 mt-0.5">Tour Confirmation</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Curated Collections */}
      <section className="py-20 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold mb-2">
              <Award className="w-3.5 h-3.5" /> Curated Showcase
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Signature Living Collections</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">Hand-picked residential portfolios across prime Hyderabad locations.</p>
          </div>

          <Link
            href="/listings"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
          >
            Explore All Listings <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
          {CURATED_COLLECTIONS.map((col, i) => (
            <motion.div
              key={col.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={col.href} className="block group h-full">
                <div className="glass rounded-3xl overflow-hidden card-hover gradient-border flex flex-col h-full bg-[#0D152D]/90">
                  <div className="relative h-52 overflow-hidden bg-slate-900">
                    <img
                      src={col.image}
                      alt={col.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-amber-300 text-[10px] font-bold">
                      {col.count}
                    </span>
                    <span className="absolute bottom-3 left-3 text-xs font-bold text-white drop-shadow">
                      {col.price}
                    </span>
                  </div>

                  <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors mb-1.5">
                        {col.title}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{col.tagline}</p>
                    </div>

                    <div className="pt-4 border-t border-white/8 flex items-center justify-between text-xs font-semibold text-amber-400">
                      <span>View Homes</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Interactive Locality Hotspots Explorer */}
      <section className="py-12 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 w-full">
        <LocalityExplorer />
      </section>

      {/* Mortgage & EMI Estimator Widget */}
      <section className="py-16 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 w-full">
        <EMICalculator />
      </section>

      {/* Trust & Verification Matrix */}
      <section className="py-16 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 w-full">
        <div className="glass rounded-3xl p-8 sm:p-12 lg:p-16 gradient-border relative overflow-hidden text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" /> The Ivy Homes Standard
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              The Transparent Real Estate Experience
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              We eliminate bait-and-switch pricing, expired records, and duplicate seller noise. Every home is cross-referenced with municipal and cadastral records.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-12 text-left">
            <div className="bg-white/3 rounded-2xl p-6 border border-white/8 space-y-2">
              <div className="w-11 h-11 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">RERA & Title Verification</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Project registrations and carpet area disclosures checked against Telangana RERA databases.
              </p>
            </div>

            <div className="bg-white/3 rounded-2xl p-6 border border-white/8 space-y-2">
              <div className="w-11 h-11 rounded-xl bg-emerald-400/20 text-emerald-400 flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Direct Seller & Builder Access</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Speak directly with authentic owners and authorized developer representatives without middlemen.
              </p>
            </div>

            <div className="bg-white/3 rounded-2xl p-6 border border-white/8 space-y-2">
              <div className="w-11 h-11 rounded-xl bg-violet-400/20 text-violet-400 flex items-center justify-center mb-3">
                <PhoneCall className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">On-Demand Private Showing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Schedule in-person or live 4K video walkthroughs coordinated by an Ivy Homes property manager.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

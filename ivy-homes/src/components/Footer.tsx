'use client';

import Link from 'next/link';
import { Home, ShieldCheck, Sparkles, MapPin, Mail, ArrowUpRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/8 bg-[#050814]/90 backdrop-blur-2xl mt-20 text-slate-400 text-sm w-full">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <Home className="w-5 h-5 text-black" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                <span className="gold-text">Ivy</span> Homes
              </span>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Hyderabad’s premier real estate technology intelligence portal. Discover verified luxury residences, high-yield rentals, and RERA-approved builder projects.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Verified Database
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Direct Seller Connect
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-white font-bold">Properties</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/listings" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                  Buy Residential <ArrowUpRight className="w-3 h-3 text-slate-600" />
                </Link>
              </li>
              <li>
                <Link href="/rentals" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                  Rent Luxury Homes <ArrowUpRight className="w-3 h-3 text-slate-600" />
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                  Builder Projects <ArrowUpRight className="w-3 h-3 text-slate-600" />
                </Link>
              </li>
              <li>
                <Link href="/saved" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                  Saved Properties <ArrowUpRight className="w-3 h-3 text-slate-600" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Top Localities */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-white font-bold">Top Hotspots</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/listings?locality=banjara+hills" className="hover:text-amber-400 transition-colors">
                  Banjara Hills
                </Link>
              </li>
              <li>
                <Link href="/listings?locality=jubilee+hills" className="hover:text-amber-400 transition-colors">
                  Jubilee Hills
                </Link>
              </li>
              <li>
                <Link href="/listings?locality=gachibowli" className="hover:text-amber-400 transition-colors">
                  Gachibowli & Financial Dist.
                </Link>
              </li>
              <li>
                <Link href="/listings?locality=hitech+city" className="hover:text-amber-400 transition-colors">
                  Hitec City & Madhapur
                </Link>
              </li>
              <li>
                <Link href="/listings?locality=kondapur" className="hover:text-amber-400 transition-colors">
                  Kondapur
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Intelligence */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-white font-bold">Market Intelligence</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/analytics" className="hover:text-amber-400 transition-colors">
                  Price Trends & Analytics
                </Link>
              </li>
              <li className="flex items-center gap-1.5 text-slate-400 pt-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Hyderabad, Telangana</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-400">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>concierge@ivy.homes</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Ivy Homes Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400">Privacy Policy</span>
            <span className="hover:text-slate-400">Terms of Service</span>
            <span className="hover:text-slate-400">RERA Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

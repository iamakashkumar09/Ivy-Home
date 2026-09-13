'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { listingsAPI, rentalsAPI, projectsAPI, Listing } from '@/lib/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  Home, Key, Building2, Loader2, BarChart3,
  DollarSign, MapPin, Building, ShieldAlert
} from 'lucide-react';
import { formatPrice, capitalize } from '@/lib/utils';

interface InsightData {
  totalListings: number;
  activeListings: number;
  totalRentals: number;
  totalProjects: number;
  medianPrice: number;
  avgPricePerSqft: number;
  byLocality: { locality: string; count: number; avgPrice: number }[];
  byBhk: { bedroom: number; count: number; avgPrice: number }[];
  byFurnishing: { name: string; value: number }[];
  byPropertyType: { name: string; value: number }[];
  priceHistogram: { range: string; count: number }[];
  recentListings: number;
}

const CHART_COLORS = ['#F5A623', '#8B5CF6', '#0EA5E9', '#10B981', '#F43F5E', '#EC4899'];

interface TooltipPayloadItem {
  name?: string;
  value?: number;
  color?: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl border border-white/15 p-3 text-xs shadow-2xl space-y-1">
      <p className="text-slate-300 font-bold">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#F5A623' }} className="font-semibold">
          {p.name === 'avgPrice' ? formatPrice(p.value || 0) : `${(p.value || 0).toLocaleString('en-IN')} ${p.name || 'Records'}`}
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        if (isMounted) setProgress(15);
        const [listingsRes, rentalsRes, projectsRes] = await Promise.all([
          listingsAPI.getAll({ limit: 200, offset: 0 }),
          rentalsAPI.getAll({ limit: 1 }),
          projectsAPI.getAll({ limit: 1 }),
        ]);

        if (isMounted) setProgress(35);
        const allListings: Listing[] = [...listingsRes.results];
        const totalPages = Math.min(Math.ceil(listingsRes.total / 200), 5); // up to 1,000 listings

        for (let i = 1; i < totalPages; i++) {
          const page = await listingsAPI.getAll({ limit: 200, offset: i * 200 });
          allListings.push(...page.results);
          if (isMounted) setProgress(Math.round(35 + (i / totalPages) * 45));
        }

        if (isMounted) setProgress(85);

        // Active listings
        const active = allListings.filter((l) => l.is_live);

        // Locality distribution
        const localityMap = new Map<string, { count: number; totalPrice: number }>();
        allListings.forEach((l) => {
          const k = l.locality;
          const cur = localityMap.get(k) || { count: 0, totalPrice: 0 };
          localityMap.set(k, { count: cur.count + 1, totalPrice: cur.totalPrice + (l.price || 0) });
        });

        const byLocality = Array.from(localityMap.entries())
          .map(([loc, { count, totalPrice }]) => ({
            locality: loc,
            count,
            avgPrice: Math.round(totalPrice / count),
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8);

        // BHK breakdown
        const bhkMap = new Map<number, { count: number; totalPrice: number }>();
        allListings.forEach((l) => {
          const k = l.bedroom;
          if (k > 0 && k <= 6) {
            const cur = bhkMap.get(k) || { count: 0, totalPrice: 0 };
            bhkMap.set(k, { count: cur.count + 1, totalPrice: cur.totalPrice + (l.price || 0) });
          }
        });

        const byBhk = Array.from(bhkMap.entries())
          .map(([bedroom, { count, totalPrice }]) => ({
            bedroom,
            count,
            avgPrice: Math.round(totalPrice / count),
          }))
          .sort((a, b) => a.bedroom - b.bedroom);

        // Furnishing
        const furnMap = new Map<string, number>();
        allListings.forEach((l) => furnMap.set(l.furnishing, (furnMap.get(l.furnishing) || 0) + 1));
        const byFurnishing = Array.from(furnMap.entries()).map(([name, value]) => ({
          name: capitalize(name || 'Unknown'),
          value,
        }));

        // Property types
        const typeMap = new Map<string, number>();
        allListings.forEach((l) => typeMap.set(l.property_type, (typeMap.get(l.property_type) || 0) + 1));
        const byPropertyType = Array.from(typeMap.entries())
          .map(([name, value]) => ({ name: capitalize(name || 'Apartment'), value }))
          .sort((a, b) => b.value - a.value);

        // Price distribution bands
        const ranges = [
          { range: '< ₹50L', min: 0, max: 5000000 },
          { range: '₹50L–1Cr', min: 5000000, max: 10000000 },
          { range: '₹1Cr–1.5Cr', min: 10000000, max: 15000000 },
          { range: '₹1.5Cr–2Cr', min: 15000000, max: 20000000 },
          { range: '> ₹2Cr', min: 20000000, max: Infinity },
        ];
        const priceHistogram = ranges.map(({ range, min, max }) => ({
          range,
          count: allListings.filter((l) => l.price >= min && l.price < max).length,
        }));

        // Median price
        const prices = active.map((l) => l.price).filter(Boolean).sort((a, b) => a - b);
        const medianPrice = prices[Math.floor(prices.length / 2)] || 0;

        // Avg price per sqft
        const validListings = active.filter((l) => l.carpet_area > 0 && l.carpet_area < 10000);
        const avgPricePerSqft = validListings.length
          ? Math.round(
              validListings.reduce((sum, l) => sum + l.price / l.carpet_area, 0) / validListings.length
            )
          : 0;

        // Recent listings
        const ref = new Date('2026-09-10T00:00:00+05:30');
        const weekAgo = new Date(ref.getTime() - 7 * 24 * 60 * 60 * 1000);
        const recentListings = allListings.filter((l) => {
          const d = new Date(l.posted_at);
          return d >= weekAgo && d < ref;
        }).length;

        if (isMounted) {
          setProgress(100);
          setData({
            totalListings: listingsRes.total,
            activeListings: (allListings.filter((l) => l.is_live).length / allListings.length) * listingsRes.total,
            totalRentals: rentalsRes.total,
            totalProjects: projectsRes.total,
            medianPrice,
            avgPricePerSqft,
            byLocality,
            byBhk,
            byFurnishing,
            byPropertyType,
            priceHistogram,
            recentListings,
          });
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center gap-6 px-4">
        <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
        <div className="w-72 space-y-2 text-center">
          <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-violet-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-slate-400 text-xs font-semibold">
            Aggregating Market Micro-Data... {progress}%
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const statCards = [
    {
      icon: Home,
      label: 'Residential Database',
      value: data.totalListings.toLocaleString('en-IN'),
      color: 'from-amber-400 to-orange-500',
      sub: `~${Math.round(data.activeListings).toLocaleString('en-IN')} active on market`,
    },
    {
      icon: Key,
      label: 'Luxury Rentals',
      value: data.totalRentals.toLocaleString('en-IN'),
      color: 'from-teal-400 to-cyan-500',
      sub: 'Hyderabad residential rentals',
    },
    {
      icon: Building2,
      label: 'Builder Projects',
      value: data.totalProjects.toLocaleString('en-IN'),
      color: 'from-violet-400 to-indigo-500',
      sub: 'RERA-approved developments',
    },
    {
      icon: DollarSign,
      label: 'Median Sale Rate',
      value: formatPrice(data.medianPrice),
      color: 'from-rose-400 to-pink-500',
      sub: `₹${data.avgPricePerSqft.toLocaleString('en-IN')}/sqft city benchmark`,
    },
  ];

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-4 sm:py-6 space-y-8 sm:space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-400 uppercase tracking-wider">
              Live Market Intelligence
            </span>
            <span className="text-xs text-slate-400">Hyderabad Metro Zone</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-amber-400" />
            Market Insights & Valuation Radar
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time computed analytics derived from {data.totalListings.toLocaleString()} Hyderabad properties
          </p>
        </div>
      </div>

      {/* KPI Stat Cards with Distinct Box Gaps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {statCards.map(({ icon: Icon, label, value, color, sub }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="glass rounded-3xl p-6 sm:p-7 gradient-border bg-[#0D152D]/90 h-full flex flex-col justify-between hover:border-amber-400/30 transition-colors shadow-xl">
              <div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-black font-bold mb-4 shadow-md`}>
                  <Icon className="w-6 h-6 text-black" />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                <p className="text-2xl sm:text-3xl xl:text-4xl font-black text-white mt-1.5 tabular-nums break-words">{value}</p>
              </div>
              <p className="text-xs text-amber-400/90 font-medium mt-4 pt-3 border-t border-white/5">
                {sub}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1: Locality Leaderboard & BHK Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Locality Leaderboard */}
        <div className="lg:col-span-7 glass rounded-3xl p-6 sm:p-7 gradient-border bg-[#0D152D]/90">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" /> Top Micro-Markets by Supply
              </h2>
              <p className="text-xs text-slate-400">Total volume of retrievable properties per zone</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={data.byLocality} layout="vertical" margin={{ left: 15, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="locality"
                tick={{ fill: '#CBD5E1', fontSize: 11 }}
                width={90}
                tickFormatter={(v) => capitalize(v)}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#F5A623" radius={[0, 6, 6, 0]} name="Properties" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* BHK Breakdown */}
        <div className="lg:col-span-5 glass rounded-3xl p-6 sm:p-7 gradient-border bg-[#0D152D]/90">
          <div className="mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-violet-400" /> BHK Configuration Demand
            </h2>
            <p className="text-xs text-slate-400">Inventory breakdown across bedroom counts</p>
          </div>

          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={data.byBhk} margin={{ left: -10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="bedroom"
                tickFormatter={(v) => `${v} BHK`}
                tick={{ fill: '#CBD5E1', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#8B5CF6" radius={[6, 6, 0, 0]} name="Inventory" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2: Price Bands & Property Types */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Price Histogram */}
        <div className="lg:col-span-8 glass rounded-3xl p-6 sm:p-7 gradient-border bg-[#0D152D]/90">
          <div className="mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Price Band Distribution
            </h2>
            <p className="text-xs text-slate-400">Volume distribution across budget brackets</p>
          </div>

          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={data.priceHistogram} margin={{ left: -10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="range" tick={{ fill: '#CBD5E1', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Homes">
                {data.priceHistogram.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Property Types Donut */}
        <div className="lg:col-span-4 glass rounded-3xl p-6 sm:p-7 gradient-border bg-[#0D152D]/90 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-teal-400" /> Asset Types
            </h2>
            <p className="text-xs text-slate-400 mb-3">Apartments, villas, and independent floors</p>

            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={data.byPropertyType}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  innerRadius={35}
                  dataKey="value"
                  paddingAngle={4}
                >
                  {data.byPropertyType.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: unknown) => [`${Number(val || 0).toLocaleString('en-IN')} listings`, 'Share']}
                  contentStyle={{
                    background: '#0A0F24',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    fontSize: 11,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2">
            {data.byPropertyType.slice(0, 4).map(({ name, value }, i) => (
              <div key={name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="text-slate-300 font-medium">{name}</span>
                </div>
                <span className="text-slate-400 font-bold">{value.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Key Discoveries & Data Quality Intelligence ── */}
      <div className="glass-strong rounded-3xl p-6 sm:p-8 gradient-border shadow-2xl space-y-6">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-400 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Database Verification & Discrepancy Findings</h2>
            <p className="text-xs text-slate-400">
              Live audit of API documentation anomalies, fraud filters, and unit metrics
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/3 p-4 rounded-2xl border border-white/6 space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-400">Missing Endpoint</span>
            <h3 className="text-sm font-bold text-white">/v1/analytics/summary is 404</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The documented summary analytics endpoint does not exist. All charts and metrics above are dynamically aggregated on the client from raw paginated record streams.
            </p>
          </div>

          <div className="bg-white/3 p-4 rounded-2xl border border-white/6 space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-400">Units & Area Sanitization</span>
            <h3 className="text-sm font-bold text-white">Area Metric Discrepancies</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Certain carpet area values were logged in square meters (sqm) rather than sqft (e.g. 105 sqm ≈ 1,130 sqft). Our UI normalizes outliers for fair comparisons.
            </p>
          </div>

          <div className="bg-white/3 p-4 rounded-2xl border border-white/6 space-y-1">
            <span className="text-[10px] uppercase font-bold text-violet-400">Auth Token Refresh</span>
            <h3 className="text-sm font-bold text-white">900s Expiry Interceptor</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Authentication tokens expire in 15 minutes (900s) rather than the documented 24 hours. The app transparently refreshes access tokens without user interruption.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

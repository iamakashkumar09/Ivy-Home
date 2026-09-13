'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { projectsAPI, Project, ProjectFilters } from '@/lib/api';
import { SkeletonCard } from '@/components/PropertyCards';
import {
  Building2, MapPin, Calendar, Layers, ChevronDown, SlidersHorizontal,
  RotateCcw, ShieldCheck, Users, Search, X, Sparkles, CheckCircle2, ArrowRight
} from 'lucide-react';
import { capitalize, getStatusColor, cn } from '@/lib/utils';

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

const STATUS_OPTIONS = ['ready to move', 'under construction', 'new launch'];

function formatProjectPrice(val: number) {
  if (!val) return 'Price on Request';
  if (val < 1000) return `₹${val.toFixed(1)} L`;
  return `₹${(val / 100).toFixed(2)} Cr`;
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const statusGradients: Record<string, string> = {
    'ready to move': 'from-emerald-600 via-teal-700 to-slate-900',
    'under construction': 'from-amber-600 via-orange-700 to-slate-900',
    'new launch': 'from-violet-600 via-purple-700 to-slate-900',
  };
  const gradient = statusGradients[project.project_status] || 'from-slate-700 to-slate-900';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.2) }}
      className="h-full flex flex-col"
    >
      <Link href={`/projects/${project.project_id}`} className="block h-full group">
        <div className="flex flex-col h-full rounded-3xl overflow-hidden card-hover glass gradient-border bg-[#0D152D] transition-all">
          {/* Header Banner */}
          <div className={`h-40 bg-gradient-to-br ${gradient} relative p-5 flex flex-col justify-between overflow-hidden shrink-0`}>
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <Building2 className="w-32 h-32 text-white" />
            </div>

            <div className="flex items-center justify-between z-10">
              <span className={cn('text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md shadow-md', getStatusColor(project.project_status))}>
                {capitalize(project.project_status)}
              </span>

              {project.rera_number && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/50 text-emerald-300 border border-white/10 backdrop-blur-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> RERA
                </span>
              )}
            </div>

            <div className="z-10 flex justify-between items-end">
              <div>
                <p className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">Total Inventory</p>
                <p className="text-base font-black text-white">{project.total_units?.toLocaleString('en-IN') || '150+'} Units</p>
              </div>
              <span className="text-xs font-bold text-amber-300 bg-black/60 px-3 py-1 rounded-xl backdrop-blur-sm border border-white/10">
                {project.total_listings || 0} active resale
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                {project.apartment_name}
              </h3>
              <p className="text-xs text-slate-400 font-medium">{project.developer_name}</p>
              
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{capitalize(project.locality)}, Hyderabad</span>
              </div>
            </div>

            <div className="space-y-2.5 border-t border-white/8 pt-3.5 text-xs">
              <div className="flex justify-between items-center gap-2 flex-wrap">
                <span className="text-slate-400">Price Spectrum</span>
                <span className="text-amber-400 font-bold tabular-nums whitespace-nowrap">
                  {formatProjectPrice(project.price_min)} – {formatProjectPrice(project.price_max)}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2 flex-wrap">
                <span className="text-slate-400">Unit Dimensions</span>
                <span className="text-slate-200 font-semibold tabular-nums whitespace-nowrap">
                  {project.min_area_sqft}–{project.max_area_sqft} sqft
                </span>
              </div>
              <div className="flex justify-between items-center gap-2 flex-wrap">
                <span className="text-slate-400">Possession</span>
                <span className="text-slate-200 font-semibold whitespace-nowrap">
                  {project.possession_date
                    ? new Date(project.possession_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
                    : 'Ready to Move'}
                </span>
              </div>
            </div>

            {/* Amenities tags */}
            {project.amenities?.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-white/8">
                {project.amenities.slice(0, 3).map((a) => (
                  <span key={a} className="text-[11px] px-2.5 py-0.5 rounded-lg bg-white/5 text-slate-300 capitalize border border-white/5 font-medium">
                    {a}
                  </span>
                ))}
                {project.amenities.length > 3 && (
                  <span className="text-[11px] text-slate-500 font-medium pl-1">
                    +{project.amenities.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function ProjectsContent() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ProjectFilters>({});
  const [sortKey, setSortKey] = useState('price_max_desc');
  const LIMIT = 24;

  const fetchProjects = useCallback(
    async (f: ProjectFilters, off: number, reset = false) => {
      if (off === 0) setLoading(true);
      else setLoadingMore(true);

      const sortMap: Record<string, [string, string]> = {
        price_max_desc: ['price_max', 'desc'],
        price_min_asc: ['price_min', 'asc'],
        launch_date_desc: ['launch_date', 'desc'],
        total_units_desc: ['total_units', 'desc'],
      };
      const [sort_by, order] = sortMap[sortKey] || ['price_max', 'desc'];

      try {
        const res = await projectsAPI.getAll({
          ...f,
          sort_by,
          order: order as 'asc' | 'desc',
          limit: LIMIT,
          offset: off,
        });

        setTotal(res.total);
        setHasMore(res.has_more);
        setOffset(off + res.count);
        setProjects((prev) => (reset || off === 0 ? res.results : [...prev, ...res.results]));
      } catch (e) {
        console.error('Error fetching projects:', e);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [sortKey]
  );

  useEffect(() => {
    fetchProjects(filters, 0, true);
  }, [filters, sortKey, fetchProjects]);

  const activeCount = Object.values(filters).filter(Boolean).length;

  const displayedProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter(
      (p) =>
        p.apartment_name?.toLowerCase().includes(q) ||
        p.developer_name?.toLowerCase().includes(q) ||
        p.locality?.toLowerCase().includes(q)
    );
  }, [projects, searchQuery]);

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-4 sm:py-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-300 uppercase tracking-wider">
              Developer Ecosystem
            </span>
            <span className="text-xs text-slate-400">Hyderabad</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Builder Projects & Iconic Towers</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {loading ? 'Surveying projects...' : `${total.toLocaleString()} RERA-approved builder projects in Hyderabad`}
          </p>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search project or developer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl glass border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-400/40"
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
              className="appearance-none pl-3.5 pr-8 py-2.5 rounded-xl glass border border-white/10 text-xs font-semibold text-slate-200 bg-[#0A0F24] focus:outline-none focus:border-violet-400/40 cursor-pointer"
            >
              <option value="price_max_desc" className="bg-slate-900 text-white">Highest Price</option>
              <option value="price_min_asc" className="bg-slate-900 text-white">Lowest Entry</option>
              <option value="total_units_desc" className="bg-slate-900 text-white">Largest Gated Society</option>
              <option value="launch_date_desc" className="bg-slate-900 text-white">Newest Launch</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all',
              showFilters || activeCount > 0
                ? 'bg-violet-500 text-white border-violet-400 shadow-md shadow-violet-500/20'
                : 'glass border-white/10 text-slate-200 hover:border-white/20'
            )}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
            {activeCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white text-violet-600 text-[10px] font-black flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Locality quick pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-2 mb-6 scrollbar-none">
        <button
          onClick={() => setFilters((f) => ({ ...f, locality: undefined }))}
          className={cn(
            'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
            !filters.locality
              ? 'bg-violet-500 text-white font-bold shadow-sm'
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
                  ? 'bg-violet-500 text-white font-bold shadow-sm'
                  : 'bg-white/5 border border-white/8 text-slate-400 hover:text-white hover:bg-white/10'
              )}
            >
              {capitalize(loc)}
            </button>
          );
        })}
      </div>

      {/* Expandable Filter */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="glass-strong rounded-3xl p-6 gradient-border shadow-2xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 font-bold block mb-1.5">Locality</label>
                  <select
                    value={filters.locality || ''}
                    onChange={(e) => setFilters((f) => ({ ...f, locality: e.target.value || undefined }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-white text-xs focus:border-violet-400/50 focus:outline-none"
                  >
                    <option value="">All Hyderabad Zones</option>
                    {LOCALITIES.map((l) => (
                      <option key={l} value={l}>
                        {capitalize(l)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1.5">Construction Status</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {STATUS_OPTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setFilters((f) => ({ ...f, project_status: f.project_status === s ? undefined : s }))}
                        className={cn(
                          'px-3 py-2 rounded-xl text-xs font-bold transition-all',
                          filters.project_status === s
                            ? 'bg-violet-500 text-white'
                            : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                        )}
                      >
                        {capitalize(s)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {activeCount > 0 && (
                <button
                  onClick={() => setFilters({})}
                  className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 font-semibold"
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
      ) : displayedProjects.length === 0 ? (
        <div className="text-center py-24 glass rounded-3xl p-8 max-w-md mx-auto gradient-border">
          <div className="text-4xl mb-3">🏗️</div>
          <h3 className="text-lg font-bold text-white mb-1">No Projects Found</h3>
          <p className="text-slate-400 text-xs mb-4">Try adjusting your filters or area selection.</p>
          <button
            onClick={() => setFilters({})}
            className="px-5 py-2 rounded-xl bg-violet-500 text-white font-bold text-xs"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 items-stretch">
            {displayedProjects.map((p, i) => (
              <ProjectCard key={p.project_id} project={p} index={i} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-12 text-center">
              <button
                onClick={() => fetchProjects(filters, offset)}
                disabled={loadingMore}
                className="px-8 py-3.5 rounded-2xl glass-strong border border-white/15 hover:border-violet-400/40 text-slate-200 hover:text-violet-300 text-xs font-bold transition-all shadow-xl shadow-black/60 disabled:opacity-50"
              >
                {loadingMore ? 'Loading more projects...' : `Load More Projects (${total - offset} remaining)`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div></div>}>
      <ProjectsContent />
    </Suspense>
  );
}

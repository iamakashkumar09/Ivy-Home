'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { projectsAPI, Project } from '@/lib/api';
import {
  ArrowLeft, Building2, MapPin, ShieldCheck,
  ExternalLink, Loader2, CheckCircle2
} from 'lucide-react';
import { capitalize, getStatusColor, cn } from '@/lib/utils';
import { ScheduleTourModal } from '@/components/ScheduleTourModal';
import { ContactSellerModal } from '@/components/ContactSellerModal';

function formatProjectPrice(val: number) {
  if (!val) return 'Price on Request';
  if (val < 1000) return `₹${val.toFixed(1)} L`;
  return `₹${(val / 100).toFixed(2)} Cr`;
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [tourModalOpen, setTourModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  useEffect(() => {
    projectsAPI.getById(id).then(setProject).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="text-4xl">🏗️</div>
        <h2 className="text-xl font-bold text-white">Project Not Found</h2>
        <button
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-xl bg-violet-500 text-white font-semibold text-xs"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-4 sm:py-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-400 hover:text-white text-xs font-semibold mb-6 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Projects
      </button>

      {/* Hero Banner */}
      <div className="rounded-3xl overflow-hidden glass border border-white/10 mb-10 relative">
        <div className="h-64 sm:h-80 bg-gradient-to-br from-violet-900 via-indigo-950 to-[#050814] relative p-6 sm:p-10 flex flex-col justify-end">
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <Building2 className="w-72 h-72 text-white" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className={cn('text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider backdrop-blur-md', getStatusColor(project.project_status))}>
                {capitalize(project.project_status)}
              </span>
              {project.rera_number && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <ShieldCheck className="w-3.5 h-3.5" /> Telangana RERA Verified
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white">{project.apartment_name}</h1>
            <p className="text-slate-300 text-sm mt-1">by <strong className="text-amber-400">{project.developer_name}</strong></p>
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-2">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{capitalize(project.locality)}, Hyderabad</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-start">
        {/* Left Col */}
        <div className="lg:col-span-8 space-y-8 sm:space-y-10">
          {/* Key Facts */}
          <div className="glass rounded-3xl p-6 sm:p-8 lg:p-10 gradient-border space-y-6">
            <h2 className="text-xs uppercase tracking-widest text-violet-400 font-extrabold">
              Project Architecture & Capacity
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 sm:gap-6">
              {[
                { label: 'Total Residences', value: `${project.total_units?.toLocaleString('en-IN') || '150+'} Units` },
                { label: 'Towers', value: `${project.total_towers || 'Multi'} Towers` },
                { label: 'Elevation', value: `${project.total_floors || 'High-Rise'} Floors` },
                { label: 'Launch Date', value: project.launch_date ? new Date(project.launch_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Q1 2024' },
                { label: 'Estimated Handover', value: project.possession_date ? new Date(project.possession_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Ready to Move' },
                { label: 'Active Resales', value: `${project.total_listings || 0} Homes` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/[0.03] rounded-2xl p-5 sm:p-6 border border-white/8 space-y-1.5 hover:border-violet-400/30 transition-colors">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{label}</p>
                  <p className="text-base sm:text-lg font-black text-white tabular-nums break-words">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing & Floor Range */}
          <div className="glass rounded-3xl p-6 sm:p-8 lg:p-10 gradient-border space-y-6">
            <h2 className="text-xs uppercase tracking-widest text-amber-400 font-extrabold">Pricing & Layout Configurations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <div className="bg-white/[0.03] rounded-2xl p-6 text-center border border-white/8 space-y-1.5">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Unit Area Spectrum</p>
                <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">{project.min_area_sqft} – {project.max_area_sqft}</p>
                <p className="text-xs text-slate-400">square feet (carpet to super built-up)</p>
              </div>
              <div className="bg-white/[0.03] rounded-2xl p-6 text-center border border-white/8 space-y-1.5">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Investment Range</p>
                <p className="text-2xl sm:text-3xl font-black text-amber-400 tabular-nums">
                  {formatProjectPrice(project.price_min)} – {formatProjectPrice(project.price_max)}
                </p>
                <p className="text-xs text-slate-400">base price (ex-registration)</p>
              </div>
            </div>
          </div>

          {/* Amenities Grid */}
          {project.amenities?.length > 0 && (
            <div className="glass rounded-3xl p-6 sm:p-8 lg:p-10 gradient-border space-y-6">
              <h2 className="text-xs uppercase tracking-widest text-violet-400 font-extrabold">World-Class Clubhouse & Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {project.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-2.5 p-3.5 rounded-xl bg-white/[0.03] border border-white/8 text-xs sm:text-sm text-slate-200 capitalize font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sticky Card */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-6">
            <div className="glass-strong rounded-3xl p-6 sm:p-8 lg:p-9 gradient-border shadow-2xl space-y-6">
              {project.rera_number && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-400/25 space-y-1">
                  <p className="text-xs font-extrabold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" /> Official RERA Registration
                  </p>
                  <p className="text-xs font-mono text-slate-200 break-all select-all font-semibold">
                    {project.rera_number}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={() => setTourModalOpen(true)}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-extrabold text-sm shadow-xl shadow-violet-500/25 hover:opacity-95 transition-all"
                >
                  Book Site Visit & Model Flat Tour
                </button>
                <button
                  onClick={() => setContactModalOpen(true)}
                  className="w-full py-4 rounded-2xl glass border border-violet-400/30 text-violet-300 font-bold text-sm hover:bg-violet-400/10 transition-colors"
                >
                  Contact Builder Sales Desk
                </button>
              </div>

              {project.project_url && (
                <a
                  href={project.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Project Brochure & Floorplans
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <ScheduleTourModal
        isOpen={tourModalOpen}
        onClose={() => setTourModalOpen(false)}
        propertyName={project.apartment_name}
        locality={capitalize(project.locality)}
        priceFormatted={formatProjectPrice(project.price_min)}
      />

      <ContactSellerModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        propertyName={project.apartment_name}
        sellerName={project.developer_name}
        sellerType="Authorized Developer"
        listingId={project.project_id}
        priceFormatted={formatProjectPrice(project.price_min)}
      />
    </div>
  );
}

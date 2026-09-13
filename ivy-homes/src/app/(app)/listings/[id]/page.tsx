'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { listingsAPI, savedAPI, Listing } from '@/lib/api';
import {
  ArrowLeft, BedDouble, Bath, Maximize2, MapPin,
  Heart, ExternalLink, Calendar, Building, Car,
  Phone, User, Loader2, Share2, Compass,
  ShieldCheck, Sparkles, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import {
  formatPrice, formatDate, capitalize, getFurnishingColor,
  cn, pricePerSqft, formatArea, getPropertyImages, calculateEMI, HYDERABAD_LOCALITIES
} from '@/lib/utils';
import { ScheduleTourModal } from '@/components/ScheduleTourModal';
import { ContactSellerModal } from '@/components/ContactSellerModal';
import { EMICalculator } from '@/components/EMICalculator';
import { ListingCard } from '@/components/PropertyCards';

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Modals & Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [tourModalOpen, setTourModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  // Similar properties
  const [similarListings, setSimilarListings] = useState<Listing[]>([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await listingsAPI.getById(id);
        setListing(data);

        // Fetch similar listings in same locality
        if (data.locality) {
          listingsAPI.getAll({ locality: data.locality, limit: 3 }).then((res) => {
            setSimilarListings(res.results.filter((l) => l.listing_id !== data.listing_id).slice(0, 3));
          }).catch(() => {});
        }
      } catch {
        setError('Listing could not be retrieved from the database.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleSave = async () => {
    if (!listing || saving) return;
    setSaving(true);
    try {
      if (saved) {
        await savedAPI.remove(listing.listing_id);
        setSaved(false);
      } else {
        await savedAPI.save(listing.listing_id);
        setSaved(true);
      }
    } catch {}
    setSaving(false);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
          <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold">
            Loading Property Portfolio...
          </p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center text-3xl">
          🏚️
        </div>
        <h2 className="text-2xl font-bold text-white">{error || 'Property not found'}</h2>
        <p className="text-slate-400 text-sm max-w-sm">
          The requested listing record could not be found or has been withdrawn by the seller.
        </p>
        <button
          onClick={() => router.back()}
          className="mt-2 px-6 py-2.5 rounded-xl bg-amber-400 text-black font-semibold text-xs hover:bg-amber-300 transition-colors"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  const images = getPropertyImages(listing.property_type, listing.listing_id);
  const emiData = calculateEMI(listing.price * 0.8, 8.5, 20);

  const localityData = HYDERABAD_LOCALITIES.find(
    (l) => l.id.toLowerCase() === listing.locality?.toLowerCase()
  );

  const specs = [
    { icon: BedDouble, label: 'Configuration', value: `${listing.bedroom} Bedrooms` },
    { icon: Bath, label: 'Bathrooms', value: `${listing.bathroom} Baths` },
    { icon: Maximize2, label: 'Carpet Area', value: formatArea(listing.carpet_area) },
    {
      icon: Building,
      label: 'Floor Level',
      value: `Floor ${listing.floor} of ${listing.total_floors}`,
    },
    {
      icon: Car,
      label: 'Parking',
      value: listing.covered_parking > 0 ? `${listing.covered_parking} Covered Bays` : 'Street / Open',
    },
    {
      icon: Compass,
      label: 'Facing Direction',
      value: `${capitalize(listing.facing_direction || 'East')} Facing`,
    },
  ];

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-4 sm:py-6">
      {/* ── Top Bar: Back, Breadcrumb & Actions ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2.5 text-slate-300 hover:text-white text-sm font-bold transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
          Back to Residential Marketplace
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass border border-white/10 text-slate-200 hover:text-white text-xs font-bold transition-colors shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            {copied ? 'Link Copied!' : 'Share Listing'}
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-colors shadow-sm',
              saved
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                : 'glass border-white/10 text-slate-200 hover:text-rose-400'
            )}
          >
            <Heart className={cn('w-4 h-4', saved && 'fill-current text-rose-400')} />
            {saved ? 'Saved to Vault' : 'Save Property'}
          </button>
        </div>
      </div>

      {/* ── Full-Bleed Mosaic Image Gallery with Generous Gaps ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl overflow-hidden glass border border-white/10 mb-12 relative group"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-5 h-80 sm:h-[480px] p-4 sm:p-5 bg-[#0A0F24]">
          {/* Main Large Image */}
          <div
            onClick={() => {
              setLightboxIdx(0);
              setLightboxOpen(true);
            }}
            className="md:col-span-2 md:row-span-2 overflow-hidden rounded-2xl relative cursor-pointer group/img"
          >
            <img
              src={images[0]}
              alt={listing.apartment_name}
              className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <span className="absolute bottom-5 left-5 px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-bold shadow-lg">
              Primary Facade View
            </span>
          </div>

          {/* Secondary Images */}
          {images.slice(1, 5).map((img, i) => (
            <div
              key={i}
              onClick={() => {
                setLightboxIdx(i + 1);
                setLightboxOpen(true);
              }}
              className="hidden md:block overflow-hidden rounded-2xl relative cursor-pointer group/img"
            >
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/25 group-hover/img:bg-transparent transition-colors" />
              {i === 3 && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center text-white font-extrabold text-sm gap-2">
                  <span>View All {images.length} Photos</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Main Layout: Content Grid & Sticky Action Sidebar ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-start">
        {/* Left Column: Specs, Amenities, Description, EMI, Neighborhood */}
        <div className="xl:col-span-8 space-y-8 sm:space-y-10">
          {/* Title & Location Header */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-3 flex-wrap">
              {listing.is_verified && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold shadow-sm">
                  <ShieldCheck className="w-4 h-4" /> Ivy Verified Property
                </span>
              )}
              <span className={cn('text-xs px-4 py-1.5 rounded-full font-bold', getFurnishingColor(listing.furnishing))}>
                {capitalize(listing.furnishing)}
              </span>
              <span className="text-xs px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 capitalize font-semibold">
                {listing.property_type}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              {listing.apartment_name}
            </h1>
            <div className="flex items-center gap-2 text-slate-400 text-sm sm:text-base font-medium">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{capitalize(listing.locality)}, Hyderabad, Telangana</span>
            </div>
          </div>

          {/* Key Specs Matrix with Clear Gaps and Beautiful Boxes */}
          <div className="glass rounded-3xl p-6 sm:p-8 lg:p-10 gradient-border space-y-8">
            <h2 className="text-xs uppercase tracking-widest text-amber-400 font-extrabold flex items-center gap-2.5">
              <Sparkles className="w-4 h-4" /> Property Architecture & Dimensions
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 sm:gap-6">
              {specs.map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-white/[0.03] rounded-2xl p-5 sm:p-6 border border-white/8 space-y-2 hover:border-amber-400/30 transition-colors">
                  <div className="w-11 h-11 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 mb-3 shadow-md">
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{label}</p>
                  <p className="text-base sm:text-lg font-black text-white break-words tabular-nums">{value}</p>
                </div>
              ))}
            </div>

            {/* Area Comparison Distinct Box Grid */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
              <div className="bg-white/[0.03] p-5 sm:p-6 rounded-2xl border border-white/8 text-center space-y-1.5">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Carpet Area</p>
                <p className="text-xl sm:text-2xl font-black text-white tabular-nums">{listing.carpet_area} sqft</p>
              </div>
              <div className="bg-white/[0.03] p-5 sm:p-6 rounded-2xl border border-white/8 text-center space-y-1.5">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Super Built-up</p>
                <p className="text-xl sm:text-2xl font-black text-white tabular-nums">{listing.super_built_up_area ? `${listing.super_built_up_area} sqft` : 'N/A'}</p>
              </div>
              <div className="bg-white/[0.03] p-5 sm:p-6 rounded-2xl border border-white/8 text-center space-y-1.5">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Price Rate</p>
                <p className="text-xl sm:text-2xl font-black text-amber-400 tabular-nums">
                  {pricePerSqft(listing.price, listing.carpet_area)}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div className="glass rounded-3xl p-6 sm:p-8 lg:p-10 gradient-border space-y-4">
              <h2 className="text-xs font-extrabold text-amber-400 uppercase tracking-widest">
                Property Overview & Remarks
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
                {listing.description}
              </p>
            </div>
          )}

          {/* Interactive Mortgage & Loan Calculator */}
          <div>
            <EMICalculator initialPrice={listing.price} />
          </div>

          {/* Neighborhood & Commute Guide with Clear Box Gaps */}
          <div className="glass rounded-3xl p-6 sm:p-8 lg:p-10 gradient-border space-y-6">
            <h2 className="text-xs font-extrabold text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Locality & Commute Landmarks ({capitalize(listing.locality)})
            </h2>

            {localityData ? (
              <div className="space-y-6">
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">{localityData.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 pt-2">
                  <div className="bg-white/[0.03] p-5 sm:p-6 rounded-2xl border border-white/8 space-y-1.5">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">To Hitec City / Cyber Towers</p>
                    <p className="text-base sm:text-lg font-black text-white">{localityData.commuteHitec}</p>
                  </div>
                  <div className="bg-white/[0.03] p-5 sm:p-6 rounded-2xl border border-white/8 space-y-1.5">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">To RGIA Airport (ORR)</p>
                    <p className="text-base sm:text-lg font-black text-white">{localityData.commuteAirport}</p>
                  </div>
                  <div className="bg-white/[0.03] p-5 sm:p-6 rounded-2xl border border-white/8 space-y-1.5">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Locality Price Benchmark</p>
                    <p className="text-base sm:text-lg font-black text-amber-400 tabular-nums">₹{localityData.avgSqft.toLocaleString('en-IN')}/sqft</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Centrally situated in {capitalize(listing.locality)} with rapid arterial access to the Outer Ring Road and Metro stations.
              </p>
            )}
          </div>

          {/* Similar Properties */}
          {similarListings.length > 0 && (
            <div className="space-y-6 pt-6 border-t border-white/10">
              <div>
                <h3 className="text-2xl font-black text-white">Similar Properties in {capitalize(listing.locality)}</h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">Explore other verified luxury residences in this neighborhood.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                {similarListings.map((sim, i) => (
                  <ListingCard key={sim.listing_id} listing={sim} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Action Sidebar */}
        <div className="xl:col-span-4">
          <div className="sticky top-24 space-y-6">
            {/* Price & Primary CTAs */}
            <div className="glass-strong rounded-3xl p-6 sm:p-8 lg:p-9 gradient-border shadow-2xl space-y-7">
              <div>
                <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest block mb-1">Offered Price</span>
                <p className="text-3xl sm:text-4xl xl:text-5xl font-black text-white tracking-tight break-words tabular-nums">
                  {formatPrice(listing.price)}
                </p>
                <div className="flex items-center justify-between gap-3 flex-wrap text-xs sm:text-sm text-slate-400 mt-4 pt-4 border-t border-white/10">
                  <span className="font-semibold text-slate-300 whitespace-nowrap">{pricePerSqft(listing.price, listing.carpet_area)}</span>
                  <span className="text-amber-400 font-extrabold whitespace-nowrap">Est. EMI ₹{(emiData.monthlyEMI / 1000).toFixed(0)}k/mo</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3.5">
                <button
                  onClick={() => setTourModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-black font-extrabold text-sm hover:opacity-95 transition-all shadow-xl shadow-amber-500/25"
                >
                  <Calendar className="w-4 h-4" /> Schedule Private Tour
                </button>

                <button
                  onClick={() => setContactModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl glass border border-amber-400/30 text-amber-300 hover:bg-amber-400/10 font-bold text-sm transition-colors"
                >
                  <Phone className="w-4 h-4" /> Contact Verified Seller
                </button>

                {listing.listing_url && (
                  <a
                    href={listing.listing_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Source Listing on {capitalize(listing.website)}
                  </a>
                )}
              </div>

              {/* Representative / Seller Profile */}
              <div className="pt-6 border-t border-white/10 space-y-4">
                <p className="text-xs uppercase tracking-widest text-slate-400 font-extrabold">Listed Representative</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-black text-base shadow-md shrink-0">
                    {listing.posted_by_name?.[0]?.toUpperCase() || <User className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-white truncate">{listing.posted_by_name || 'Verified Partner'}</p>
                    <p className="text-xs text-slate-400 capitalize">{listing.posted_by || 'Direct Broker'}</p>
                  </div>
                </div>

                {listing.posted_by_contact && (
                  <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/8 flex items-center justify-between gap-3 text-xs sm:text-sm">
                    <span className="text-slate-400">Direct Contact:</span>
                    <a href={`tel:${listing.posted_by_contact}`} className="text-amber-400 font-bold hover:underline whitespace-nowrap">
                      {listing.posted_by_contact}
                    </a>
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="text-xs text-slate-500 space-y-2 pt-4 border-t border-white/8">
                <div className="flex justify-between items-center gap-2">
                  <span>Listing ID:</span>
                  <span className="font-mono text-slate-400 font-semibold">{listing.listing_id}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span>Indexed on:</span>
                  <span className="text-slate-400 font-medium">{formatDate(listing.posted_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Photo Lightbox Modal ── */}
      <AnimatePresence>
        {lightboxOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-20"
            >
              <X className="w-6 h-6" />
            </button>

            <button
              onClick={() => setLightboxIdx((prev) => (prev - 1 + images.length) % images.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-20"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={() => setLightboxIdx((prev) => (prev + 1) % images.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-20"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="max-w-5xl max-h-[85vh] relative flex flex-col items-center">
              <img
                src={images[lightboxIdx]}
                alt=""
                className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
              />
              <p className="text-slate-400 text-xs mt-3">
                Photo {lightboxIdx + 1} of {images.length} · {listing.apartment_name}
              </p>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <ScheduleTourModal
        isOpen={tourModalOpen}
        onClose={() => setTourModalOpen(false)}
        propertyName={listing.apartment_name}
        locality={capitalize(listing.locality)}
        priceFormatted={formatPrice(listing.price)}
      />

      <ContactSellerModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        propertyName={listing.apartment_name}
        sellerName={listing.posted_by_name}
        sellerType={listing.posted_by}
        sellerPhone={listing.posted_by_contact}
        listingId={listing.listing_id}
        priceFormatted={formatPrice(listing.price)}
      />
    </div>
  );
}

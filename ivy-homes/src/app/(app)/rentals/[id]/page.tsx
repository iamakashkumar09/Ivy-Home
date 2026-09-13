'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { rentalsAPI, Rental } from '@/lib/api';
import {
  ArrowLeft, BedDouble, Bath, Maximize2, MapPin, Building,
  User, Calendar, Loader2, Key
} from 'lucide-react';
import {
  formatRent, capitalize, getFurnishingColor, cn,
  getPropertyImages
} from '@/lib/utils';
import { ScheduleTourModal } from '@/components/ScheduleTourModal';
import { ContactSellerModal } from '@/components/ContactSellerModal';

export default function RentalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [rental, setRental] = useState<Rental | null>(null);
  const [loading, setLoading] = useState(true);
  const [tourModalOpen, setTourModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  useEffect(() => {
    rentalsAPI.getById(id).then(setRental).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="text-4xl">🔑</div>
        <h2 className="text-xl font-bold text-white">Rental Property Not Found</h2>
        <button
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-xl bg-teal-400 text-black font-semibold text-xs"
        >
          Back to Rentals
        </button>
      </div>
    );
  }

  const images = getPropertyImages(rental.property_type, rental.listing_id);

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-4 sm:py-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-400 hover:text-white text-xs font-semibold mb-6 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Rentals
      </button>

      {/* Gallery Header */}
      <div className="rounded-3xl overflow-hidden glass border border-white/10 mb-10 relative h-72 sm:h-96">
        <img src={images[0]} alt={rental.apartment_name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <span className="px-3 py-1 rounded-full bg-teal-500/30 backdrop-blur-md text-teal-300 text-xs font-bold border border-teal-400/40 mb-2 inline-block">
            Verified Rental
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white">{rental.title || rental.apartment_name}</h1>
          <p className="text-slate-300 text-xs sm:text-sm flex items-center gap-1.5 mt-1">
            <MapPin className="w-3.5 h-3.5 text-amber-400" /> {capitalize(rental.locality)}, Hyderabad
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-start">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-8 sm:space-y-10">
          {/* Lease Specs */}
          <div className="glass rounded-3xl p-6 sm:p-8 lg:p-10 gradient-border space-y-6">
            <h2 className="text-xs uppercase tracking-widest text-teal-400 font-extrabold">
              Rental Terms & Dimensions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 sm:gap-6">
              {[
                { icon: BedDouble, label: 'Configuration', value: `${rental.bedroom} Bedrooms` },
                { icon: Bath, label: 'Bathrooms', value: `${rental.bathroom} Baths` },
                { icon: Maximize2, label: 'Carpet Area', value: `${rental.carpet_area} sqft` },
                { icon: Building, label: 'Floor Level', value: `Floor ${rental.floor} of ${rental.total_floors}` },
                { icon: Key, label: 'Furnishing', value: capitalize(rental.furnishing) },
                { icon: Calendar, label: 'Availability', value: 'Immediate Move-in' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-white/[0.03] rounded-2xl p-5 sm:p-6 border border-white/8 space-y-1.5 hover:border-teal-400/30 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-teal-400/10 border border-teal-400/20 text-teal-400 flex items-center justify-center mb-3 shadow-md">
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{label}</p>
                  <p className="text-base sm:text-lg font-black text-white tabular-nums break-words">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          {rental.description && (
            <div className="glass rounded-3xl p-6 sm:p-8 lg:p-10 gradient-border space-y-4">
              <h2 className="text-xs uppercase tracking-widest text-teal-400 font-extrabold">Rental Overview & Remarks</h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">{rental.description}</p>
            </div>
          )}
        </div>

        {/* Right Sticky Card */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-6">
            <div className="glass-strong rounded-3xl p-6 sm:p-8 lg:p-9 gradient-border shadow-2xl space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-teal-400 block mb-1">Monthly Rent</span>
                <p className="text-3xl sm:text-4xl font-black text-white tracking-tight tabular-nums break-words">{formatRent(rental.price)}</p>
              </div>

              <div className="space-y-3.5 text-xs sm:text-sm border-y border-white/10 py-5">
                <div className="flex justify-between items-center gap-3 flex-wrap text-slate-400">
                  <span>Security Deposit:</span>
                  <span className="text-white font-extrabold text-base tabular-nums whitespace-nowrap">₹{rental.deposit?.toLocaleString('en-IN') || '1 Month'}</span>
                </div>
                {rental.maintenance > 0 && (
                  <div className="flex justify-between items-center gap-3 flex-wrap text-slate-400">
                    <span>Monthly Maintenance:</span>
                    <span className="text-white font-extrabold tabular-nums whitespace-nowrap">₹{rental.maintenance?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between items-center gap-3 flex-wrap text-slate-400 pt-1">
                  <span>Furnishing:</span>
                  <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap', getFurnishingColor(rental.furnishing))}>
                    {capitalize(rental.furnishing)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setTourModalOpen(true)}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-500 text-black font-extrabold text-sm shadow-xl shadow-teal-500/25 hover:opacity-95 transition-all"
                >
                  Schedule Rental Viewing
                </button>
                <button
                  onClick={() => setContactModalOpen(true)}
                  className="w-full py-4 rounded-2xl glass border border-teal-400/30 text-teal-300 font-bold text-sm hover:bg-teal-400/10 transition-colors"
                >
                  Contact Owner / Agent
                </button>
              </div>

              {/* Listed by */}
              <div className="pt-5 border-t border-white/10 flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-black text-base shadow-md shrink-0">
                  {rental.posted_by_name?.[0] || <User className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-bold text-white truncate">{rental.posted_by_name || 'Property Owner'}</p>
                  <p className="text-xs text-slate-400 capitalize">{rental.posted_by || 'Direct Listing'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ScheduleTourModal
        isOpen={tourModalOpen}
        onClose={() => setTourModalOpen(false)}
        propertyName={rental.title || rental.apartment_name}
        locality={capitalize(rental.locality)}
        priceFormatted={formatRent(rental.price)}
      />

      <ContactSellerModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        propertyName={rental.title || rental.apartment_name}
        sellerName={rental.posted_by_name}
        sellerType={rental.posted_by}
        sellerPhone={rental.posted_by_contact}
        listingId={rental.listing_id}
        priceFormatted={formatRent(rental.price)}
      />
    </div>
  );
}

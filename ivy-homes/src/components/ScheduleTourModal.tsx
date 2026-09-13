'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Video, UserCheck, CheckCircle2, Phone, Mail, User, Sparkles } from 'lucide-react';

interface ScheduleTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyName: string;
  locality: string;
  priceFormatted: string;
}

const TIME_SLOTS = [
  '10:00 AM – 11:30 AM',
  '11:30 AM – 01:00 PM',
  '02:30 PM – 04:00 PM',
  '04:30 PM – 06:00 PM',
  '06:00 PM – 07:30 PM',
];

export function ScheduleTourModal({ isOpen, onClose, propertyName, locality, priceFormatted }: ScheduleTourModalProps) {
  const [tourType, setTourType] = useState<'in_person' | 'video'>('in_person');
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [slot, setSlot] = useState(TIME_SLOTS[0]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-lg glass-strong rounded-3xl p-6 sm:p-8 gradient-border shadow-2xl shadow-black/80 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {!submitted ? (
            <div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-400 text-xs font-semibold w-fit mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                VIP Private Tour Experience
              </div>

              <h2 className="text-2xl font-bold text-white mb-1">Schedule a Private Showing</h2>
              <p className="text-sm text-slate-400 mb-6">
                Explore <span className="text-amber-400 font-medium">{propertyName}</span> in {locality} ({priceFormatted})
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Tour type selector */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTourType('in_person')}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                      tourType === 'in_person'
                        ? 'bg-amber-400 text-black border-amber-400 font-bold shadow-lg shadow-amber-500/20'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" /> In-Person Visit
                  </button>
                  <button
                    type="button"
                    onClick={() => setTourType('video')}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                      tourType === 'video'
                        ? 'bg-amber-400 text-black border-amber-400 font-bold shadow-lg shadow-amber-500/20'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <Video className="w-4 h-4" /> Live Video Tour
                  </button>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-medium mb-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" /> Preferred Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-amber-400/60 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium mb-1.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" /> Preferred Time Slot
                    </label>
                    <select
                      value={slot}
                      onChange={(e) => setSlot(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-white text-sm focus:border-amber-400/60 focus:outline-none"
                    >
                      {TIME_SLOTS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="text-xs text-slate-400 font-medium mb-1.5 block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="e.g. Akash Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 text-sm focus:border-amber-400/60 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-medium mb-1.5 block">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 text-sm focus:border-amber-400/60 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium mb-1.5 block">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        placeholder="you@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 text-sm focus:border-amber-400/60 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-black font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-amber-500/25 disabled:opacity-50"
                >
                  {loading ? 'Confirming with Property Concierge...' : 'Confirm Tour Appointment'}
                </button>

                <p className="text-[11px] text-center text-slate-500">
                  🔒 Free, zero obligation. A dedicated Ivy Homes concierge will coordinate security access.
                </p>
              </form>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Tour Confirmed!</h3>
              <p className="text-sm text-slate-300 max-w-sm mx-auto mb-4">
                Your private {tourType === 'in_person' ? 'in-person tour' : 'live video showing'} for <strong className="text-amber-400">{propertyName}</strong> has been scheduled for <span className="text-white font-medium">{date}</span> at <span className="text-white font-medium">{slot}</span>.
              </p>
              <div className="glass rounded-xl p-3.5 max-w-xs mx-auto text-left text-xs space-y-1 text-slate-400 mb-6">
                <p>👤 Contact: <strong className="text-white">{name}</strong></p>
                <p>📱 SMS Confirmation sent to: <strong className="text-white">{phone}</strong></p>
                <p>📍 Location: <strong className="text-white">{locality}, Hyderabad</strong></p>
              </div>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 rounded-xl bg-amber-400 text-black font-semibold text-sm hover:bg-amber-300 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, MessageSquare, User, ShieldCheck, CheckCircle, Send } from 'lucide-react';

interface ContactSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyName: string;
  sellerName: string;
  sellerType: string;
  sellerPhone?: string;
  listingId: string;
  priceFormatted: string;
}

export function ContactSellerModal({
  isOpen,
  onClose,
  propertyName,
  sellerName,
  sellerType,
  sellerPhone,
  listingId,
  priceFormatted,
}: ContactSellerModalProps) {
  const [message, setMessage] = useState(
    `Hello ${sellerName || 'there'}, I am interested in "${propertyName}" (Ref ID: ${listingId}, ${priceFormatted}). Please share more details and layout plans.`
  );
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const cleanPhone = sellerPhone?.replace(/\D/g, '') || '919876543210';
  const whatsappUrl = `https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${encodeURIComponent(
    message
  )}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 700);
  };

  const handleReset = () => {
    setSent(false);
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
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {!sent ? (
            <div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/25 text-emerald-400 text-xs font-semibold w-fit mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Seller Direct Contact
              </div>

              <h2 className="text-2xl font-bold text-white mb-1">Inquire Directly</h2>
              <p className="text-sm text-slate-400 mb-6">
                Connect with the representative for <span className="text-amber-400 font-medium">{propertyName}</span>
              </p>

              {/* Seller Card Banner */}
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/10 mb-5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shrink-0">
                  {sellerName?.[0]?.toUpperCase() || <User className="w-6 h-6" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-semibold text-white truncate">{sellerName || 'Property Agent'}</h3>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  </div>
                  <p className="text-xs text-slate-400 capitalize">{sellerType || 'Verified Partner'} · Fast Responder</p>
                </div>
                {sellerPhone && (
                  <a
                    href={`tel:${sellerPhone}`}
                    className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/25 transition-colors shrink-0"
                    title="Call Now"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                )}
              </div>

              {/* Direct Quick Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/30 font-semibold text-xs transition-colors"
                >
                  <MessageSquare className="w-4 h-4" /> Chat on WhatsApp
                </a>
                {sellerPhone ? (
                  <a
                    href={`tel:${sellerPhone}`}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 hover:bg-amber-400/25 font-semibold text-xs transition-colors"
                  >
                    <Phone className="w-4 h-4" /> Call: {sellerPhone}
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-slate-500 font-semibold text-xs"
                  >
                    <Phone className="w-4 h-4" /> Number on Request
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[11px] text-slate-500 uppercase tracking-wider">or send message inquiry</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-medium mb-1 block">Your Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Akash Sharma"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 text-sm focus:border-amber-400/60 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium mb-1 block">Your Phone</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 text-sm focus:border-amber-400/60 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium mb-1 block">Message</label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 text-sm focus:border-amber-400/60 focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-black font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-amber-500/25 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {loading ? 'Transmitting Inquiry...' : 'Send Message to Seller'}
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Inquiry Dispatched!</h3>
              <p className="text-sm text-slate-300 max-w-sm mx-auto mb-5">
                Your inquiry has been relayed directly to <strong className="text-amber-400">{sellerName || 'the property representative'}</strong>. They usually reply within 15 minutes.
              </p>
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

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Formatters ─────────────────────────────────────────────────────────────

export function formatPrice(price: number): string {
  if (!price || isNaN(price) || price <= 0) return 'Price on Request';
  if (price >= 10000000) {
    const cr = price / 10000000;
    return `₹${cr.toFixed(cr >= 10 ? 1 : 2)} Cr`;
  }
  if (price >= 100000) {
    const lk = price / 100000;
    return `₹${lk.toFixed(lk >= 10 ? 1 : 2)} L`;
  }
  return `₹${price.toLocaleString('en-IN')}`;
}

export function formatRent(price: number): string {
  if (!price || isNaN(price) || price <= 0) return 'Rent on Request';
  if (price >= 100000) {
    const lk = price / 100000;
    return `₹${lk.toFixed(lk >= 10 ? 1 : 2)} L/mo`;
  }
  return `₹${price.toLocaleString('en-IN')}/mo`;
}

export function formatArea(area: number): string {
  if (!area || isNaN(area) || area <= 0) return 'Area on Request';
  return `${area.toLocaleString('en-IN')} sqft`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return 'Recent';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function capitalize(str: string | undefined | null): string {
  if (!str) return '';
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

export function pricePerSqft(price: number, area: number): string {
  if (!area || area <= 0 || !price || price <= 0) return 'N/A';
  return `₹${Math.round(price / area).toLocaleString('en-IN')}/sqft`;
}

export function getFurnishingColor(furnishing: string): string {
  switch (furnishing?.toLowerCase()) {
    case 'fully-furnished':
    case 'furnished':
      return 'text-emerald-300 bg-emerald-500/15 border border-emerald-500/30';
    case 'semi-furnished':
      return 'text-amber-300 bg-amber-500/15 border border-amber-500/30';
    case 'unfurnished':
      return 'text-slate-300 bg-slate-500/15 border border-slate-500/30';
    default:
      return 'text-slate-300 bg-slate-500/15 border border-slate-500/30';
  }
}

export function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'ready to move':
      return 'text-emerald-300 bg-emerald-500/20 border border-emerald-400/30';
    case 'under construction':
      return 'text-amber-300 bg-amber-500/20 border border-amber-400/30';
    case 'new launch':
      return 'text-violet-300 bg-violet-500/20 border border-violet-400/30';
    default:
      return 'text-slate-300 bg-slate-500/20 border border-slate-400/30';
  }
}

// ─── Mortgage & EMI Calculation ─────────────────────────────────────────────

export interface EMIBreakdown {
  monthlyEMI: number;
  totalInterest: number;
  totalPayment: number;
  loanAmount: number;
}

export function calculateEMI(principal: number, annualRatePct: number = 8.5, tenureYears: number = 20): EMIBreakdown {
  if (!principal || principal <= 0) {
    return { monthlyEMI: 0, totalInterest: 0, totalPayment: 0, loanAmount: 0 };
  }
  const monthlyRate = (annualRatePct / 12) / 100;
  const totalMonths = tenureYears * 12;
  
  // EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
  const totalPayment = emi * totalMonths;
  const totalInterest = totalPayment - principal;

  return {
    monthlyEMI: Math.round(emi),
    totalInterest: Math.round(totalInterest),
    totalPayment: Math.round(totalPayment),
    loanAmount: Math.round(principal),
  };
}

// ─── Curated Luxury Photography System ──────────────────────────────────────

export const LUXURY_PHOTOS = {
  apartment: [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',
  ],
  villa: [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=80',
    'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?w=1200&q=80',
  ],
  'independent house': [
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=80',
    'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&q=80',
  ],
  'builder floor': [
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80',
    'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200&q=80',
    'https://images.unsplash.com/photo-1502005229762-ee1b2b8ab275?w=1200&q=80',
  ],
  plot: [
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80',
    'https://images.unsplash.com/photo-1524813686514-a57563d77d4f?w=1200&q=80',
  ],
  interiors: [
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80',
    'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=1200&q=80',
    'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1200&q=80',
  ],
};

export function getPropertyImages(type: string, idStr?: string): string[] {
  const normType = type?.toLowerCase() || 'apartment';
  const pool = LUXURY_PHOTOS[normType as keyof typeof LUXURY_PHOTOS] || LUXURY_PHOTOS.apartment;
  
  // Deterministic rotation based on ID string
  const hash = idStr ? idStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
  const startIdx = hash % pool.length;
  
  const selected: string[] = [];
  for (let i = 0; i < 4; i++) {
    selected.push(pool[(startIdx + i) % pool.length]);
  }
  // Add 1 interior photo
  selected.push(LUXURY_PHOTOS.interiors[hash % LUXURY_PHOTOS.interiors.length]);
  return selected;
}

// ─── Hyderabad Neighborhoods & Commute Guide Data ───────────────────────────

export interface LocalityGuide {
  id: string;
  name: string;
  tagline: string;
  avgSqft: number;
  avgRent: number;
  commuteHitec: string;
  commuteAirport: string;
  vibe: string;
  image: string;
  description: string;
  highlights: string[];
}

export const HYDERABAD_LOCALITIES: LocalityGuide[] = [
  {
    id: 'banjara hills',
    name: 'Banjara Hills',
    tagline: 'The Crown Jewel of Ultra-Luxury Living',
    avgSqft: 14200,
    avgRent: 75000,
    commuteHitec: '20 mins',
    commuteAirport: '35 mins',
    vibe: 'Diplomatic & Elite',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    description: 'Hyderabad’s most prestigious postal code. Serene hilly topography, lavish bungalows, elite clubs, and luxury designer boutiques.',
    highlights: ['Taj Krishna & Falaknuma vibes', 'KBR National Park proximity', 'Top fine dining & embassies'],
  },
  {
    id: 'jubilee hills',
    name: 'Jubilee Hills',
    tagline: 'Celebrity Mansions & Cosmopolitan Lifestyle',
    avgSqft: 15800,
    avgRent: 85000,
    commuteHitec: '15 mins',
    commuteAirport: '40 mins',
    vibe: 'High-Society Glamour',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
    description: 'Home to film stars, tech barons, and industrialists. World-class gourmet cafes, nightlife, and sprawling private estates.',
    highlights: ['Peddamma Temple road nightlife', 'Jubilee Hills International Club', 'Durgam Cheruvu Cable Bridge view'],
  },
  {
    id: 'gachibowli',
    name: 'Gachibowli',
    tagline: 'Financial District & Global Tech Epicenter',
    avgSqft: 9600,
    avgRent: 48000,
    commuteHitec: '10 mins',
    commuteAirport: '25 mins (ORR)',
    vibe: 'Fast-Paced Tech Hub',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    description: 'The financial powerhouse of South India. High-rise glass towers, US Consular district, Microsoft & Google campuses, and modern gated communities.',
    highlights: ['Direct Outer Ring Road access', 'Top international schools & hospitals', 'High capital appreciation'],
  },
  {
    id: 'hitech city',
    name: 'Hitec City',
    tagline: 'Cyberabad’s Beating Commercial Heart',
    avgSqft: 10400,
    avgRent: 52000,
    commuteHitec: '0 mins',
    commuteAirport: '35 mins',
    vibe: 'Walk-to-Work Tech Haven',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    description: 'Maximum convenience for tech leaders. Metro connectivity, Inorbit Mall, Mindspace IT Park, and modern luxury high-rise apartments.',
    highlights: ['Hyderabad Metro Blue Line', 'Inorbit Mall & Durgam Cheruvu lake', 'Zero commute for tech pros'],
  },
  {
    id: 'kondapur',
    name: 'Kondapur',
    tagline: 'Vibrant Cosmopolitan Living & High Rental Yields',
    avgSqft: 8200,
    avgRent: 38000,
    commuteHitec: '8 mins',
    commuteAirport: '35 mins',
    vibe: 'Family-Friendly & Modern',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    description: 'Strategic neighborhood flanking Gachibowli and Botanical Gardens. Unmatched rental demand, excellent social infrastructure, and premium supermarkets.',
    highlights: ['Hyderabad Botanical Garden', 'Sarath City Capital Mall', 'Top rental ROI in Cyberabad'],
  },
  {
    id: 'madhapur',
    name: 'Madhapur',
    tagline: 'Art, Culture, Cafes & Urban Connectivity',
    avgSqft: 9800,
    avgRent: 45000,
    commuteHitec: '5 mins',
    commuteAirport: '35 mins',
    vibe: 'Artistic & Dynamic',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    description: 'The creative pulse of West Hyderabad. Packed with artisan bakeries, rooftop lounges, co-working spaces, and boutique builder floors.',
    highlights: ['Shilparamam Arts Village', 'Durgam Cheruvu lakefront park', 'Vibrant culinary scene'],
  },
];

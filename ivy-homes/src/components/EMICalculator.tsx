'use client';

import { useState, useMemo } from 'react';
import { calculateEMI, formatPrice } from '@/lib/utils';
import { Calculator, ShieldCheck } from 'lucide-react';

interface EMICalculatorProps {
  initialPrice?: number;
  compact?: boolean;
}

export function EMICalculator({ initialPrice = 12500000, compact = false }: EMICalculatorProps) {
  const safeInitialPrice = initialPrice > 0 ? initialPrice : 12500000;
  const [price, setPrice] = useState(safeInitialPrice);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);

  const downPaymentAmount = useMemo(() => Math.round((price * downPaymentPct) / 100), [price, downPaymentPct]);
  const loanPrincipal = useMemo(() => price - downPaymentAmount, [price, downPaymentAmount]);

  const emiData = useMemo(() => {
    return calculateEMI(loanPrincipal, interestRate, tenureYears);
  }, [loanPrincipal, interestRate, tenureYears]);

  const principalPct = useMemo(() => {
    if (!emiData.totalPayment) return 70;
    return Math.min(Math.max(Math.round((loanPrincipal / emiData.totalPayment) * 100), 10), 90);
  }, [loanPrincipal, emiData]);

  return (
    <div className={`glass rounded-3xl ${compact ? 'p-6' : 'p-6 sm:p-8 lg:p-10'} gradient-border`}>
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 shadow-md">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white">Mortgage & EMI Estimator</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Instant loan repayment & interest breakdown for this property</p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-semibold">
          <ShieldCheck className="w-4 h-4" /> Major Banks Supported
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Sliders Area */}
        <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
            {/* Property Price */}
          <div className="space-y-2">
            <div className="flex justify-between items-center gap-3 flex-wrap text-xs sm:text-sm font-semibold">
              <span className="text-slate-300">Property Value</span>
              <span className="text-white font-extrabold text-base tabular-nums whitespace-nowrap">{formatPrice(price)}</span>
            </div>
            <input
              type="range"
              min={2000000}
              max={100000000}
              step={500000}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          {/* Down Payment */}
          <div className="space-y-2">
            <div className="flex justify-between items-center gap-3 flex-wrap text-xs sm:text-sm font-semibold">
              <span className="text-slate-300">Down Payment ({downPaymentPct}%)</span>
              <span className="text-amber-400 font-extrabold text-base tabular-nums whitespace-nowrap">{formatPrice(downPaymentAmount)}</span>
            </div>
            <input
              type="range"
              min={10}
              max={80}
              step={5}
              value={downPaymentPct}
              onChange={(e) => setDownPaymentPct(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          {/* Interest & Tenure */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
            <div className="space-y-2">
              <div className="flex justify-between items-center gap-3 flex-wrap text-xs sm:text-sm font-semibold">
                <span className="text-slate-300">Interest Rate</span>
                <span className="text-white font-extrabold tabular-nums whitespace-nowrap">{interestRate}% p.a.</span>
              </div>
              <input
                type="range"
                min={7.5}
                max={14}
                step={0.1}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center gap-3 flex-wrap text-xs sm:text-sm font-semibold">
                <span className="text-slate-300">Loan Tenure</span>
                <span className="text-white font-extrabold tabular-nums whitespace-nowrap">{tenureYears} Years</span>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                step={1}
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Result KPI Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-amber-400/10 via-white/[0.03] to-[#0A0F24] rounded-3xl p-6 sm:p-7 border border-amber-400/30 flex flex-col justify-between shadow-xl">
          <div>
            <span className="text-xs uppercase tracking-widest text-amber-400 font-extrabold block">Monthly Installment</span>
            <div className="flex items-baseline gap-2 flex-wrap mt-1 mb-1">
              <span className="text-2xl sm:text-3xl xl:text-4xl font-black text-white tabular-nums tracking-tight break-words">
                ₹{emiData.monthlyEMI.toLocaleString('en-IN')}
              </span>
              <span className="text-xs sm:text-sm font-normal text-slate-400 whitespace-nowrap">/ month</span>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              Estimated repayment across {tenureYears} years ({tenureYears * 12} EMIs)
            </p>

            {/* Visual ratio bar */}
            <div className="space-y-2 mb-6">
              <div className="h-3 w-full bg-violet-600/50 rounded-full overflow-hidden flex">
                <div style={{ width: `${principalPct}%` }} className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300" />
              </div>
              <div className="flex justify-between text-xs text-slate-300 font-medium">
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" /> Principal ({principalPct}%)
                </span>
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-500 shrink-0" /> Interest ({100 - principalPct}%)
                </span>
              </div>
            </div>

            <div className="space-y-3 border-t border-white/10 pt-4 text-xs sm:text-sm">
              <div className="flex justify-between items-center gap-3 flex-wrap">
                <span className="text-slate-400 font-medium">Loan Principal:</span>
                <span className="text-white font-extrabold tabular-nums whitespace-nowrap">{formatPrice(loanPrincipal)}</span>
              </div>
              <div className="flex justify-between items-center gap-3 flex-wrap">
                <span className="text-slate-400 font-medium">Total Interest:</span>
                <span className="text-amber-400 font-extrabold tabular-nums whitespace-nowrap">{formatPrice(emiData.totalInterest)}</span>
              </div>
              <div className="flex justify-between items-center gap-3 flex-wrap pt-1 border-t border-white/8">
                <span className="text-slate-300 font-semibold">Total Repayable:</span>
                <span className="text-white font-black text-base tabular-nums whitespace-nowrap">{formatPrice(emiData.totalPayment)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

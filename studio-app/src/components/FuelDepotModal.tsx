/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { playSound } from '../utils/audio.js';

interface FuelDepotModalProps {
  isOpen: boolean;
  onClose: () => void;
  aiFuel: { aiTokens: number; maxTokens: number };
  isMuted: boolean;
  isRefueling: boolean;
  onRefuel: (amount: number) => void;
}

export const FuelDepotModal: React.FC<FuelDepotModalProps> = ({
  isOpen,
  onClose,
  aiFuel,
  isMuted,
  isRefueling,
  onRefuel
}) => {
  const handleRefuelAction = (type: 'cash' | 'venmo') => {
    if (type === 'cash') {
      window.open('https://cash.app/$XopherDeeP', '_blank', 'noopener,noreferrer');
    } else {
      window.open('https://venmo.com/u/xopherdeep', '_blank', 'noopener,noreferrer');
    }
    onRefuel(5000);
  };

  const fuelPercentage = Math.min(100, (aiFuel.aiTokens / aiFuel.maxTokens) * 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-[#006094]/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="bg-[#FFFCEF] rounded-[32px] border-4 border-[#FFEAA7] max-w-md w-full p-6 shadow-2xl relative text-[#4A4A4A]"
          >
            <div className="absolute right-4 top-4 opacity-10 text-8xl pointer-events-none select-none">⛽</div>
            
            <div className="flex items-center justify-between border-b border-amber-200/50 pb-3.5 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⛽</span>
                <div>
                  <h3 className="font-display font-black text-sm text-amber-800 uppercase tracking-tight">AI Aviation Fuel Depot</h3>
                  <span className="text-[8px] font-mono font-black text-amber-600 block uppercase tracking-widest">DAL Community Power Station</span>
                </div>
              </div>
              <button
                onClick={() => { playSound('beep', isMuted); onClose(); }}
                className="p-1.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-800 transition-colors cursor-pointer border-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="leading-relaxed font-semibold text-slate-600">
                Welcome to Orville and Wilbur's AI Aviation Fuel Depot! Our premium seaplane AI algorithms require high-grade jet fuel to calculate flight paths and process passenger reviews.
              </p>

              <div className="bg-white/80 p-3.5 rounded-2xl border border-amber-200/40 space-y-2">
                <span className="block text-[8px] font-mono font-black text-amber-700 uppercase tracking-wider">FUEL DRAIN CONSUMPTION METRICS</span>
                <div className="grid grid-cols-2 gap-3 text-[10px]">
                  <div className="flex items-center gap-2 bg-sky-50/50 p-2 rounded-xl border border-sky-100">
                    <span className="text-base">📝</span>
                    <div>
                      <p className="font-black text-slate-700">AI Travel Review</p>
                      <p className="font-mono text-amber-700 font-bold">-300 GAL / review</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-teal-50/50 p-2 rounded-xl border border-teal-100">
                    <span className="text-base">💬</span>
                    <div>
                      <p className="font-black text-slate-700">Radio Chatter Bot</p>
                      <p className="font-mono text-amber-700 font-bold">-150 GAL / reply</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fuel Progress Bar */}
              <div className="bg-white p-4.5 rounded-2xl border-2 border-[#FFEAA7] shadow-inner space-y-3">
                <div className="flex justify-between items-end font-mono">
                  <span className="text-[9px] font-black text-[#85806B] uppercase tracking-wider">CURRENT FUEL IN STORAGE TANK:</span>
                  <span className="text-xs font-black text-[#0084CC]">
                    {aiFuel.aiTokens.toLocaleString()} / {aiFuel.maxTokens.toLocaleString()} GAL
                  </span>
                </div>

                <div className="w-full h-5 bg-[#E6DFC7]/40 rounded-full overflow-hidden border border-[#E6DFC7] relative">
                  <motion.div
                    className={`h-full transition-all duration-500 relative ${
                      (aiFuel.aiTokens / aiFuel.maxTokens) < 0.2
                        ? 'bg-gradient-to-r from-red-500 to-orange-500'
                        : (aiFuel.aiTokens / aiFuel.maxTokens) < 0.5
                        ? 'bg-gradient-to-r from-amber-500 to-[#FFCC00]'
                        : 'bg-gradient-to-r from-emerald-500 to-[#00D632]'
                    }`}
                    style={{ width: `${fuelPercentage}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </motion.div>
                  <div className="absolute top-0 bottom-0 left-1/4 w-0.5 bg-[#4A4A4A]/10" />
                  <div className="absolute top-0 bottom-0 left-2/4 w-0.5 bg-[#4A4A4A]/10" />
                  <div className="absolute top-0 bottom-0 left-3/4 w-0.5 bg-[#4A4A4A]/10" />
                </div>

                <p className="text-[9.5px] text-slate-500 font-semibold text-center italic">
                  When the tank is completely dry, our AI-powered travel reviews and radio chatter bots will temporarily pause until refueled.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-[8.5px] font-mono font-black text-amber-700 uppercase tracking-wider text-center">
                  ⚡ CHOOSE A REFUEL METHOD TO INSTANTLY PUMP +5,000 GALLONS
                </label>
                <div className="grid grid-cols-2 gap-3.5">
                  <button
                    onClick={() => handleRefuelAction('cash')}
                    disabled={isRefueling}
                    className="bg-[#00D632] hover:bg-[#00b029] active:scale-[0.98] disabled:opacity-50 text-white font-display font-black text-[11px] py-2.5 px-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 uppercase cursor-pointer border-none font-bold"
                  >
                    💸 CashApp Refuel
                  </button>
                  <button
                    onClick={() => handleRefuelAction('venmo')}
                    disabled={isRefueling}
                    className="bg-[#008CFF] hover:bg-[#0070cc] active:scale-[0.98] disabled:opacity-50 text-white font-display font-black text-[11px] py-2.5 px-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 uppercase cursor-pointer border-none font-bold"
                  >
                    💙 Venmo Refuel
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

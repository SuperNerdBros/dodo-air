/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { Passport } from '../types.js';
import { playSound } from '../utils/audio.js';
import { PASSPORT_COLORS, PLANE_COLORS } from '../utils/constants.js';

interface PassportBadgeDropdownProps {
  passport: Passport;
  showPassportDrawer: boolean;
  setShowPassportDrawer: (show: boolean) => void;
  isMuted: boolean;
  setShowMilesModal: (show: boolean) => void;
  setIsEditingPassport: (edit: boolean) => void;
}

export const PassportBadgeDropdown: React.FC<PassportBadgeDropdownProps> = ({
  passport,
  showPassportDrawer,
  setShowPassportDrawer,
  isMuted,
  setShowMilesModal,
  setIsEditingPassport
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (showPassportDrawer && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowPassportDrawer(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showPassportDrawer, setShowPassportDrawer]);

  const activeColor = PASSPORT_COLORS[passport.colorIndex || 0] || PASSPORT_COLORS[1];
  const activePlaneColor = PLANE_COLORS.find(pc => pc.id === (passport.planeColor || 'orange')) || PLANE_COLORS[0];

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => {
          playSound('beep', isMuted);
          setShowPassportDrawer(!showPassportDrawer);
        }}
        className="flex items-center gap-2.5 bg-gradient-to-r from-[#FFFCEF] to-[#FFF9E7] hover:from-[#FFF9E7] hover:to-[#FFEAA7]/30 border-2 border-[#FFCC00] hover:border-[#FF9F43] px-3.5 py-1.5 rounded-2xl text-xs font-bold shadow-md transition-all text-[#85806B] active:scale-98 w-full sm:w-auto cursor-pointer"
      >
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-lg shadow-inner ${activeColor.bg}`}>
          {passport.avatarIcon}
        </div>
        <div className="text-left leading-tight">
          <span className="text-[7px] font-mono font-black text-[#FF9F43] uppercase block tracking-wider">FLYER PASSPORT</span>
          <span className="text-[#0084CC] font-black text-[11px] block">{passport.villagerName}</span>
        </div>
        <ChevronRight className={`w-3.5 h-3.5 text-[#FF9F43] transition-transform ml-auto sm:ml-1 ${showPassportDrawer ? 'rotate-90' : ''}`} />
      </button>

      <AnimatePresence>
        {showPassportDrawer && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 bg-[#FAF8F2] rounded-[32px] border-4 border-[#E6DFC7] shadow-2xl p-4 w-72 z-50 text-[#4A4A4A]"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#E6DFC7] pb-1.5 text-[9px] font-mono font-bold text-[#85806B]">
                <span>📖 DODO AIRLINES PASSPORT</span>
                <span className="text-green-700 bg-green-100 px-1.5 py-0.2 rounded-full uppercase tracking-tighter text-[7.5px]">VERIFIED</span>
              </div>

              <div className="flex gap-3">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${activeColor.bg}`}>
                  {passport.avatarIcon}
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="text-[7.5px] font-mono text-[#85806B] uppercase leading-none">PASSENGER</p>
                  <p className="font-display font-black text-sm leading-none text-[#4A4A4A] truncate">{passport.villagerName}</p>
                  <p className="text-[7.5px] font-mono text-[#85806B] uppercase leading-none mt-1">ISLAND</p>
                  <p className="text-[11px] font-bold text-[#0084CC] leading-none truncate">🏝️ {passport.islandName}</p>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <span className="block text-[7.5px] font-mono text-[#85806B] uppercase leading-none">PASSPORT TITLE</span>
                <span className="inline-block bg-[#F5F2E6] border border-[#E6DFC7] rounded px-1.5 py-0.5 text-[9px] font-mono font-bold text-[#80765A] uppercase truncate max-w-full">
                  {passport.titlePart1} {passport.titlePart2}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <span className="block text-[7.5px] font-mono text-[#85806B] uppercase leading-none">FRIEND CODE</span>
                <span className="font-mono font-bold text-slate-600 text-[10px]">{passport.friendCode}</span>
              </div>

              {/* Registered Island Plane details */}
              <div className="flex items-center gap-2 bg-sky-50/50 border border-[#0084CC]/15 p-2 rounded-xl text-[10.5px]">
                <span className="text-lg">✈️</span>
                <div className="flex-1 min-w-0">
                  <span className="block text-[7px] font-mono text-slate-400 uppercase leading-none mb-0.5">REGISTERED SEAPLANE</span>
                  <span className="font-bold text-slate-700 block truncate">
                    {passport.planeType === 'Switch 2' ? 'Switch 2 Model' : 'Switch Model'} ({passport.planeType === 'Switch 2' ? '12' : '8'} Seats)
                  </span>
                  <span className="text-[8px] font-mono font-bold uppercase block leading-none mt-0.5" style={{ color: activePlaneColor.hex }}>
                    ● {activePlaneColor.name}
                  </span>
                </div>
              </div>

              {passport.signature && (
                <div className="bg-white/60 border border-[#E6DFC7]/50 p-2 rounded-xl text-[10px] italic text-slate-500">
                  "{passport.signature}"
                </div>
              )}

              {/* Dodo Miles Balance Widget */}
              <div className="flex items-center justify-between bg-amber-50 border border-amber-200/50 rounded-2xl p-2.5 text-xs font-bold text-[#80765A]">
                <span className="flex items-center gap-1.5 text-[#FF9F43] font-mono text-[9px] font-black uppercase">
                  🎟️ Dodo Miles:
                </span>
                <span className="font-mono text-amber-700 text-sm font-black">
                  {(passport.miles ?? 2000).toLocaleString()}
                </span>
              </div>

              {/* Dodo Miles App Stamp Button */}
              <button
                onClick={() => {
                  playSound('beep', isMuted);
                  setShowMilesModal(true);
                  setShowPassportDrawer(false);
                }}
                className="w-full bg-[#FF9F43] hover:bg-[#ff8f24] text-white py-1.5 rounded-xl font-display font-black text-[10px] uppercase shadow border-b-2 border-[#cc7a1f] flex items-center justify-center gap-1 cursor-pointer font-bold"
              >
                🎯 Open Stamp Book
              </button>

              <button
                onClick={() => {
                  playSound('beep', isMuted);
                  setIsEditingPassport(true);
                  setShowPassportDrawer(false);
                }}
                className="w-full bg-[#0084CC] hover:bg-[#006094] text-white py-1.5 rounded-xl font-display font-black text-[10px] uppercase shadow border-b-2 border-[#006094] cursor-pointer font-bold"
              >
                ✏️ Edit My Passport
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

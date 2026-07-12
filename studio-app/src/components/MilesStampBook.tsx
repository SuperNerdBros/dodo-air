/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Passport } from '../types.js';
import { playSound } from '../utils/audio.js';
import { STAMP_CHALLENGES } from '../utils/constants.js';

interface MilesStampBookProps {
  isOpen: boolean;
  onClose: () => void;
  passport: Passport;
  onClaimStamp: (stampId: string, miles: number) => void;
  isMuted: boolean;
}

export const MilesStampBook: React.FC<MilesStampBookProps> = ({
  isOpen,
  onClose,
  passport,
  onClaimStamp,
  isMuted
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-[#006094]/40 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="bg-[#FFFCEF] rounded-[36px] border-4 border-[#FFCC00] max-w-2xl w-full p-6 shadow-2xl relative text-[#4A4A4A] my-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-[#E6DFC7] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-[#FFCC00] rounded-full flex items-center justify-center text-xl shadow-xs">
                  🎟️
                </div>
                <div>
                  <h3 className="font-display font-black text-base text-[#0084CC] uppercase leading-none">Dodo Miles+</h3>
                  <span className="text-[8.5px] font-mono font-bold text-slate-400 block uppercase tracking-wider mt-0.5">MILITARY-GRADE COZY STAMP CHARTER</span>
                </div>
              </div>
              <button
                onClick={() => { playSound('beep', isMuted); onClose(); }}
                className="p-1 rounded-full bg-[#FAF8F2] border border-[#E6DFC7] text-slate-400 hover:bg-slate-100 cursor-pointer border-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Balance Widget */}
            <div className="bg-[#FAF8F2] border-2 border-[#E6DFC7] rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
              <div className="text-left">
                <span className="text-[9px] font-mono font-black text-[#85806B] uppercase tracking-wider block font-bold">CURRENT MILES BALANCE</span>
                <span className="text-3xl font-mono font-black text-[#FF9F43] tracking-wider leading-none mt-1 block font-black">
                  {(passport.miles ?? 2000).toLocaleString()} <span className="text-xs font-sans text-slate-400 font-bold uppercase">Miles</span>
                </span>
              </div>
              <div className="text-right text-[10px] text-slate-400 font-mono italic max-w-xs leading-normal">
                "Gather Dodo Miles by completing airport milestones! Redeem them for safe flight passage or premium pilot credentials."
              </div>
            </div>

            {/* Stamps grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[380px] overflow-y-auto pr-1">
              {STAMP_CHALLENGES.map((challenge) => {
                let isAchieved = false;
                if (challenge.id === 'create') isAchieved = passport.hasCreated;
                else if (challenge.id === 'board') isAchieved = !!passport.hasBoarded;
                else if (challenge.id === 'host') isAchieved = !!passport.hasHosted;
                else if (challenge.id === 'chat') isAchieved = !!passport.hasChatted;
                else if (challenge.id === 'custom') isAchieved = !!passport.hasCustomized;
                else if (challenge.id === 'standby') isAchieved = !!passport.hasRequested;

                const isClaimed = passport.claimedStampIds?.includes(challenge.id);

                return (
                  <div
                    key={challenge.id}
                    className={`p-3.5 rounded-3xl border-2 relative overflow-hidden flex items-start gap-3 transition-all ${
                      isClaimed
                        ? 'bg-white border-[#E6DFC7]/40 opacity-75'
                        : isAchieved
                        ? 'bg-amber-50/50 border-[#FFCC00] shadow-sm'
                        : 'bg-[#FDFBF7] border-slate-200/60'
                    }`}
                  >
                    {/* Stamp Circle */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xl border-2 border-dashed ${
                        isClaimed
                          ? 'bg-red-50 border-red-200'
                          : isAchieved
                          ? 'bg-amber-100/60 border-[#FFCC00]'
                          : 'bg-slate-50 border-slate-200'
                      }`}>
                        {challenge.icon}
                      </div>

                      {/* Stamp overlay if claimed */}
                      {isClaimed && (
                        <div className="absolute -inset-1 rounded-full bg-red-600/10 border-2 border-red-600 flex items-center justify-center transform rotate-12 select-none pointer-events-none scale-105">
                          <span className="text-[7.5px] font-display font-black text-red-600 tracking-tighter uppercase leading-none font-bold">OK!</span>
                        </div>
                      )}
                    </div>

                    {/* Info and button */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-display font-black text-xs text-slate-700 truncate leading-none font-bold">{challenge.title}</span>
                        <span className="font-mono text-[9px] text-[#FF9F43] font-black shrink-0 font-bold">+{challenge.miles}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 leading-normal font-sans font-semibold">{challenge.desc}</p>
                      
                      {/* Interactive state buttons */}
                      <div className="mt-2.5">
                        {isClaimed ? (
                          <span className="text-[8.5px] font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                            🏆 STAMPED & CLAIMED
                          </span>
                        ) : isAchieved ? (
                          <button
                            onClick={() => onClaimStamp(challenge.id, challenge.miles)}
                            className="bg-red-500 hover:bg-red-600 text-white font-mono font-black text-[9px] px-2.5 py-1 rounded-full shadow-xs uppercase tracking-wider animate-pulse transition-all active:scale-95 cursor-pointer font-bold border-none"
                          >
                            🎁 CLAIM {challenge.miles} MILES
                          </button>
                        ) : (
                          <span className="text-[8.5px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase">
                            🔒 Goal: {challenge.condition}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

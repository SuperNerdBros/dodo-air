/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Passport } from '../types.js';
import { playSound } from '../utils/audio.js';
import {
  TITLE_PART_1,
  TITLE_PART_2,
  AVATAR_ICONS,
  PLANE_COLORS,
  generateRandomFriendCode
} from '../utils/constants.js';

interface OnboardingOverlayProps {
  onSavePassport: (p: Passport) => void;
  isMuted: boolean;
}

export const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({
  onSavePassport,
  isMuted
}) => {
  const [passportForm, setPassportForm] = useState<Passport>({
    villagerName: '',
    islandName: '',
    titlePart1: 'Freshly Picked',
    titlePart2: 'Islander',
    friendCode: generateRandomFriendCode(),
    avatarIcon: '🦤',
    signature: 'Wings up, skies clear!',
    hasCreated: false,
    colorIndex: 1,
    miles: 2000,
    claimedStampIds: [],
    hasBoarded: false,
    hasHosted: false,
    hasChatted: false,
    hasCustomized: false,
    hasRequested: false,
    planeType: 'Switch',
    planeColor: 'orange'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passportForm.villagerName.trim() || !passportForm.islandName.trim()) return;

    let finalFriendCode = passportForm.friendCode.trim();
    if (!finalFriendCode || finalFriendCode === 'SW-XXXX-XXXX-XXXX' || finalFriendCode === 'SW-') {
      finalFriendCode = generateRandomFriendCode();
    }

    const updated: Passport = {
      ...passportForm,
      friendCode: finalFriendCode,
      hasCreated: true,
      hasCustomized: true
    };
    onSavePassport(updated);
  };

  const handleBrowseAsGuest = () => {
    playSound('beep', isMuted);
    const guestPassport: Passport = {
      villagerName: 'Guest Flyer',
      islandName: 'Nook Island',
      titlePart1: 'Cozy',
      titlePart2: 'Traveler',
      friendCode: generateRandomFriendCode(),
      avatarIcon: '🦤',
      signature: 'Wings up, skies clear!',
      hasCreated: true,
      colorIndex: 1,
      miles: 2000,
      claimedStampIds: [],
      hasBoarded: false,
      hasHosted: false,
      hasChatted: false,
      hasCustomized: false,
      hasRequested: false,
      planeType: 'Switch',
      planeColor: 'orange'
    };
    onSavePassport(guestPassport);
  };

  return (
    <div className="fixed inset-0 bg-[#006094]/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[36px] border-4 border-[#0084CC] max-w-lg w-full p-6 shadow-2xl relative"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-[#FFF9E7] rounded-full border-2 border-[#0084CC] flex items-center justify-center text-4xl mx-auto shadow-inner">
            🦤
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#0084CC]">Dodo Airlines Front Desk</h2>
            <p className="text-xs text-[#4A4A4A]/70 font-mono mt-1 uppercase tracking-widest font-bold">
              PRINT YOUR FREQUENT FLYER PASSPORT
            </p>
          </div>

          <div className="bg-[#FFFCEF] border border-[#E6DFC7] p-3 rounded-2xl text-left flex gap-3">
            <span className="text-2xl">🗣️</span>
            <p className="text-xs text-[#4A4A4A] leading-relaxed">
              <strong>Orville:</strong> "Right-o! Welcome to Dodo Airlines. Before we can issue boarding passes or clear your seaplane for flight, let's print your official island passport! It'll take just 10 seconds!"
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-left text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-mono font-black text-[#0084CC] mb-1 uppercase">VILLAGER NAME</label>
                <input
                  type="text"
                  value={passportForm.villagerName}
                  onChange={(e) => setPassportForm({ ...passportForm, villagerName: e.target.value })}
                  placeholder="e.g. Raymond"
                  className="w-full bg-[#FAF8F2] border border-[#E6DFC7] rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#0084CC] focus:bg-white"
                  maxLength={12}
                  required
                />
              </div>
              <div>
                <label className="block text-[9px] font-mono font-black text-[#0084CC] mb-1 uppercase">HOME ISLAND</label>
                <input
                  type="text"
                  value={passportForm.islandName}
                  onChange={(e) => setPassportForm({ ...passportForm, islandName: e.target.value })}
                  placeholder="e.g. Peaches Cove"
                  className="w-full bg-[#FAF8F2] border border-[#E6DFC7] rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#0084CC] focus:bg-white"
                  maxLength={14}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-mono font-black text-[#0084CC] mb-1 uppercase">TITLE PREFIX</label>
                <select
                  value={passportForm.titlePart1}
                  onChange={(e) => setPassportForm({ ...passportForm, titlePart1: e.target.value })}
                  className="w-full bg-[#FAF8F2] border border-[#E6DFC7] rounded-xl px-2 py-2 font-bold outline-none focus:border-[#0084CC] focus:bg-white"
                >
                  {TITLE_PART_1.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-mono font-black text-[#0084CC] mb-1 uppercase">TITLE SUFFIX</label>
                <select
                  value={passportForm.titlePart2}
                  onChange={(e) => setPassportForm({ ...passportForm, titlePart2: e.target.value })}
                  className="w-full bg-[#FAF8F2] border border-[#E6DFC7] rounded-xl px-2 py-2 font-bold outline-none focus:border-[#0084CC] focus:bg-white"
                >
                  {TITLE_PART_2.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-mono font-black text-[#0084CC] mb-1 uppercase">SWITCH FRIEND CODE</label>
              <input
                type="text"
                value={passportForm.friendCode}
                onChange={(e) => {
                  let val = e.target.value;
                  if (!val.toUpperCase().startsWith('SW-')) {
                    val = 'SW-' + val.replace(/^SW-?/i, '');
                  }
                  setPassportForm({ ...passportForm, friendCode: val });
                }}
                placeholder="SW-1234-5678-9012"
                className="w-full bg-[#FAF8F2] border border-[#E6DFC7] rounded-xl px-3 py-2 font-mono font-bold outline-none focus:border-[#0084CC] focus:bg-white"
                maxLength={17}
              />
            </div>

            <div>
              <label className="block text-[9px] font-mono font-black text-[#0084CC] mb-1 uppercase">PORTRAIT PHOTO</label>
              <div className="flex gap-2 p-1.5 bg-[#FAF8F2] border border-[#E6DFC7] rounded-xl overflow-x-auto">
                {AVATAR_ICONS.slice(0, 10).map((icon) => (
                  <button
                    key={icon.char}
                    type="button"
                    onClick={() => setPassportForm({ ...passportForm, avatarIcon: icon.char })}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all cursor-pointer ${
                      passportForm.avatarIcon === icon.char ? 'bg-[#FFCC00] ring-2 ring-[#0084CC] scale-110 shadow-sm' : 'bg-white border hover:bg-slate-50'
                    }`}
                  >
                    {icon.char}
                  </button>
                ))}
              </div>
            </div>

            {/* Seaplane Registration Section */}
            <div className="border-t border-[#E6DFC7]/60 pt-3 mt-3 space-y-3">
              <span className="block text-[10px] font-mono font-black text-[#0084CC] uppercase tracking-wider">
                ✈️ Register Your Island Seaplane
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[8px] font-mono font-black text-[#85806B] mb-1 uppercase">PLANE MODEL</label>
                  <select
                    value={passportForm.planeType || 'Switch'}
                    onChange={(e) => setPassportForm({ ...passportForm, planeType: e.target.value as 'Switch' | 'Switch 2' })}
                    className="w-full bg-[#FAF8F2] border border-[#E6DFC7] rounded-xl px-2 py-1.5 font-bold outline-none focus:border-[#0084CC]"
                  >
                    <option value="Switch">🛩️ Switch Model (8 seats)</option>
                    <option value="Switch 2">✈️ Switch 2 Model (12 seats)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[8px] font-mono font-black text-[#85806B] mb-1 uppercase">LIVERY COLOR</label>
                  <div className="flex gap-1.5 bg-[#FAF8F2] p-1 border border-[#E6DFC7] rounded-xl">
                    {PLANE_COLORS.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setPassportForm({ ...passportForm, planeColor: color.id })}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${color.bg} ${color.border} border-2 ${
                          (passportForm.planeColor || 'orange') === color.id ? 'scale-110 ring-2 ring-[#0084CC]' : 'opacity-70 hover:opacity-100'
                        }`}
                        title={color.name}
                      >
                        <span className="text-[10px] text-white">✈️</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <button
                type="submit"
                className="w-full bg-[#FFCC00] hover:bg-[#FFD11A] text-[#006094] font-display font-black py-3 rounded-2xl border-b-4 border-[#CC9900] shadow-md transition-all uppercase tracking-wide text-xs cursor-pointer"
              >
                💾 PRINT MY PASSPORT & ENTER COUNTER
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[#E6DFC7]/50" />
                <span className="flex-shrink mx-3 text-[9px] font-mono font-black text-slate-400 uppercase tracking-wider">or</span>
                <div className="flex-grow border-t border-[#E6DFC7]/50" />
              </div>

              <button
                type="button"
                onClick={handleBrowseAsGuest}
                className="w-full bg-[#FAF8F2] hover:bg-slate-50 border border-slate-300 text-slate-600 font-display font-black py-2.5 rounded-2xl transition-all uppercase tracking-wide text-[10px] flex items-center justify-center gap-1.5 cursor-pointer shadow-xs font-bold"
              >
                🏝️ Browse as Guest (No Passport)
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

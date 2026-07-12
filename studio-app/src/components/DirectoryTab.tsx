/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Users, ShieldCheck, Heart, Smile, Sparkles, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { UserProfile, Passport } from '../types.js';
import { playSound } from '../utils/audio.js';
import { PASSPORT_COLORS } from '../utils/constants.js';

interface DirectoryTabProps {
  profiles: Record<string, UserProfile>;
  openProfileModal: (friendCode: string) => void;
  passport: Passport;
  isMuted: boolean;
}

type SortOption = 'recent' | 'name' | 'apples';

export const DirectoryTab: React.FC<DirectoryTabProps> = ({
  profiles,
  openProfileModal,
  passport,
  isMuted
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  // Convert Record<string, UserProfile> to a list of profiles
  const profilesList: UserProfile[] = Object.values(profiles);

  // Filter based on search query
  const filteredProfiles = profilesList.filter((p) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      p.villagerName.toLowerCase().includes(query) ||
      p.islandName.toLowerCase().includes(query) ||
      p.friendCode.toLowerCase().includes(query) ||
      p.title.toLowerCase().includes(query) ||
      p.signature.toLowerCase().includes(query)
    );
  });

  // Sort based on sort option
  const sortedProfiles = [...filteredProfiles].sort((a, b) => {
    if (sortBy === 'name') {
      return a.villagerName.localeCompare(b.villagerName);
    }
    if (sortBy === 'apples') {
      const applesA = a.goodApples || 0;
      const applesB = b.goodApples || 0;
      if (applesB !== applesA) {
        return applesB - applesA;
      }
      return b.updatedAt.localeCompare(a.updatedAt);
    }
    // Default: Sort by updatedAt (desc)
    return b.updatedAt.localeCompare(a.updatedAt);
  });

  return (
    <div className="space-y-5 text-left">
      {/* Directory Title Board */}
      <div className="bg-white rounded-3xl border-2 border-[#0084CC]/10 p-4 lg:p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center text-xl shadow-inner text-[#0084CC]">
            📇
          </div>
          <div>
            <h2 className="text-base font-mono font-black tracking-wider text-[#0084CC] uppercase leading-none">
              DAL Registered Flyers Directory
            </h2>
            <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest mt-1 block">
              Discover and vouch for verified islanders in the lounge
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500">
          <span className="bg-sky-50 text-[#0084CC] px-3 py-1 rounded-full font-bold border border-sky-100 uppercase">
            {profilesList.length} total registered {profilesList.length === 1 ? 'flyer' : 'flyers'}
          </span>
        </div>
      </div>

      {/* Search and Filters panel */}
      <div className="bg-white rounded-3xl border-2 border-[#E6DFC7] p-4 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        {/* Search input field */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4 text-slate-400" />
          </span>
          <input
            id="directory-search-input"
            type="text"
            placeholder="Search by name, island, friend code, or custom title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50/70 border border-slate-200 text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0084CC]/20 focus:border-[#0084CC] transition-all"
          />
        </div>

        {/* Sort option toggles */}
        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          <span className="text-[10px] font-mono font-black text-slate-400 flex items-center gap-1 uppercase">
            <SlidersHorizontal className="w-3 h-3" /> Sort:
          </span>

          <div className="flex gap-1 bg-slate-100 p-0.5 rounded-xl">
            <button
              onClick={() => { playSound('beep', isMuted); setSortBy('recent'); }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide transition-all border-none cursor-pointer ${
                sortBy === 'recent'
                  ? 'bg-[#0084CC] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/50'
              }`}
            >
              Recent Updates
            </button>
            <button
              onClick={() => { playSound('beep', isMuted); setSortBy('name'); }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide transition-all border-none cursor-pointer ${
                sortBy === 'name'
                  ? 'bg-[#0084CC] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/50'
              }`}
            >
              Alphabetical
            </button>
            <button
              onClick={() => { playSound('beep', isMuted); setSortBy('apples'); }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide transition-all border-none cursor-pointer ${
                sortBy === 'apples'
                  ? 'bg-[#0084CC] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/50'
              }`}
            >
              🍎 Vouches
            </button>
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      <AnimatePresence mode="popLayout">
        {sortedProfiles.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {sortedProfiles.map((p) => {
              const activeColor = PASSPORT_COLORS[p.colorIndex || 0] || PASSPORT_COLORS[1];
              const isMe = passport.friendCode && p.friendCode === passport.friendCode;

              return (
                <motion.div
                  key={p.friendCode}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => openProfileModal(p.friendCode)}
                  className={`relative flex flex-col justify-between bg-[#FFFCEF] rounded-[32px] border-4 border-[#E6DFC7] p-5 shadow-sm hover:shadow-md cursor-pointer transition-all overflow-hidden ${
                    isMe ? 'ring-4 ring-[#FFCC00] ring-offset-2' : ''
                  }`}
                >
                  {/* Me sticker badge */}
                  {isMe && (
                    <span className="absolute -right-12 top-4 rotate-45 bg-[#FFCC00] text-[#006094] text-[8px] font-mono font-black py-1 px-12 tracking-wider shadow-sm uppercase font-bold text-center z-10">
                      You
                    </span>
                  )}

                  <div className="space-y-4">
                    {/* Visual Stamp Card */}
                    <div className="flex gap-3">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3.5xl shadow-inner border border-[#E6DFC7]/10 shrink-0 ${activeColor.bg}`}>
                        {p.avatarIcon || '🦤'}
                      </div>
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <span className="bg-sky-100 text-sky-800 text-[7px] font-mono font-bold px-1.5 py-0.5 rounded-full uppercase leading-none border border-sky-200">
                          Verified Flyer
                        </span>
                        <h3 className="font-display font-black text-sm text-slate-800 leading-tight truncate mt-1 font-bold">
                          {p.villagerName}
                        </h3>
                        <p className="text-[11px] font-bold text-[#0084CC] truncate">
                          🏝️ {p.islandName}
                        </p>
                      </div>
                    </div>

                    {/* Passport Title */}
                    <div className="space-y-1">
                      <span className="block text-[7.5px] font-mono text-[#85806B] uppercase leading-none">PASSPORT TITLE</span>
                      <span className="inline-block bg-[#F5F2E6] border border-[#E6DFC7] rounded-sm px-1.5 py-0.5 text-[8.5px] font-mono font-bold text-[#80765A] uppercase truncate max-w-full">
                        {p.title || 'Freshly Picked Islander'}
                      </span>
                    </div>

                    {/* Friend Code */}
                    <div className="space-y-1">
                      <span className="block text-[7.5px] font-mono text-[#85806B] uppercase leading-none">FRIEND CODE</span>
                      <span className="font-mono font-bold text-slate-500 text-[10px] block">
                        {p.friendCode}
                      </span>
                    </div>

                    {/* Signature */}
                    {p.signature && (
                      <div className="bg-white/65 border border-[#E6DFC7]/40 p-2.5 rounded-xl text-[10px] italic text-slate-500 min-h-[44px] flex items-center">
                        "{p.signature}"
                      </div>
                    )}
                  </div>

                  {/* Rating / Vouch stats & CTA button */}
                  <div className="mt-4 pt-3.5 border-t border-dashed border-[#E6DFC7] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-[11px] font-mono font-black font-bold">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-2 py-0.5 flex items-center gap-1">
                        🍏 {p.goodApples || 0}
                      </span>
                      <span className="bg-rose-50 text-rose-700 border border-rose-100 rounded-full px-2 py-0.5 flex items-center gap-1">
                        🧅 {p.rottenTurnips || 0}
                      </span>
                    </div>

                    <span className="bg-[#0084CC] hover:bg-[#006094] text-white text-[9px] font-mono font-black px-2.5 py-1 rounded-lg uppercase transition-colors font-bold border-none cursor-pointer">
                      View Profile
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-[32px] border-2 border-dashed border-[#E6DFC7] p-12 text-center"
          >
            <div className="text-4xl">📇</div>
            <h3 className="font-display font-black text-sm text-slate-700 uppercase tracking-wider mt-3 font-bold">No passports found</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 leading-normal font-medium">
              We couldn't find any registered flyers matching your search criteria. Try typing something else!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

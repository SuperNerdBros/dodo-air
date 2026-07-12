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
  PASSPORT_COLORS,
  PLANE_COLORS,
  generateRandomFriendCode
} from '../utils/constants.js';

interface PassportEditModalProps {
  passport: Passport;
  onSave: (updated: Passport) => void;
  onClose: () => void;
  isMuted: boolean;
}

export const PassportEditModal: React.FC<PassportEditModalProps> = ({
  passport,
  onSave,
  onClose,
  isMuted
}) => {
  const [form, setForm] = useState<Passport>({ ...passport });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.villagerName.trim() || !form.islandName.trim()) return;

    let finalFriendCode = form.friendCode.trim();
    if (!finalFriendCode || finalFriendCode === 'SW-XXXX-XXXX-XXXX' || finalFriendCode === 'SW-') {
      finalFriendCode = generateRandomFriendCode();
    }

    const updated: Passport = {
      ...form,
      friendCode: finalFriendCode,
      hasCreated: true,
      hasCustomized: true
    };
    onSave(updated);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#FAF8F2] rounded-[36px] border-4 border-[#E6DFC7] p-5 max-w-sm w-full shadow-2xl relative text-[#4A4A4A]"
      >
        <div className="flex items-center gap-2 border-b border-[#E6DFC7] pb-2 mb-3">
          <span className="text-xl">📖</span>
          <h3 className="font-display font-black text-sm text-[#0084CC] uppercase">Update Passport Credentials</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[8px] font-mono font-black text-[#85806B] mb-0.5 uppercase">VILLAGER ID</label>
            <input
              type="text"
              value={form.villagerName}
              onChange={(e) => setForm({ ...form, villagerName: e.target.value })}
              placeholder="e.g. Raymond"
              className="w-full bg-white border border-[#E6DFC7] rounded-xl px-3 py-1.5 font-bold outline-none focus:border-[#0084CC]"
              maxLength={12}
              required
            />
          </div>
          <div>
            <label className="block text-[8px] font-mono font-black text-[#85806B] mb-0.5 uppercase">HOME ISLAND</label>
            <input
              type="text"
              value={form.islandName}
              onChange={(e) => setForm({ ...form, islandName: e.target.value })}
              placeholder="e.g. Peaches Cove"
              className="w-full bg-white border border-[#E6DFC7] rounded-xl px-3 py-1.5 font-bold outline-none focus:border-[#0084CC]"
              maxLength={14}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[8px] font-mono font-black text-[#85806B] mb-0.5 uppercase">TITLE PREFIX</label>
              <select
                value={form.titlePart1}
                onChange={(e) => setForm({ ...form, titlePart1: e.target.value })}
                className="w-full bg-white border border-[#E6DFC7] rounded-xl px-2 py-1.5 font-bold outline-none"
              >
                {TITLE_PART_1.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[8px] font-mono font-black text-[#85806B] mb-0.5 uppercase">TITLE SUFFIX</label>
              <select
                value={form.titlePart2}
                onChange={(e) => setForm({ ...form, titlePart2: e.target.value })}
                className="w-full bg-white border border-[#E6DFC7] rounded-xl px-2 py-1.5 font-bold outline-none"
              >
                {TITLE_PART_2.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[8px] font-mono font-black text-[#85806B] mb-0.5 uppercase">SWITCH FRIEND CODE</label>
            <input
              type="text"
              value={form.friendCode}
              onChange={(e) => {
                let val = e.target.value;
                if (!val.toUpperCase().startsWith('SW-')) {
                  val = 'SW-' + val.replace(/^SW-?/i, '');
                }
                setForm({ ...form, friendCode: val });
              }}
              className="w-full bg-white border border-[#E6DFC7] rounded-xl px-3 py-1.5 font-mono font-bold outline-none focus:border-[#0084CC]"
              maxLength={17}
            />
          </div>

          <div>
            <label className="block text-[8px] font-mono font-black text-[#85806B] mb-0.5 uppercase">PORTRAIT AVATAR</label>
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto p-1 bg-white border border-[#E6DFC7] rounded-xl">
              {AVATAR_ICONS.map((icon) => (
                <button
                  key={icon.char}
                  type="button"
                  onClick={() => setForm({ ...form, avatarIcon: icon.char })}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all cursor-pointer ${
                    form.avatarIcon === icon.char ? 'bg-[#FFCC00] border border-[#0084CC] scale-110 shadow-xs' : 'bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  {icon.char}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[8px] font-mono font-black text-[#85806B] mb-1.5 uppercase">PASSPORT THEME COLOR</label>
            <div className="flex justify-between bg-white p-1.5 border border-[#E6DFC7] rounded-xl">
              {PASSPORT_COLORS.map((c, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setForm({ ...form, colorIndex: idx })}
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-all cursor-pointer ${c.bg} ${c.border} border ${
                    form.colorIndex === idx ? 'scale-125 ring-2 ring-[#0084CC]' : ''
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[8px] font-mono font-black text-[#85806B] mb-0.5 uppercase">PERSONAL REMARKS / COMMENT</label>
            <input
              type="text"
              value={form.signature}
              onChange={(e) => setForm({ ...form, signature: e.target.value })}
              placeholder="Wings up, skies clear!"
              className="w-full bg-white border border-[#E6DFC7] rounded-xl px-3 py-1.5 font-bold outline-none"
              maxLength={40}
            />
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
                  value={form.planeType || 'Switch'}
                  onChange={(e) => setForm({ ...form, planeType: e.target.value as 'Switch' | 'Switch 2' })}
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
                      onClick={() => setForm({ ...form, planeColor: color.id })}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${color.bg} ${color.border} border-2 ${
                        (form.planeColor || 'orange') === color.id ? 'scale-110 ring-2 ring-[#0084CC]' : 'opacity-70 hover:opacity-100'
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

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => { playSound('beep', isMuted); onClose(); }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-500 font-display font-black py-2.5 rounded-xl text-center uppercase cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#0084CC] hover:bg-[#006094] text-white font-display font-black py-2.5 rounded-xl text-center uppercase cursor-pointer shadow-xs border-b-2 border-[#006094]"
            >
              Save Details
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertCircle } from 'lucide-react';
import { GATE_THEMES } from '../utils/constants.js';

interface StandbyTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestGateType: number;
  setRequestGateType: (val: number) => void;
  requestTime: string;
  setRequestTime: (val: string) => void;
  requestMemo: string;
  setRequestMemo: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  requestError: string;
  isSubmittingRequest: boolean;
}

export const StandbyTicketModal: React.FC<StandbyTicketModalProps> = ({
  isOpen,
  onClose,
  requestGateType,
  setRequestGateType,
  requestTime,
  setRequestTime,
  requestMemo,
  setRequestMemo,
  onSubmit,
  requestError,
  isSubmittingRequest
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-[#006094]/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="bg-white rounded-[32px] border-4 border-[#0084CC] max-w-md w-full p-6 shadow-2xl relative text-[#4A4A4A]"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="font-display font-black text-base text-[#0084CC]">File Standby Flight Ticket</h3>
                <span className="text-[8px] font-mono font-bold text-slate-400 block uppercase">DODO AIRLINES STANDBY REGISTRY</span>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 border-none cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4 text-xs">
              {requestError && (
                <p className="text-xs font-bold text-red-600 flex items-center gap-1 font-mono">
                  <AlertCircle className="w-4 h-4" /> {requestError}
                </p>
              )}

              <div>
                <label className="block text-[8px] font-mono font-black text-[#0084CC] mb-1 uppercase">DESIRED GATE THEME / PURPOSE</label>
                <select
                  value={requestGateType}
                  onChange={(e) => setRequestGateType(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold outline-none cursor-pointer"
                >
                  {Object.entries(GATE_THEMES).map(([num, theme]) => (
                    <option key={num} value={num}>
                      {theme.icon} {theme.name} ({theme.tag})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[8px] font-mono font-black text-[#0084CC] mb-1 uppercase">TIME PREFERENCE</label>
                <select
                  value={requestTime}
                  onChange={(e) => setRequestTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold outline-none cursor-pointer"
                >
                  <option value="Online Now">⏱️ Online Right Now</option>
                  <option value="In 10 Mins">⏱️ Flying in 10 Minutes</option>
                  <option value="Stargazing Tonight">⏱️ Stargazing / Night Flights</option>
                  <option value="Flexible">⏱️ Flexible / Cozy Travel</option>
                </select>
              </div>

              <div>
                <label className="block text-[8px] font-mono font-black text-[#0084CC] mb-1 uppercase">CUSTOM MEMO / SEEKING DETAILS</label>
                <textarea
                  value={requestMemo}
                  onChange={(e) => setRequestMemo(e.target.value)}
                  placeholder="e.g. Looking to swap DIYs, or sell turnips over 300 bells. Will tip gold nugget! 💰"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold h-20 resize-none outline-none focus:bg-white"
                  maxLength={140}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingRequest}
                className="w-full bg-[#FFCC00] hover:bg-[#FFD11A] text-[#006094] font-display font-black py-3 rounded-2xl border-b-4 border-[#CC9900] shadow transition-all uppercase tracking-wide text-xs cursor-pointer font-bold"
              >
                {isSubmittingRequest ? 'Registering...' : '📡 SUBMIT STANDBY TICKET & ENTER RADAR'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

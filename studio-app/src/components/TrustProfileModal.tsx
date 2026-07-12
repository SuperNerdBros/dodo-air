/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertCircle } from 'lucide-react';
import { UserProfile, FeedbackReview } from '../types.js';
import { playSound } from '../utils/audio.js';
import { PASSPORT_COLORS } from '../utils/constants.js';

interface TrustProfileModalProps {
  selectedFriendCode: string | null;
  onClose: () => void;
  profiles: Record<string, UserProfile>;
  selectedProfileReviews: FeedbackReview[];
  onSubmitReview: (ratingType: 'apple' | 'turnip', comment: string) => Promise<void> | void;
  reviewError: string;
  isSubmittingReview: boolean;
  isMuted: boolean;
}

export const TrustProfileModal: React.FC<TrustProfileModalProps> = ({
  selectedFriendCode,
  onClose,
  profiles,
  selectedProfileReviews,
  onSubmitReview,
  reviewError,
  isSubmittingReview,
  isMuted
}) => {
  const [reviewRatingType, setReviewRatingType] = useState<'apple' | 'turnip'>('apple');
  const [reviewComment, setReviewComment] = useState('');

  if (!selectedFriendCode) return null;

  const prof: UserProfile = profiles[selectedFriendCode] || {
    friendCode: selectedFriendCode,
    villagerName: selectedFriendCode.startsWith('SW-TEMP-') ? selectedFriendCode.split('-')[2] : 'Unregistered Resident',
    islandName: selectedFriendCode.startsWith('SW-TEMP-') ? selectedFriendCode.split('-')[3] : 'Mystery Island',
    avatarIcon: '🦤',
    title: 'Frequent Flyer',
    signature: 'Skies are blue, wings are up!',
    colorIndex: 1,
    goodApples: 0,
    rottenTurnips: 0,
    vouchers: {},
    updatedAt: new Date().toISOString()
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    await onSubmitReview(reviewRatingType, reviewComment);
    setReviewComment('');
  };

  const activeColor = PASSPORT_COLORS[prof.colorIndex || 0] || PASSPORT_COLORS[1];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-[#006094]/40 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="bg-[#FFFCEF] rounded-[36px] border-4 border-[#E6DFC7] max-w-xl w-full p-6 shadow-2xl relative text-[#4A4A4A] my-8 text-left"
        >
          {/* Close Button */}
          <button
            onClick={() => { playSound('beep', isMuted); onClose(); }}
            className="absolute right-5 top-5 p-1.5 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all cursor-pointer border-none"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Passport Visual header */}
          <div className={`p-4 rounded-3xl border-2 shadow-xs mb-5 flex flex-col sm:flex-row gap-4 items-center ${activeColor.bg} border-[#E6DFC7]/40`}>
            <div className="w-16 h-16 bg-white/70 rounded-2xl flex items-center justify-center text-4xl shadow-inner border border-white">
              {prof.avatarIcon || '🦤'}
            </div>
            <div className="text-center sm:text-left space-y-1 flex-1 min-w-0">
              <span className="bg-sky-100 text-sky-800 text-[8px] font-mono font-bold px-2 py-0.5 rounded-full uppercase leading-none border border-sky-200">
                Islander Passport
              </span>
              <h3 className="font-display font-black text-lg text-slate-800 leading-tight truncate font-bold">
                {prof.villagerName}
              </h3>
              <p className="text-xs font-bold text-[#0084CC] truncate">
                🏝️ {prof.islandName}
              </p>
              {prof.signature && (
                <p className="text-[10px] font-mono italic text-slate-500 truncate mt-0.5">
                  "{prof.signature}"
                </p>
              )}
            </div>
            <div className="sm:text-right text-[10px] font-mono text-slate-500 border-t sm:border-t-0 sm:border-l border-[#E6DFC7]/40 pt-2 sm:pt-0 sm:pl-3 max-w-[140px] w-full sm:w-auto">
              <span className="block text-[7.5px] uppercase font-bold text-slate-400 leading-none">FRIEND ID</span>
              <span className="font-bold text-slate-700 block mt-1 leading-none">{prof.friendCode.startsWith('SW-TEMP-') ? 'NOT LINKED' : prof.friendCode}</span>
            </div>
          </div>

          {/* Score Stats Section (Good Apples vs Rotten Turnips) */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Good Apples */}
            <div className="bg-emerald-50/50 border-2 border-emerald-200 rounded-3xl p-4 text-center shadow-xs">
              <span className="text-3xl block">🍏</span>
              <span className="block font-display font-black text-xs text-[#117A65] uppercase mt-1 leading-none font-bold">Good Apples</span>
              <span className="block font-mono font-black text-[#117A65] text-2xl mt-1.5 leading-none font-black">
                {prof.goodApples || 0}
              </span>
              <p className="text-[9px] font-medium text-slate-500 mt-1 font-sans">Vouched for positive, kind visits!</p>
            </div>

            {/* Rotten Turnips */}
            <div className="bg-rose-50/50 border-2 border-rose-200 rounded-3xl p-4 text-center shadow-xs">
              <span className="text-3xl block">🧅</span>
              <span className="block font-display font-black text-xs text-rose-800 uppercase mt-1 leading-none font-bold">Rotten Turnips</span>
              <span className="block font-mono font-black text-rose-600 text-2xl mt-1.5 leading-none font-black">
                {prof.rottenTurnips || 0}
              </span>
              <p className="text-[9px] font-medium text-slate-500 mt-1 font-sans">Reported for bad flight behavior.</p>
            </div>
          </div>

          {/* Form to submit Vouch/Report */}
          <div className="bg-white border border-[#E6DFC7]/60 rounded-3xl p-4 mb-6 text-left">
            <h4 className="font-display font-black text-xs text-[#0084CC] uppercase tracking-wider mb-3 font-bold">
              ✍️ Leave Community Trust Feedback
            </h4>

            {reviewError && (
              <div className="bg-red-50 text-red-700 p-2.5 rounded-xl text-[10px] font-mono font-bold mb-3 border border-red-200 flex items-center gap-1.5 leading-snug">
                <AlertCircle className="w-3.5 h-3.5" /> {reviewError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              <div className="flex gap-3 text-center">
                <button
                  type="button"
                  onClick={() => { playSound('beep', isMuted); setReviewRatingType('apple'); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold border-2 transition-all cursor-pointer ${
                    reviewRatingType === 'apple'
                      ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  🍏 Vouch: Good Apple
                </button>
                <button
                  type="button"
                  onClick={() => { playSound('beep', isMuted); setReviewRatingType('turnip'); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold border-2 transition-all cursor-pointer ${
                    reviewRatingType === 'turnip'
                      ? 'bg-rose-500 border-rose-600 text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  🧅 Report: Rotten Turnip
                </button>
              </div>

              <div>
                <input
                  type="text"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={reviewRatingType === 'apple' ? "e.g. Left lovely tips, watered my hybrid flowers! 🌸" : "e.g. Shook fruit trees and trampled flowers without asking. 😡"}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold outline-none focus:bg-white"
                  maxLength={100}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className={`w-full font-display font-black text-xs uppercase py-2.5 rounded-xl shadow border-b-2 transition-all cursor-pointer font-bold ${
                  reviewRatingType === 'apple'
                    ? 'bg-emerald-500 hover:bg-emerald-600 border-emerald-700 text-white'
                    : 'bg-rose-500 hover:bg-rose-600 border-rose-700 text-white'
                }`}
              >
                {isSubmittingReview ? "submitting feedback..." : `Submit Trust Rating (${reviewRatingType === 'apple' ? '🍏 Vouch' : '🧅 Report'})`}
              </button>
            </form>
          </div>

          {/* Feedback Review Feed */}
          <div className="space-y-3 text-left">
            <span className="block text-[8px] font-mono font-black text-slate-400 uppercase tracking-wider">
              📋 COMMUNITY FEEDBACK HISTORY ({selectedProfileReviews.length})
            </span>

            <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
              {selectedProfileReviews.length === 0 ? (
                <p className="text-[11px] italic font-mono text-slate-400 text-center py-4">
                  No community feedback reviews have been registered for this flyer yet. Be the first to vouch or report!
                </p>
              ) : (
                selectedProfileReviews.map((rev) => (
                  <div key={rev.id} className="bg-white border border-[#E6DFC7]/40 rounded-2xl p-3 flex gap-2 items-start text-[11px]">
                    <span className="text-lg flex-shrink-0 mt-0.5">
                      {rev.ratingType === 'apple' ? '🍏' : '🧅'}
                    </span>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-display font-black text-slate-700 truncate font-bold">
                          {rev.authorName} <span className="font-normal font-sans text-slate-400">from</span> '{rev.authorIsland}'
                        </span>
                        <span className="text-[8px] font-mono text-slate-400 shrink-0">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed font-sans font-semibold text-left">"{rev.comment}"</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Sparkles, RefreshCw, Compass } from 'lucide-react';
import { Flight, Passport, StandbyRequest, FlightStatus, UserProfile } from '../types.js';
import { playSound } from '../utils/audio.js';
import { GATE_THEMES, PLANE_COLORS } from '../utils/constants.js';

interface CockpitTabProps {
  myFlight: Flight | null;
  handleHostFlight: (e: React.FormEvent) => void;
  formError: string;
  formDodo: string;
  setFormDodo: (val: string) => void;
  formHemisphere: 'Northern' | 'Southern';
  setFormHemisphere: (val: 'Northern' | 'Southern') => void;
  formGate: number;
  setFormGate: (val: number) => void;
  formDesc: string;
  setFormDesc: (val: string) => void;
  isSubmittingHost: boolean;
  passport: Passport;
  handleUpdateStatus: (flightId: string, status: FlightStatus) => void;
  handleLeaveFlight: (flightId: string, passengerId: string) => void;
  handleGenerateAIReview: (flightId: string) => void;
  loadingReviewId: string | null;
  requests: StandbyRequest[];
  handleClearForTakeoff: (match: StandbyRequest, flightId: string) => void;
  profiles: Record<string, UserProfile>;
  openProfileModal: (friendCode: string) => void;
  isMuted: boolean;
}

export const CockpitTab: React.FC<CockpitTabProps> = ({
  myFlight,
  handleHostFlight,
  formError,
  formDodo,
  setFormDodo,
  formHemisphere,
  setFormHemisphere,
  formGate,
  setFormGate,
  formDesc,
  setFormDesc,
  isSubmittingHost,
  passport,
  handleUpdateStatus,
  handleLeaveFlight,
  handleGenerateAIReview,
  loadingReviewId,
  requests,
  handleClearForTakeoff,
  profiles,
  openProfileModal,
  isMuted
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      
      {/* Unregistered or not currently hosting seaplane layout */}
      {!myFlight ? (
        <div className="bg-white rounded-[36px] border-4 border-[#0084CC]/10 shadow-[0_8px_0_0_rgba(0,132,204,0.05)] p-6 text-center space-y-6 text-left">
          
          {/* Hangar Illustrative Header */}
          <div className="max-w-xs mx-auto">
            <div className="w-20 h-20 bg-[#F0F9FF] border-2 border-[#0084CC] rounded-full flex items-center justify-center text-5xl mx-auto shadow relative transform -rotate-12">
              🛩️
              <div className="absolute -bottom-1 -right-1 bg-[#FFCC00] text-[#006094] text-[8px] font-mono font-black px-1.5 py-0.5 rounded-full border border-white uppercase">
                DAL-X
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-black text-[#0084CC] text-center font-bold">Your Private DAL Seaplane Hangar</h2>
            <p className="text-xs text-slate-400 font-mono mt-1 uppercase tracking-wider font-bold text-center">
              PARKED & FUELED - READY TO WELCOME VISITORS
            </p>
          </div>

          <div className="bg-[#FFFCEF] border border-[#E6DFC7] p-3.5 rounded-2xl max-w-xl mx-auto text-left flex gap-3">
            <span className="text-2xl">👷</span>
            <p className="text-xs text-[#4A4A4A] leading-relaxed font-semibold">
              <strong>Wilbur:</strong> "Roger that! Seaplane engine oil looking steady, props balanced. All we need is your 5-digit Dodo Code™ and we'll connect your airport terminal gateway so other islanders can book tickets!"
            </p>
          </div>

          {/* Host Flight Registration Form */}
          <form onSubmit={handleHostFlight} className="max-w-xl mx-auto text-left space-y-4 border-t border-slate-100 pt-5 text-xs">
            
            {formError && (
              <p className="text-xs font-bold text-red-600 flex items-center gap-1 font-mono bg-red-50 p-2.5 rounded-xl border border-red-100">
                <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-mono font-black text-[#0084CC] mb-1 uppercase tracking-wider font-bold">HOST NAME</label>
                <input
                  type="text"
                  value={passport.villagerName}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-400 outline-none"
                  disabled
                />
              </div>
              <div>
                <label className="block text-[9px] font-mono font-black text-[#0084CC] mb-1 uppercase tracking-wider font-bold">HOME ISLAND</label>
                <input
                  type="text"
                  value={passport.islandName}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-400 outline-none"
                  disabled
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-mono font-black text-[#0084CC] mb-1.5 uppercase tracking-wider font-bold">DODO CODE (5-DIGIT ALPHANUMERIC)</label>
                <input
                  type="text"
                  value={formDodo}
                  onChange={(e) => setFormDodo(e.target.value)}
                  placeholder="e.g. D0D01"
                  className="w-full bg-[#FAF8F2] border-[#0084CC]/30 border-2 rounded-xl px-3 py-2 text-xs font-mono font-black tracking-widest text-center uppercase outline-none focus:bg-white text-[#0084CC] font-bold"
                  maxLength={5}
                  required
                />
              </div>
              <div>
                <label className="block text-[9px] font-mono font-black text-[#0084CC] mb-1.5 uppercase tracking-wider font-bold">HEMISPHERE</label>
                <select
                  value={formHemisphere}
                  onChange={(e) => setFormHemisphere(e.target.value as 'Northern' | 'Southern')}
                  className="w-full bg-[#FAF8F2] border border-[#E6DFC7] rounded-xl px-3 py-2 font-bold outline-none focus:bg-white focus:border-[#0084CC]"
                >
                  <option value="Northern">🌍 Northern Hemisphere</option>
                  <option value="Southern">🌎 Southern Hemisphere</option>
                </select>
              </div>
            </div>

            {/* Gate selection with theme previews */}
            <div>
              <label className="block text-[9px] font-mono font-black text-[#0084CC] mb-1.5 uppercase tracking-wider font-bold">GATE CATEGORY & FLIGHT PURPOSE</label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((g) => {
                  const activeTheme = GATE_THEMES[g] || GATE_THEMES[1];
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => { playSound('beep', isMuted); setFormGate(g); }}
                      className={`py-2 rounded-xl border transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
                        formGate === g ? 'bg-[#FFCC00] border-2 border-[#0084CC] text-[#006094] font-black' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-[#4A4A4A]'
                      }`}
                    >
                      <span className="text-[11px] leading-none">{activeTheme.icon}</span>
                      <span className="text-[9px] leading-none font-bold mt-0.5">Gate {g}</span>
                    </button>
                  );
                })}
              </div>

              {(() => {
                const activeTheme = GATE_THEMES[formGate] || GATE_THEMES[1];
                return (
                  <div className="mt-2.5 bg-sky-50/50 p-2.5 rounded-xl border border-sky-100 flex gap-2">
                    <span className="text-xl">{activeTheme.icon}</span>
                    <div className="text-left">
                      <span className="font-bold text-xs text-[#0084CC] block">{activeTheme.name}</span>
                      <span className="text-[10px] text-slate-500 block leading-normal font-semibold">{activeTheme.desc}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div>
              <label className="block text-[9px] font-mono font-black text-[#0084CC] mb-1.5 uppercase tracking-wider font-bold">FLIGHT PLAN DESCRIPTION</label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="e.g. Turnips buying for 450! Celeste is near the airport dock. Free DIY card swap on the beach."
                className="w-full bg-[#FAF8F2] border border-[#E6DFC7] rounded-xl px-3 py-2 font-semibold h-16 resize-none outline-none focus:bg-white focus:border-[#0084CC]"
                maxLength={180}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingHost}
              className="w-full bg-[#FFCC00] hover:bg-[#FFD11A] text-[#006094] font-display font-black py-3 rounded-2xl border-b-4 border-[#CC9900] shadow transition-all uppercase tracking-wide text-xs cursor-pointer font-bold"
            >
              {isSubmittingHost ? 'Dispatching Hangar...' : '📡 OPEN MY AIRPORT GATE & CONNECT ONLINE'}
            </button>
          </form>

        </div>
      ) : (
        /* Active hosting cockpit panel */
        <div className="space-y-5 text-left">
          
          {/* Cockpit Card Header */}
          <div className="bg-[#006094] text-white rounded-[32px] p-5 shadow border-b-4 border-[#FFCC00] relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 text-9xl pointer-events-none select-none">🛩️</div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
              <div>
                <span className="bg-[#FFCC00] text-[#006094] text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded-full font-mono uppercase font-bold">
                  ACTIVE PILOT CONSOLE
                </span>
                <h2 className="text-2xl font-black font-display tracking-tight mt-1 font-bold">
                  Flight {myFlight.id} to '{myFlight.islandName}'
                </h2>
                <p className="text-xs text-sky-200 mt-0.5">
                  Island host: <strong>{myFlight.hostName}</strong> | Gate Theme: <strong>{(GATE_THEMES[myFlight.gate] || GATE_THEMES[1]).name}</strong>
                </p>
              </div>

              {/* Code security indicator */}
              <div className="bg-black/20 border border-white/10 p-3 rounded-2xl text-center font-mono">
                <span className="block text-[8px] text-sky-200 font-bold uppercase">My Dodo Code</span>
                <span className="text-2xl font-black text-[#FFCC00] tracking-widest leading-none mt-0.5 block uppercase font-bold">
                  {myFlight.dodoCode}
                </span>
              </div>
            </div>
          </div>

          {/* Cockpit controls grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            
            {/* Left Column: Core Status Control and Passenger Manifest */}
            <div className="md:col-span-7 space-y-4">
              
              {/* Gate Controller Status board */}
              <div className="bg-white rounded-[32px] p-5 border-2 border-[#0084CC]/10 shadow-sm space-y-4">
                <h3 className="font-display font-black text-xs text-[#0084CC] uppercase tracking-wide border-b border-slate-100 pb-2 font-bold">
                  🚦 Seaplane Runway Controllers
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  {(['Scheduled', 'Boarding', 'Departed', 'Delayed'] as FlightStatus[]).map((status) => {
                    const isActive = myFlight.status === status;
                    return (
                      <button
                        key={status}
                        onClick={() => { playSound('beep', isMuted); handleUpdateStatus(myFlight.id, status); }}
                        className={`py-2 rounded-xl font-mono font-black border transition-all text-[10px] cursor-pointer font-bold ${
                          isActive
                            ? 'bg-[#FFCC00] text-[#006094] border-2 border-[#0084CC] shadow scale-105'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-400'
                        }`}
                      >
                        {status.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Passenger Manifest Checked-In List */}
              <div className="bg-white rounded-[32px] p-5 border-2 border-[#0084CC]/10 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                  <h3 className="font-display font-black text-xs text-[#0084CC] uppercase tracking-wide font-bold">
                    🎟️ Passenger Flight Manifest
                  </h3>
                  <span className="font-mono text-[10px] text-[#0084CC] font-bold">
                    BOARDED: {myFlight.passengers.length} SEATS
                  </span>
                </div>

                {myFlight.passengers.length === 0 ? (
                  <div className="py-8 text-center font-mono text-slate-400 text-xs">
                    No passengers have checked in at Gate {myFlight.gate} yet. Runways are clear!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {myFlight.passengers.map((p) => (
                      <div key={p.id} className="flex items-center justify-between bg-[#FAF8F2] border border-[#E6DFC7]/50 p-2.5 rounded-2xl">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">👤</span>
                          <div className="text-xs text-left">
                            <span className="font-display font-black text-slate-700 block font-bold">{p.name}</span>
                            <span className="text-[9px] font-mono text-slate-400 block">from {p.island}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => { playSound('beep', isMuted); handleLeaveFlight(myFlight.id, p.id); }}
                          className="bg-slate-200 hover:bg-slate-300 text-[#4A4A4A] font-mono text-[9px] font-black px-2 py-1 rounded-full border-b border-slate-400 cursor-pointer font-bold border-none"
                        >
                          Return Home
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Loudspeaker Broadcast announcement and AI brochure review */}
              <div className="bg-white rounded-[32px] p-5 border-2 border-[#0084CC]/10 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="font-display font-black text-xs text-[#0084CC] uppercase tracking-wide font-bold">
                    📢 Airport Loudspeaker Feed
                  </h3>
                </div>

                <div className="bg-[#FAF8F2] p-3 rounded-2xl border border-[#E6DFC7]/50 text-xs text-slate-600 font-mono italic leading-relaxed text-left">
                  "{myFlight.announcement || "Attention passengers! Hangar seaplane prepares for flight checklist."}"
                </div>

                {/* AI Review segment */}
                {myFlight.review ? (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200/50 p-4 rounded-[24px] space-y-2">
                    <h4 className="font-display font-black text-[#D35400] text-xs flex items-center gap-1 font-bold">
                      <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                      Orville's Official Island Travel Review
                    </h4>
                    <p className="text-slate-600 text-xs italic font-sans leading-relaxed text-left font-semibold">
                      "{myFlight.review}"
                    </p>
                  </div>
                ) : (
                  <div className="bg-[#A2D2FF]/10 border border-[#0084CC]/10 p-4 rounded-[24px] text-center">
                    <p className="text-[11px] text-slate-500 mb-2 leading-relaxed font-semibold">
                      Ask Orville to compile Wilbur's flight deck observations and publish an official Travel Review brochure!
                    </p>
                    <button
                      onClick={() => handleGenerateAIReview(myFlight.id)}
                      disabled={loadingReviewId !== null}
                      className="w-full bg-[#0084CC] hover:bg-[#006094] text-white font-display font-black py-2 rounded-xl text-xs flex items-center justify-center gap-1 border-b-2 border-[#006094] disabled:opacity-50 shadow-xs cursor-pointer font-bold border-none"
                    >
                      {loadingReviewId === myFlight.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-[#FFCC00] fill-[#FFCC00]" />
                      )}
                      Draft AI Travel Review Brochure
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: Dynamic Matchmaker Radar (Orville's Desk matching) */}
            <div className="md:col-span-5 space-y-4">
              
              {/* MATCHMAKER COMPONENT */}
              <div className="bg-[#FFFCEF] rounded-[32px] border-4 border-[#FFEAA7] p-4 shadow-sm text-[#4A4A4A]">
                <div className="flex items-center gap-2 border-b border-[#FFEAA7] pb-2 mb-3">
                  <span className="text-xl">🦤</span>
                  <div>
                    <h3 className="font-display font-black text-xs text-[#0084CC] uppercase leading-none font-bold">Smart Flight Matchmaker</h3>
                    <span className="text-[8.5px] font-mono text-slate-400 font-bold uppercase mt-0.5 block">ORVILLE'S MATCH COUNTER</span>
                  </div>
                </div>

                {/* Search standby requests that match host's flight gate */}
                {requests.filter(r => r.gateType === myFlight.gate).length === 0 ? (
                  <div className="text-center py-8 text-slate-400 font-mono text-xs space-y-2">
                    <Compass className="w-8 h-8 text-slate-300 mx-auto animate-spin" />
                    <p className="uppercase font-bold">Scanning Airwaves...</p>
                    <p className="text-[10px] leading-relaxed">No standby flyers are looking for Gate Category {myFlight.gate} at the moment. Keep radar active!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-white/80 p-2.5 rounded-2xl border border-[#FFEAA7] text-xs text-[#4A4A4A] text-left font-semibold">
                      💡 <strong>Orville:</strong> "Look! We have standby passengers looking to match your flight's category! Clear them for immediate boarding!"
                    </div>

                    {requests.filter(r => r.gateType === myFlight.gate).map((match) => (
                      <div key={match.id} className="bg-white p-3 rounded-2xl border-2 border-[#0084CC]/20 shadow-xs space-y-2 text-left">
                        <div className="flex items-start gap-2">
                          <span className="text-xl">{match.avatar}</span>
                          <div className="text-left">
                            <span 
                              onClick={() => {
                                const p = (Object.values(profiles) as UserProfile[]).find(
                                  prof => prof.villagerName.toLowerCase() === match.name.toLowerCase() && 
                                          prof.islandName.toLowerCase() === match.island.toLowerCase()
                                );
                                openProfileModal(p ? p.friendCode : match.friendCode || `SW-TEMP-${match.name}-${match.island}`);
                              }}
                              className="font-display font-black text-xs block text-[#0084CC] hover:underline cursor-pointer font-bold"
                            >
                              {match.name}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono leading-none">from {match.island}</span>
                          </div>
                        </div>
                        
                        <p className="text-[10.5px] text-slate-500 italic">
                          "{match.memo}"
                        </p>

                        <button
                          onClick={() => { playSound('beep', isMuted); handleClearForTakeoff(match, myFlight.id); }}
                          className="w-full bg-[#137333] hover:bg-[#0f5d29] text-white font-display font-black py-2 rounded-xl text-[10px] uppercase shadow flex items-center justify-center gap-1 cursor-pointer font-bold border-none"
                        >
                          💚 Clear for Takeoff & Board
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Close Flight Plan Desk */}
              <button
                onClick={() => { playSound('beep', isMuted); handleUpdateStatus(myFlight.id, 'Closed'); }}
                className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-display font-black py-3 rounded-2xl shadow border border-red-200 text-xs text-center block cursor-pointer font-bold"
              >
                ⛔ CLOSE GATE & ARCHIVE FLIGHT RUNWAY
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

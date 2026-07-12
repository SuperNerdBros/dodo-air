/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import { Compass, Ticket, Plane, BookOpen, Eye, Users } from 'lucide-react';
import { ChatterMessage, Passport, UserProfile } from '../types.js';
import { playSound } from '../utils/audio.js';

interface RadioTabProps {
  totalStandby: number;
  totalPassengers: number;
  totalPilots: number;
  totalPassports: number;
  views: number;
  visitors: number;
  chatter: ChatterMessage[];
  chatSender: string;
  setChatSender: (val: string) => void;
  chatIsland: string;
  setChatIsland: (val: string) => void;
  chatText: string;
  setChatText: (val: string) => void;
  handlePostChat: (e: React.FormEvent) => void;
  isPostingChat: boolean;
  profiles: Record<string, UserProfile>;
  openProfileModal: (friendCode: string) => void;
  setCurrentTab: (tab: 'book' | 'hub' | 'radio') => void;
  setShowPassportDrawer: (show: boolean) => void;
  setIsEditingPassport: (show: boolean) => void;
  setShowFuelModal: (show: boolean) => void;
  passport: Passport;
  isMuted: boolean;
}

export const RadioTab: React.FC<RadioTabProps> = ({
  totalStandby,
  totalPassengers,
  totalPilots,
  totalPassports,
  views,
  visitors,
  chatter,
  chatSender,
  setChatSender,
  chatIsland,
  setChatIsland,
  chatText,
  setChatText,
  handlePostChat,
  isPostingChat,
  profiles,
  openProfileModal,
  setCurrentTab,
  setShowPassportDrawer,
  setIsEditingPassport,
  setShowFuelModal,
  passport,
  isMuted
}) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat feed to the bottom whenever chatter updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatter]);

  return (
    <div className="space-y-5">
      
      {/* DODO FLIGHT RADAR & TRAFFIC CONTROL BOARD */}
      <div id="dal-traffic-control-panel" className="w-full bg-white border-2 border-[#E6DFC7] rounded-[32px] p-4 lg:p-5 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-dashed border-[#E6DFC7] pb-3 text-left">
          <div>
            <h2 className="font-display font-black text-sm text-[#0084CC] tracking-wide flex items-center gap-1.5 uppercase font-bold">
              <span className="animate-pulse">📡</span> DAL Traffic Control & Radar Center
            </h2>
            <p className="text-[10px] text-slate-500 font-mono">
              Real-time network telemetries for all active islanders, hosts, and travelers.
            </p>
          </div>
          <div className="flex items-center gap-1.5 self-start sm:self-center">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-mono font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 font-bold">
              Lounge Radar Live
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 text-left">
          {/* Stat 1: Standby Queue */}
          <div 
            id="stat-standbys"
            onClick={() => {
              playSound('beep', isMuted);
              setCurrentTab('book');
              setTimeout(() => {
                const element = document.getElementById('standby-lounge-section');
                if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 150);
            }}
            className="bg-sky-50/50 hover:bg-sky-50 border-2 border-sky-100 hover:border-sky-300 rounded-2xl p-3.5 transition-all cursor-pointer group shadow-xs relative overflow-hidden"
            title="Click to view standby lounge passengers"
          >
            <div className="absolute right-2 top-2 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <Compass className="w-12 h-12 text-sky-500" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🛋️</span>
              <span className="font-display font-black text-[11px] text-sky-800 uppercase tracking-wide font-bold">
                Standby
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono font-black text-2xl text-sky-900 leading-none font-bold">
                {totalStandby}
              </span>
              <span className="text-[9px] font-mono text-sky-600 font-bold uppercase">
                Queue
              </span>
            </div>
            <p className="text-[9.5px] text-slate-500 leading-snug mt-1 font-sans font-semibold">
              Active travelers waiting on the standby list.
            </p>
          </div>

          {/* Stat 2: Checked-In Passengers */}
          <div 
            id="stat-passengers"
            onClick={() => {
              playSound('beep', isMuted);
              setCurrentTab('book');
              setTimeout(() => {
                const element = document.getElementById('active-departures-section');
                if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 150);
            }}
            className="bg-amber-50/40 hover:bg-amber-50 border-2 border-amber-100 hover:border-amber-300 rounded-2xl p-3.5 transition-all cursor-pointer group shadow-xs relative overflow-hidden"
            title="Click to view active flight departures"
          >
            <div className="absolute right-2 top-2 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <Ticket className="w-12 h-12 text-amber-500" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🎟️</span>
              <span className="font-display font-black text-[11px] text-amber-800 uppercase tracking-wide font-bold">
                Passengers
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono font-black text-2xl text-amber-900 leading-none font-bold">
                {totalPassengers}
              </span>
              <span className="text-[9px] font-mono text-amber-600 font-bold uppercase">
                Boarded
              </span>
            </div>
            <p className="text-[9.5px] text-slate-500 leading-snug mt-1 font-sans font-semibold">
              Seaplane passengers boarded on active flights.
            </p>
          </div>

          {/* Stat 3: Pilots (Hosts) */}
          <div 
            id="stat-pilots"
            onClick={() => {
              playSound('beep', isMuted);
              setCurrentTab('hub');
            }}
            className="bg-emerald-50/40 hover:bg-emerald-50 border-2 border-emerald-100 hover:border-emerald-300 rounded-2xl p-3.5 transition-all cursor-pointer group shadow-xs relative overflow-hidden"
            title="Click to manage or host flight plans"
          >
            <div className="absolute right-2 top-2 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <Plane className="w-12 h-12 text-emerald-500" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">👨‍✈️</span>
              <span className="font-display font-black text-[11px] text-emerald-800 uppercase tracking-wide font-bold">
                Pilots
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono font-black text-2xl text-emerald-900 leading-none font-bold">
                {totalPilots}
              </span>
              <span className="text-[9px] font-mono text-emerald-600 font-bold uppercase">
                Hosts
              </span>
            </div>
            <p className="text-[9.5px] text-slate-500 leading-snug mt-1 font-sans font-semibold">
              Islanders hosting active flight plans right now.
            </p>
          </div>

          {/* Stat 4: Registered Passports */}
          <div 
            id="stat-passports"
            onClick={() => {
              playSound('beep', isMuted);
              if (passport.hasCreated) {
                setShowPassportDrawer(true);
              } else {
                setIsEditingPassport(true);
              }
            }}
            className="bg-[#FFFCEF]/50 hover:bg-[#FFFCEF] border-2 border-[#E6DFC7] hover:border-amber-400 rounded-2xl p-3.5 transition-all cursor-pointer group shadow-xs relative overflow-hidden"
            title="Click to view or edit your flyer passport"
          >
            <div className="absolute right-2 top-2 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <BookOpen className="w-12 h-12 text-amber-600" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">📖</span>
              <span className="font-display font-black text-[11px] text-amber-900 uppercase tracking-wide font-bold">
                Passports
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono font-black text-2xl text-amber-950 leading-none font-bold">
                {totalPassports}
              </span>
              <span className="text-[9px] font-mono text-amber-700 font-bold uppercase">
                Printed
              </span>
            </div>
            <p className="text-[9.5px] text-slate-500 leading-snug mt-1 font-sans font-semibold">
              Islanders printed in our Dodo passport registry.
            </p>
          </div>

          {/* Stat 5: Page Views */}
          <div 
            id="stat-views"
            onClick={() => {
              playSound('beep', isMuted);
            }}
            className="bg-rose-50/40 hover:bg-rose-50 border-2 border-rose-100 hover:border-rose-300 rounded-2xl p-3.5 transition-all cursor-pointer group shadow-xs relative overflow-hidden"
            title="Total airport terminal page views"
          >
            <div className="absolute right-2 top-2 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <Eye className="w-12 h-12 text-rose-500" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">👀</span>
              <span className="font-display font-black text-[11px] text-rose-800 uppercase tracking-wide font-bold">
                Views
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono font-black text-2xl text-rose-900 leading-none font-bold">
                {views}
              </span>
              <span className="text-[9px] font-mono text-rose-600 font-bold uppercase">
                Loads
              </span>
            </div>
            <p className="text-[9.5px] text-slate-500 leading-snug mt-1 font-sans font-semibold">
              Total airport terminal page loads recorded.
            </p>
          </div>

          {/* Stat 6: Unique Visitors */}
          <div 
            id="stat-visitors"
            onClick={() => {
              playSound('beep', isMuted);
            }}
            className="bg-violet-50/40 hover:bg-violet-50 border-2 border-violet-100 hover:border-violet-300 rounded-2xl p-3.5 transition-all cursor-pointer group shadow-xs relative overflow-hidden"
            title="Unique visitor devices"
          >
            <div className="absolute right-2 top-2 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <Users className="w-12 h-12 text-violet-500" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">👥</span>
              <span className="font-display font-black text-[11px] text-violet-800 uppercase tracking-wide font-bold">
                Visitors
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono font-black text-2xl text-violet-900 leading-none font-bold">
                {visitors}
              </span>
              <span className="text-[9px] font-mono text-violet-600 font-bold uppercase">
                Flyers
              </span>
            </div>
            <p className="text-[9.5px] text-slate-500 leading-snug mt-1 font-sans font-semibold">
              Unique traveler devices connected to terminal.
            </p>
          </div>
        </div>
      </div>

      {/* Terminal Tower Radio Chat Feed */}
      <div className="max-w-xl mx-auto bg-white rounded-[36px] border-4 border-[#0084CC]/10 p-5 shadow-sm flex flex-col">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 text-left">
          <div className="flex items-center gap-2">
            <span className="text-xl">📻</span>
            <div>
              <h2 className="text-base font-black text-[#0084CC] font-display font-bold">DAL Terminal Tower Radio</h2>
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest mt-0.5 block">RADIO OVER THE AIRWAVES</span>
            </div>
          </div>
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full text-[8.5px] font-mono font-black uppercase font-bold">
            ACTIVE
          </span>
        </div>

        {/* Chat feed box */}
        <div ref={chatContainerRef} className="space-y-3.5 max-h-[380px] overflow-y-auto mb-4 pr-1 text-left">
          {chatter.map((msg) => {
            const isOrville = msg.type === 'orville';
            const isWilbur = msg.type === 'wilbur';
            const isSystem = msg.type === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="text-[10px] text-slate-500 bg-[#FAF8F2] border border-[#E6DFC7]/50 p-2 rounded-xl text-center font-mono font-bold leading-normal">
                  {msg.text}
                </div>
              );
            }

            if (isOrville || isWilbur) {
              return (
                <div key={msg.id} className="flex gap-2.5 items-start">
                  <div className="w-8 h-8 rounded-full bg-[#EBF8FF] border border-[#0084CC]/20 flex-shrink-0 flex items-center justify-center text-lg shadow-xs">
                    {isOrville ? '🦤' : '🕶️'}
                  </div>
                  <div className="flex-1 bg-[#F0F9FF] border-2 border-[#0084CC]/20 rounded-2xl p-2.5 text-xs text-[#4A4A4A]">
                    <span className="font-display font-black text-[#0084CC] text-[10px] block mb-0.5 font-bold">
                      {msg.sender}
                    </span>
                    <p className="font-sans font-semibold leading-relaxed text-left">{msg.text}</p>
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className="flex gap-2.5 items-start">
                <div className="w-8 h-8 rounded-full bg-[#FFF9E7] border border-[#FFCC00] text-[#006094] flex-shrink-0 flex items-center justify-center text-xs font-black shadow-xs font-bold">
                  {msg.sender.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 bg-white border-2 border-slate-100 rounded-2xl p-2.5 text-xs text-[#4A4A4A]">
                  <span className="font-display font-black text-[#0084CC] text-[10px] block mb-0.5">
                    <span 
                      onClick={() => {
                        const p = (Object.values(profiles) as UserProfile[]).find(
                          prof => prof.villagerName.toLowerCase() === msg.sender.toLowerCase() && 
                                  (msg.island ? prof.islandName.toLowerCase() === msg.island.toLowerCase() : true)
                        );
                        if (p) {
                          openProfileModal(p.friendCode);
                        } else {
                          openProfileModal(`SW-TEMP-${msg.sender}-${msg.island || 'Home'}`);
                        }
                      }}
                      className="hover:underline cursor-pointer font-black text-[#0084CC] font-bold"
                      title="View chat user profile"
                    >
                      {msg.sender}
                    </span>
                    {msg.island && <span className="text-slate-400 font-mono text-[8.5px] font-bold"> from '{msg.island}'</span>}
                    {(() => {
                      const p = (Object.values(profiles) as UserProfile[]).find(
                        prof => prof.villagerName.toLowerCase() === msg.sender.toLowerCase() && 
                                (msg.island ? prof.islandName.toLowerCase() === msg.island.toLowerCase() : true)
                      );
                      if (p) {
                        return (
                          <span className="inline-flex items-center gap-0.5 text-[8px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full px-1.5 py-0.1 font-black ml-1.5 font-bold">
                            🍏 {p.goodApples || 0}
                            {p.rottenTurnips > 0 && (
                              <span className="text-rose-700 font-bold">|🧅 {p.rottenTurnips}</span>
                            )}
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </span>
                  <p className="font-sans leading-relaxed text-left font-semibold">{msg.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat Input form */}
        <form onSubmit={handlePostChat} className="border-t border-slate-100 pt-4 text-xs space-y-3 text-left">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[8px] uppercase font-mono font-black text-[#0084CC] mb-0.5 font-bold">VILLAGER CALLSIGN</label>
              <input
                type="text"
                value={chatSender}
                onChange={(e) => setChatSender(e.target.value)}
                placeholder="Your Name"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold outline-none"
                maxLength={14}
              />
            </div>
            <div>
              <label className="block text-[8px] uppercase font-mono font-black text-[#0084CC] mb-0.5 font-bold">ISLAND ID</label>
              <input
                type="text"
                value={chatIsland}
                onChange={(e) => setChatIsland(e.target.value)}
                placeholder="Island Name"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold outline-none"
                maxLength={14}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              placeholder={chatSender ? "Submit airport chatter dispatch..." : "Register name above to chat"}
              disabled={!chatSender.trim()}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:bg-white"
              maxLength={100}
            />
            <button
              type="submit"
              disabled={!chatSender.trim() || !chatText.trim() || isPostingChat}
              className="bg-[#0084CC] hover:bg-[#006094] disabled:opacity-40 text-white px-4.5 rounded-xl font-display font-black uppercase text-xs flex items-center justify-center flex-shrink-0 cursor-pointer font-bold border-none"
            >
              Send
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

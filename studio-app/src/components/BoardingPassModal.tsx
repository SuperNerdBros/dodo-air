/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ticket, X, AlertCircle } from 'lucide-react';
import { Flight, Passport } from '../types.js';
import { playSound } from '../utils/audio.js';
import { PLANE_COLORS } from '../utils/constants.js';

interface BoardingPassModalProps {
  selectedFlight: Flight | undefined;
  onClose: () => void;
  passport: Passport;
  onBoardFlight: (flightId: string) => void;
  onLeaveFlight: (flightId: string, passengerId: string) => void;
  boardingError: string;
  isMuted: boolean;
  onRequestStandby: (gate: number) => void;
}

export const BoardingPassModal: React.FC<BoardingPassModalProps> = ({
  selectedFlight,
  onClose,
  passport,
  onBoardFlight,
  onLeaveFlight,
  boardingError,
  isMuted,
  onRequestStandby
}) => {
  if (!selectedFlight) return null;

  const passengersList = selectedFlight.passengers || [];
  const passengerIndex = passengersList.findIndex(p => 
    p.friendCode 
      ? p.friendCode === passport.friendCode 
      : p.name.toLowerCase() === passport.villagerName.toLowerCase()
  );
  const isPassengerCheckedIn = passengerIndex !== -1;
  
  // Deterministic sequential seat and boarding calculation
  const seatNum = isPassengerCheckedIn ? (passengerIndex + 1) : (passengersList.length + 1);
  const seatLetter = ['A', 'B', 'C', 'D'][seatNum % 4];
  const seatAssigned = `${String(seatNum).padStart(2, '0')}${seatLetter}`;
  const boardingNumVal = `#DAL-${selectedFlight.id.replace('DAL-', '')}-${String(seatNum).padStart(2, '0')}`;
  
  const planeColorObj = PLANE_COLORS.find(pc => pc.id === (selectedFlight.planeColor || 'orange')) || PLANE_COLORS[0];
  const capacity = selectedFlight.capacity || (selectedFlight.planeType === 'Switch 2' ? 12 : 8);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-[#006094]/40 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="bg-white rounded-[36px] border-4 border-[#0084CC] max-w-2xl w-full shadow-2xl relative overflow-hidden text-[#4A4A4A] my-8"
        >
          {/* Ticket Perforated top stub divider effect */}
          <div className="bg-[#0084CC] text-white p-4 font-display font-black flex items-center justify-between border-b-4 border-dashed border-[#006094]">
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-[#FFCC00]" />
              <span className="font-bold">OFFICIAL DAL BOARDING PASS</span>
            </div>
            <button
              onClick={() => { playSound('beep', isMuted); onClose(); }}
              className="p-1 rounded-full bg-[#006094] hover:bg-[#004d75] transition-all border-none cursor-pointer"
            >
              <X className="w-4 h-4 text-[#FFCC00]" />
            </button>
          </div>

          <div className="p-5 flex flex-col md:flex-row gap-5 items-stretch text-[#4A4A4A]">
            {/* Passenger Boarding stub (Left Side) */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[8px] font-mono text-slate-400 uppercase font-black tracking-wider leading-none">PASSENGER NAME</span>
                  <span className="text-sm font-display font-black text-slate-700 mt-1 block font-bold">
                    {passport.hasCreated ? passport.villagerName : "GUEST PASSENGER"}
                  </span>
                </div>
                <div>
                  <span className="block text-[8px] font-mono text-slate-400 uppercase font-black tracking-wider leading-none">SEAPLANE FLIGHT</span>
                  <span className="text-sm font-mono font-black text-[#0084CC] mt-1 block font-bold">
                    {selectedFlight.id}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[8px] font-mono text-slate-400 uppercase font-black tracking-wider leading-none">DEPARTURE PORT</span>
                  <span className="text-xs font-bold text-slate-700 mt-1 block">
                    🏝️ {passport.hasCreated ? passport.islandName : "HOME PORT"}
                  </span>
                </div>
                <div>
                  <span className="block text-[8px] font-mono text-slate-400 uppercase font-black tracking-wider leading-none">DESTINATION ISLAND</span>
                  <span className="text-xs font-bold text-[#0084CC] mt-1 block">
                    🏝️ {selectedFlight.islandName} (Host {selectedFlight.hostName})
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-[#FAF8F2] p-2.5 rounded-2xl border border-[#E6DFC7]">
                <div className="text-center border-r border-[#E6DFC7]/60">
                  <span className="block text-[7.5px] font-mono text-slate-400 font-bold leading-none">GATE</span>
                  <span className="text-sm font-black text-[#0084CC] leading-none mt-1 block font-bold">{selectedFlight.gate}</span>
                </div>
                <div className="text-center border-r border-[#E6DFC7]/60">
                  <span className="block text-[7.5px] font-mono text-slate-400 font-bold leading-none">SEAT ASSIGNED</span>
                  <span className="text-sm font-mono font-black text-slate-700 leading-none mt-1 block font-bold">{seatAssigned}</span>
                </div>
                <div className="text-center">
                  <span className="block text-[7.5px] font-mono text-slate-400 font-bold leading-none">STATUS</span>
                  <span className="text-[10px] font-mono font-black text-amber-600 leading-none mt-1 block uppercase font-bold">{selectedFlight.status}</span>
                </div>
              </div>

              {/* Livery details display on stub */}
              <div className="flex items-center gap-2 bg-[#FAF8F2] px-3 py-2 rounded-2xl border border-[#E6DFC7]/50 text-[10px]">
                <span className="text-lg">✈️</span>
                <div>
                  <span className="font-bold text-slate-700">{selectedFlight.planeType || 'Switch'} Model Seaplane</span>
                  <span className="text-[8.5px] font-mono block font-semibold" style={{ color: planeColorObj.hex }}>
                    ● Registered {planeColorObj.name} Livery
                  </span>
                </div>
              </div>

              {/* Dodo Code Security and check-in */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
                {isPassengerCheckedIn ? (
                  /* Checked-in boarded passenger code reveal */
                  <div className="w-full space-y-2">
                    <div className="bg-[#E6F4EA] border-2 border-[#137333] p-3 rounded-2xl text-center animate-fade-in">
                      <span className="block text-[8px] font-mono text-[#137333] font-black uppercase tracking-wider">BOARDED SEAPLANE - DODO CODE</span>
                      <span className="text-2xl font-mono font-black text-[#137333] tracking-widest mt-0.5 block uppercase font-bold">
                        {selectedFlight.dodoCode}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const p = selectedFlight.passengers.find(pass => 
                            pass.friendCode 
                              ? pass.friendCode === passport.friendCode 
                              : pass.name.toLowerCase() === passport.villagerName.toLowerCase()
                          );
                          if (p) onLeaveFlight(selectedFlight.id, p.id);
                        }}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-mono font-bold text-xs py-2 rounded-xl border border-slate-200 transition-all active:scale-95 text-center font-black cursor-pointer font-bold"
                      >
                        👋 Return back home / Clear seat
                      </button>
                    </div>
                  </div>
                ) : passengersList.length >= capacity ? (
                  /* Seaplane is full - offer standby options */
                  <div className="w-full bg-amber-50 border border-amber-200/60 p-3.5 rounded-2xl space-y-2.5">
                    <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                      <span className="text-sm">⚠️</span>
                      <span className="text-[9.5px] font-mono font-black uppercase tracking-wider">SEAPLANE FLIGHT IS FULL</span>
                    </div>
                    <p className="text-[10.5px] text-slate-600 leading-relaxed font-semibold">
                      Oh, bummer! All <strong>{capacity}</strong> seats on this {selectedFlight.planeType || 'Switch'} seaplane are taken. Check-in is currently unavailable.
                    </p>
                    <button
                      type="button"
                      onClick={() => onRequestStandby(selectedFlight.gate)}
                      className="w-full bg-[#FF9F43] hover:bg-[#ff8f24] text-white font-mono font-black py-2 rounded-xl text-[10px] uppercase shadow transition-all flex items-center justify-center gap-1 cursor-pointer font-bold"
                    >
                      🛋️ FILE STANDBY TICKET ON RADAR
                    </button>
                  </div>
                ) : (
                  /* Needs Check-In first */
                  <div className="w-full space-y-2">
                    {boardingError && (
                      <p className="text-xs font-bold text-red-600 flex items-center gap-1 mb-1 font-mono">
                        <AlertCircle className="w-3.5 h-3.5" /> {boardingError}
                      </p>
                    )}
                    <p className="text-[10.5px] text-[#4A4A4A]/70 leading-relaxed font-sans mb-1 text-center sm:text-left font-semibold">
                      🦤 <strong>Orville:</strong> "Step up to the counter! Book your Boarding Pass on Flight <strong>{selectedFlight.id}</strong> to receive clearance and the Dodo Code."
                    </p>
                    <button
                      onClick={() => onBoardFlight(selectedFlight.id)}
                      disabled={selectedFlight.status === 'Closed' || selectedFlight.status === 'Departed'}
                      className="w-full bg-[#FFCC00] hover:bg-[#FFD11A] disabled:opacity-50 text-[#006094] font-display font-black py-3 px-4 rounded-xl shadow border-b-4 border-[#CC9900] text-center text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer font-bold"
                    >
                      <Ticket className="w-4 h-4" />
                      BOARD SEAPLANE (GET DODO CODE™)
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Barcode / Stub section (Right Side) */}
            <div className="md:w-44 border-t md:border-t-0 md:border-l-2 border-slate-100 pt-4 md:pt-0 md:pl-4 flex flex-col justify-between items-center text-center">
              <div className="space-y-1">
                <span className="text-[7px] font-mono text-slate-400 font-bold block uppercase tracking-wide">BOARDING NUMBER</span>
                <span className="font-mono text-xs font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md font-bold">
                  {boardingNumVal}
                </span>
              </div>

              {/* Simulation Barcode */}
              <div className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-100 my-3 flex flex-col items-center justify-center">
                <div className="h-10 w-full flex gap-0.5 justify-center items-stretch select-none">
                  {[1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 1, 4].map((width, idx) => (
                    <div key={idx} className="bg-slate-700" style={{ width: `${width}px` }} />
                  ))}
                </div>
                <span className="font-mono text-[7px] text-slate-400 mt-1 block">DODO AIRLINES INC</span>
              </div>

              <span className="text-[10px] text-slate-400 font-semibold italic leading-snug">
                *Please leave through airport gates!
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

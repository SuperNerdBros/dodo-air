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
	const passengerIndex = passengersList.findIndex((p) =>
		p.friendCode
			? p.friendCode === passport.friendCode
			: p.name.toLowerCase() === passport.villagerName.toLowerCase()
	);
	const isPassengerCheckedIn = passengerIndex !== -1;

	// Deterministic sequential seat and boarding calculation
	const seatNum = isPassengerCheckedIn ? passengerIndex + 1 : passengersList.length + 1;
	const seatLetter = ['A', 'B', 'C', 'D'][seatNum % 4];
	const seatAssigned = `${String(seatNum).padStart(2, '0')}${seatLetter}`;
	const boardingNumVal = `#DAL-${selectedFlight.id.replace('DAL-', '')}-${String(seatNum).padStart(2, '0')}`;

	const planeColorObj =
		PLANE_COLORS.find((pc) => pc.id === (selectedFlight.planeColor || 'orange')) || PLANE_COLORS[0];
	const capacity = selectedFlight.capacity || (selectedFlight.planeType === 'Switch 2' ? 12 : 8);

	return (
		<AnimatePresence>
			<div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#006094]/40 p-4 backdrop-blur-md">
				<motion.div
					initial={{ scale: 0.95, opacity: 0, y: 15 }}
					animate={{ scale: 1, opacity: 1, y: 0 }}
					exit={{ scale: 0.95, opacity: 0, y: 15 }}
					className="relative my-8 w-full max-w-2xl overflow-hidden rounded-[36px] border-4 border-[#0084CC] bg-white text-[#4A4A4A] shadow-2xl"
				>
					{/* Ticket Perforated top stub divider effect */}
					<div className="font-display flex items-center justify-between border-b-4 border-dashed border-[#006094] bg-[#0084CC] p-4 font-black text-white">
						<div className="flex items-center gap-2">
							<Ticket className="h-5 w-5 text-[#FFCC00]" />
							<span className="font-bold">UNOFFICIAL DAL BOARDING PASS</span>
						</div>
						<button
							onClick={() => {
								playSound('beep', isMuted);
								onClose();
							}}
							className="cursor-pointer rounded-full border-none bg-[#006094] p-1 transition-all hover:bg-[#004d75]"
						>
							<X className="h-4 w-4 text-[#FFCC00]" />
						</button>
					</div>

					<div className="flex flex-col items-stretch gap-5 p-5 text-[#4A4A4A] md:flex-row">
						{/* Passenger Boarding stub (Left Side) */}
						<div className="flex-1 space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<span className="block font-mono text-[8px] font-black uppercase leading-none tracking-wider text-slate-400">
										PASSENGER NAME
									</span>
									<span className="font-display mt-1 block text-sm font-black font-bold text-slate-700">
										{passport.hasCreated ? passport.villagerName : 'GUEST PASSENGER'}
									</span>
								</div>
								<div>
									<span className="block font-mono text-[8px] font-black uppercase leading-none tracking-wider text-slate-400">
										SEAPLANE FLIGHT
									</span>
									<span className="mt-1 block font-mono text-sm font-black font-bold text-[#0084CC]">
										{selectedFlight.id}
									</span>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<span className="block font-mono text-[8px] font-black uppercase leading-none tracking-wider text-slate-400">
										DEPARTURE PORT
									</span>
									<span className="mt-1 block text-xs font-bold text-slate-700">
										🏝️ {passport.hasCreated ? passport.islandName : 'HOME PORT'}
									</span>
								</div>
								<div>
									<span className="block font-mono text-[8px] font-black uppercase leading-none tracking-wider text-slate-400">
										DESTINATION ISLAND
									</span>
									<span className="mt-1 block text-xs font-bold text-[#0084CC]">
										🏝️ {selectedFlight.islandName} (Host {selectedFlight.hostName})
									</span>
								</div>
							</div>

							<div className="grid grid-cols-3 gap-2 rounded-2xl border border-[#E6DFC7] bg-[#FAF8F2] p-2.5">
								<div className="border-r border-[#E6DFC7]/60 text-center">
									<span className="block font-mono text-[7.5px] font-bold leading-none text-slate-400">
										GATE
									</span>
									<span className="mt-1 block text-sm font-black font-bold leading-none text-[#0084CC]">
										{selectedFlight.gate}
									</span>
								</div>
								<div className="border-r border-[#E6DFC7]/60 text-center">
									<span className="block font-mono text-[7.5px] font-bold leading-none text-slate-400">
										SEAT ASSIGNED
									</span>
									<span className="mt-1 block font-mono text-sm font-black font-bold leading-none text-slate-700">
										{seatAssigned}
									</span>
								</div>
								<div className="text-center">
									<span className="block font-mono text-[7.5px] font-bold leading-none text-slate-400">
										STATUS
									</span>
									<span className="mt-1 block font-mono text-[10px] font-black font-bold uppercase leading-none text-amber-600">
										{selectedFlight.status}
									</span>
								</div>
							</div>

							{/* Livery details display on stub */}
							<div className="flex items-center gap-2 rounded-2xl border border-[#E6DFC7]/50 bg-[#FAF8F2] px-3 py-2 text-[10px]">
								<span className="text-lg">✈️</span>
								<div>
									<span className="font-bold text-slate-700">
										{selectedFlight.planeType || 'Switch'} Model Seaplane
									</span>
									<span
										className="block font-mono text-[8.5px] font-semibold"
										style={{ color: planeColorObj.hex }}
									>
										● Registered {planeColorObj.name} Livery
									</span>
								</div>
							</div>

							{/* Dodo Code Security and check-in */}
							<div className="flex flex-col items-center gap-3 border-t border-slate-100 pt-3 sm:flex-row">
								{isPassengerCheckedIn ? (
									/* Checked-in boarded passenger code reveal */
									<div className="w-full space-y-2">
										<div className="animate-fade-in rounded-2xl border-2 border-[#137333] bg-[#E6F4EA] p-3 text-center">
											<span className="block font-mono text-[8px] font-black uppercase tracking-wider text-[#137333]">
												BOARDED SEAPLANE - DODO CODE
											</span>
											<span className="mt-0.5 block font-mono text-2xl font-black font-bold uppercase tracking-widest text-[#137333]">
												{selectedFlight.dodoCode}
											</span>
										</div>
										<div className="flex gap-2">
											<button
												onClick={() => {
													const p = selectedFlight.passengers.find((pass) =>
														pass.friendCode
															? pass.friendCode === passport.friendCode
															: pass.name.toLowerCase() === passport.villagerName.toLowerCase()
													);
													if (p) onLeaveFlight(selectedFlight.id, p.id);
												}}
												className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-100 py-2 text-center font-mono text-xs font-black font-bold font-bold text-slate-500 transition-all hover:bg-slate-200 active:scale-95"
											>
												👋 Return back home / Clear seat
											</button>
										</div>
									</div>
								) : passengersList.length >= capacity ? (
									/* Seaplane is full - offer standby options */
									<div className="w-full space-y-2.5 rounded-2xl border border-amber-200/60 bg-amber-50 p-3.5">
										<div className="flex items-center gap-1.5 font-bold text-amber-800">
											<span className="text-sm">⚠️</span>
											<span className="font-mono text-[9.5px] font-black uppercase tracking-wider">
												SEAPLANE FLIGHT IS FULL
											</span>
										</div>
										<p className="text-[10.5px] font-semibold leading-relaxed text-slate-600">
											Oh, bummer! All <strong>{capacity}</strong> seats on this{' '}
											{selectedFlight.planeType || 'Switch'} seaplane are taken. Check-in is
											currently unavailable.
										</p>
										<button
											type="button"
											onClick={() => onRequestStandby(selectedFlight.gate)}
											className="flex w-full cursor-pointer items-center justify-center gap-1 rounded-xl bg-[#FF9F43] py-2 font-mono text-[10px] font-black font-bold uppercase text-white shadow transition-all hover:bg-[#ff8f24]"
										>
											🛋️ FILE STANDBY TICKET ON RADAR
										</button>
									</div>
								) : (
									/* Needs Check-In first */
									<div className="w-full space-y-2">
										{boardingError && (
											<p className="mb-1 flex items-center gap-1 font-mono text-xs font-bold text-red-600">
												<AlertCircle className="h-3.5 w-3.5" /> {boardingError}
											</p>
										)}
										<p className="mb-1 text-center font-sans text-[10.5px] font-semibold leading-relaxed text-[#4A4A4A]/70 sm:text-left">
											🦤 <strong>Orville:</strong> "Step up to the counter! Book your Boarding Pass
											on Flight <strong>{selectedFlight.id}</strong> to receive clearance and the
											Dodo Code."
										</p>
										<button
											onClick={() => onBoardFlight(selectedFlight.id)}
											disabled={
												selectedFlight.status === 'Closed' || selectedFlight.status === 'Departed'
											}
											className="font-display flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border-b-4 border-[#CC9900] bg-[#FFCC00] px-4 py-3 text-center text-xs font-black font-bold text-[#006094] shadow transition-all hover:bg-[#FFD11A] active:scale-95 disabled:opacity-50"
										>
											<Ticket className="h-4 w-4" />
											BOARD SEAPLANE (GET DODO CODE™)
										</button>
									</div>
								)}
							</div>
						</div>

						{/* Barcode / Stub section (Right Side) */}
						<div className="flex flex-col items-center justify-between border-t border-slate-100 pt-4 text-center md:w-44 md:border-l-2 md:border-t-0 md:pl-4 md:pt-0">
							<div className="space-y-1">
								<span className="block font-mono text-[7px] font-bold uppercase tracking-wide text-slate-400">
									BOARDING NUMBER
								</span>
								<span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-black font-bold text-slate-700">
									{boardingNumVal}
								</span>
							</div>

							{/* Simulation Barcode */}
							<div className="my-3 flex w-full flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50 p-2.5">
								<div className="flex h-10 w-full select-none items-stretch justify-center gap-0.5">
									{[1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 1, 4].map((width, idx) => (
										<div key={idx} className="bg-slate-700" style={{ width: `${width}px` }} />
									))}
								</div>
								<span className="mt-1 block font-mono text-[7px] text-slate-400">
									DODO AIRLINES INC
								</span>
							</div>

							<span className="text-[10px] font-semibold italic leading-snug text-slate-400">
								*Please leave through airport gates!
							</span>
						</div>
					</div>
				</motion.div>
			</div>
		</AnimatePresence>
	);
};

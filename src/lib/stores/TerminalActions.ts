import { dalStore } from './dal.svelte';
import { TerminalAPI } from '../api/TerminalAPI';
import type { FlightStatus, StandbyRequest } from '../studio-types';

export const TerminalActions = {
	async hostFlight(e: Event) {
		e.preventDefault();
		dalStore.formError = '';
		if (!dalStore.passport.hasCreated) {
			dalStore.formError = 'Please save your Frequent Flyer Passport first!';
			dalStore.playSound('beep');
			return;
		}
		let cleanDodo = '';
		if (dalStore.formDodo.trim()) {
			cleanDodo = dalStore.formDodo.toUpperCase().replace(/[^A-Z0-9]/g, '');
			if (cleanDodo.length !== 5) {
				dalStore.formError = 'Dodo Code must be exactly 5 characters (A-Z, 0-9).';
				dalStore.playSound('beep');
				return;
			}
		}
		dalStore.isSubmittingHost = true;
		try {
			const pendingSchedules = (e as any).pendingSchedules || [];
			
			const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
			const todayStr = days[new Date().getDay()];

			let createdFlights: any[] = [];

			if (pendingSchedules && pendingSchedules.length > 0) {
				for (const schedule of pendingSchedules) {
					let scheduledTimeStr = `${schedule.startTime} - ${schedule.endTime}`;
					if (schedule.day !== todayStr) {
						scheduledTimeStr = `${schedule.day} ${scheduledTimeStr}`;
					}
					
					const newFlight = await TerminalAPI.hostFlight({
						hostName: dalStore.passport.villagerName,
						islandName: dalStore.passport.islandName,
						dodoCode: cleanDodo,
						hemisphere: dalStore.formHemisphere,
						gate: Number(dalStore.formGate),
						description:
							dalStore.formDesc.trim() ||
							`Welcome to ${dalStore.passport.islandName}! Come over and relax! 🌴`,
						planeType: dalStore.formPlaneType,
						planeColor: dalStore.passport.planeColor || 'orange',
						hostFriendCode: dalStore.passport.friendCode,
						hostUserId: dalStore.passport.userId,
						milesCost: Number(dalStore.formMilesCost),
						flightNumber: dalStore.passport.flightNumber,
						scheduledTime: scheduledTimeStr
					});
					createdFlights.push(newFlight);
				}
			} else {
				const newFlight = await TerminalAPI.hostFlight({
					hostName: dalStore.passport.villagerName,
					islandName: dalStore.passport.islandName,
					dodoCode: cleanDodo,
					hemisphere: dalStore.formHemisphere,
					gate: Number(dalStore.formGate),
					description:
						dalStore.formDesc.trim() ||
						`Welcome to ${dalStore.passport.islandName}! Come over and relax! 🌴`,
					planeType: dalStore.formPlaneType,
					planeColor: dalStore.passport.planeColor || 'orange',
					hostFriendCode: dalStore.passport.friendCode,
					hostUserId: dalStore.passport.userId,
					milesCost: Number(dalStore.formMilesCost),
					flightNumber: dalStore.passport.flightNumber,
					scheduledTime: ''
				});
				createdFlights.push(newFlight);
			}

			// If the event provided pending schedules, sync them now
			if (pendingSchedules !== undefined) {
				const pendingIds = pendingSchedules.map((s: any) => s.id);

				// Delete removed schedules
				for (const oldSchedule of dalStore.mySchedules) {
					if (!pendingIds.includes(oldSchedule.id)) {
						await TerminalActions.deleteSchedule(oldSchedule.id);
					}
				}

				// Add new schedules (only those with tmp_ prefix)
				for (const schedule of pendingSchedules) {
					if (schedule.id && String(schedule.id).startsWith('tmp_')) {
						await TerminalActions.addSchedule({
							day: schedule.day,
							startTime: schedule.startTime,
							endTime: schedule.endTime,
							mode: schedule.mode
						});
					}
				}
			}
			// Sort createdFlights chronologically so earliest is first
			const dayMap: { [key: string]: number } = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };
			const todayIdx = new Date().getDay();
			
			const parseTime = (timeStr: string) => {
				const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
				if (!match) return 0;
				let hours = parseInt(match[1]);
				const mins = parseInt(match[2]);
				const ampm = match[3].toUpperCase();
				if (ampm === 'PM' && hours < 12) hours += 12;
				if (ampm === 'AM' && hours === 12) hours = 0;
				return hours * 60 + mins;
			};

			createdFlights.sort((a, b) => {
				const extractData = (str: string) => {
					if (!str) return { relDay: 0, time: 0 };
					let dayStr = todayStr;
					let timePart = str;
					const parts = str.split(' ');
					if (days.includes(parts[0])) {
						dayStr = parts[0];
						timePart = parts.slice(1).join(' ');
					}
					const relDay = (dayMap[dayStr] - todayIdx + 7) % 7;
					const time = parseTime(timePart.split('-')[0]);
					return { relDay, time };
				};
				const dataA = extractData(a.scheduledTime);
				const dataB = extractData(b.scheduledTime);
				if (dataA.relDay !== dataB.relDay) return dataA.relDay - dataB.relDay;
				return dataA.time - dataB.time;
			});

			if (dalStore.systemMode === 'DAL') {
				dalStore.playSound('airplane');
				dalStore.flights = [...createdFlights, ...dalStore.flights];
			} else {
				dalStore.playSound('bell');
				dalStore.dreams = [...createdFlights, ...dalStore.dreams];
			}
			dalStore.selectedFlightId = createdFlights[0].id;
			dalStore.formDodo = '';
			dalStore.formDesc = '';
			dalStore.fetchState();
			dalStore.earnStampProgress('hasHosted');
		} catch (err: any) {
			dalStore.formError = err.error || 'Failed to dispatch seaplane.';
			dalStore.playSound('beep');
		} finally {
			dalStore.isSubmittingHost = false;
		}
	},

	async createStandbyRequest(e: Event) {
		e.preventDefault();
		dalStore.requestError = '';
		if (!dalStore.passport.hasCreated) {
			dalStore.requestError = 'Please save your Frequent Flyer Passport first!';
			dalStore.playSound('beep');
			return;
		}
		dalStore.isSubmittingRequest = true;
		try {
			await TerminalAPI.createStandbyRequest({
				name: dalStore.passport.villagerName,
				island: dalStore.passport.islandName,
				title: `${dalStore.passport.titlePart1} ${dalStore.passport.titlePart2}`,
				avatar: dalStore.passport.avatarIcon,
				friendCode: dalStore.passport.friendCode,
				userId: dalStore.passport.userId || '',
				gateType: Number(dalStore.requestGateType),
				timePreference: dalStore.requestTime,
				memo: dalStore.requestMemo.trim() || 'Looking for an open island gate to visit! 🌴'
			});
			dalStore.playSound('success');
			dalStore.requestMemo = '';
			dalStore.showStandbyModal = false;
			dalStore.fetchState();
			dalStore.earnStampProgress('hasRequested');
		} catch (err: any) {
			dalStore.requestError = err.error || 'Failed to file standby ticket.';
			dalStore.playSound('beep');
		} finally {
			dalStore.isSubmittingRequest = false;
		}
	},

	async removeStandbyRequest(reqId: string) {
		try {
			await TerminalAPI.removeStandbyRequest(reqId);
			dalStore.playSound('beep');
			dalStore.fetchState();
		} catch (err) {
			console.error(err);
		}
	},

	async boardFlight(flightId: string) {
		if (!dalStore.passport.hasCreated) {
			dalStore.playSound('beep');
			alert('Please fill out your Passport first!');
			return;
		}
		dalStore.boardingError = '';
		try {
			await TerminalAPI.boardFlight(flightId, {
				name: dalStore.passport.villagerName,
				island: dalStore.passport.islandName,
				friendCode: dalStore.passport.friendCode,
				userId: dalStore.passport.userId
			});
			dalStore.playSound('success');
			dalStore.revealedCodes = { ...dalStore.revealedCodes, [flightId]: true };
			dalStore.fetchState();
			dalStore.earnStampProgress('hasBoarded');
		} catch (err: any) {
			dalStore.boardingError = err.error || 'Failed to check-in.';
			dalStore.playSound('beep');
		}
	},

	async leaveFlight(flightId: string, passengerId: string) {
		try {
			await TerminalAPI.leaveFlight(flightId, passengerId);
			dalStore.playSound('beep');
			dalStore.fetchState();
		} catch (err) {
			console.error(err);
		}
	},

	async updateStatus(flightId: string, newStatus: FlightStatus, dodoCode?: string) {
		try {
			await TerminalAPI.updateStatus(flightId, newStatus, dodoCode);
			dalStore.playSound('bell');
			if (newStatus === 'Closed' && dalStore.selectedFlightId === flightId) {
				dalStore.selectedFlightId = null;
			}
			dalStore.fetchState();
		} catch (err) {
			console.error(err);
		}
	},

	async clearForTakeoff(request: StandbyRequest, flightId: string) {
		try {
			await TerminalAPI.boardFlight(flightId, {
				name: request.name,
				island: request.island,
				friendCode: request.friendCode,
				userId: request.userId
			});
			await TerminalAPI.removeStandbyRequest(request.id);
			dalStore.playSound('success');

			await TerminalAPI.postChat({
				sender: 'Orville',
				text: `🎉 MATCH MADE! Passenger ${request.name} is cleared for immediate takeoff and flying to ${dalStore.passport.islandName}! Clear skies ahead! 🛩️`
			});
			dalStore.fetchState();
		} catch (err) {
			console.error('Failed to match passenger:', err);
		}
	},

	async postChat(e: Event) {
		e.preventDefault();
		if (
			!dalStore.isLoggedIn ||
			!dalStore.passport.villagerName.trim() ||
			!dalStore.chatText.trim()
		) {
			dalStore.playSound('beep');
			return;
		}
		dalStore.isPostingChat = true;
		try {
			await TerminalAPI.postChat({
				sender: dalStore.passport.villagerName.trim(),
				island: dalStore.passport.islandName.trim() || undefined,
				text: dalStore.chatText.trim()
			});
			dalStore.playSound('chatter');
			dalStore.chatText = '';
			dalStore.fetchState();
			dalStore.earnStampProgress('hasChatted');
		} catch (err) {
			console.error(err);
		} finally {
			dalStore.isPostingChat = false;
		}
	},

	async generateAIReview(flightId: string) {
		dalStore.loadingReviewId = flightId;
		dalStore.playSound('bell');
		try {
			await TerminalAPI.generateAIReview(flightId);
			dalStore.playSound('success');
			dalStore.fetchState();
		} catch (err) {
			console.error('Failed to trigger AI travel review:', err);
		} finally {
			dalStore.loadingReviewId = null;
		}
	},

	async addSchedule(schedule: any) {
		try {
			const res = await fetch('/wp-json/dodo-air/v1/schedules', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(schedule)
			});
			if (res.ok) {
				const data = await res.json();
				dalStore.mySchedules = [...dalStore.mySchedules, data];
			}
		} catch (err) {
			console.error(err);
		}
	},

	async deleteSchedule(id: string) {
		try {
			const res = await fetch(`/wp-json/dodo-air/v1/schedules/${id}`, { method: 'DELETE' });
			if (res.ok) {
				dalStore.mySchedules = dalStore.mySchedules.filter((s: any) => s.id !== id);
			}
		} catch (err) {
			console.error(err);
		}
	}
};

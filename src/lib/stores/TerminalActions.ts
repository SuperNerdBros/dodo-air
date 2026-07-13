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
      const newFlight = await TerminalAPI.hostFlight({
          hostName: dalStore.passport.villagerName,
          islandName: dalStore.passport.islandName,
          dodoCode: cleanDodo,
          hemisphere: dalStore.formHemisphere,
          gate: Number(dalStore.formGate),
          description: dalStore.formDesc.trim() || `Welcome to ${dalStore.passport.islandName}! Come over and relax! 🌴`,
          planeType: dalStore.formPlaneType,
          planeColor: dalStore.passport.planeColor || 'orange',
          hostFriendCode: dalStore.passport.friendCode
      });
      if (dalStore.systemMode === 'DAL') {
        dalStore.playSound('airplane');
        dalStore.flights = [newFlight, ...dalStore.flights];
      } else {
        dalStore.playSound('bell');
        dalStore.dreams = [newFlight, ...dalStore.dreams];
      }
      dalStore.selectedFlightId = newFlight.id;
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
          friendCode: dalStore.passport.friendCode
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
          friendCode: request.friendCode
      });
      await TerminalAPI.removeStandbyRequest(request.id);
      dalStore.playSound('success');
      
      await TerminalAPI.postChat({
        sender: 'Orville [AI]',
        text: `🎉 MATCH MADE! Passenger ${request.name} is cleared for immediate takeoff and flying to ${dalStore.passport.islandName}! Clear skies ahead! 🛩️`
      });
      dalStore.fetchState();
    } catch (err) {
      console.error('Failed to match passenger:', err);
    }
  },

  async postChat(e: Event) {
    e.preventDefault();
    if (!dalStore.chatSender.trim() || !dalStore.chatText.trim()) {
      dalStore.playSound('beep');
      return;
    }
    dalStore.isPostingChat = true;
    try {
      await TerminalAPI.postChat({
          sender: dalStore.chatSender.trim(),
          island: dalStore.chatIsland.trim() || undefined,
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

const fs = require('fs');
const path = './src/routes/+layout.svelte';
let content = fs.readFileSync(path, 'utf8');

// Insert import at the top
if (!content.includes('import { TerminalAPI }')) {
  content = content.replace('import { dalStore } from \'$lib/stores/dal.svelte\';', 'import { dalStore } from \'$lib/stores/dal.svelte\';\n  import { TerminalAPI } from \'$lib/api/TerminalAPI\';');
}

// Locate the block
const startMarker = 'async function openProfileModal(friendCode: string) {';
const endMarker = 'let activeFlights = $derived(dalStore.systemMode === \'DAL\' ? flights : dreams);';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const newFunctions = `async function openProfileModal(friendCode: string) {
    playSound('beep', isMuted);
    selectedFriendCode = friendCode;
    reviewError = '';
    try {
      selectedProfileReviews = await TerminalAPI.getReviews(friendCode);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  }

  async function handleSubmitReview(ratingType: 'apple' | 'turnip', comment: string) {
    if (!selectedFriendCode) return;
    if (!passport.hasCreated) {
      reviewError = "You must print your custom Passport at the dispatch counter before submitting trust feedback!";
      return;
    }
    if (passport.friendCode === selectedFriendCode) {
      reviewError = "You cannot rate your own island profile!";
      return;
    }
    isSubmittingReview = true;
    reviewError = '';
    try {
      await TerminalAPI.submitReview(selectedFriendCode, {
          ratingType,
          voterName: passport.villagerName,
          voterIsland: passport.islandName,
          voterFriendCode: passport.friendCode,
          comment
      });
      playSound('success', isMuted);
      selectedProfileReviews = await TerminalAPI.getReviews(selectedFriendCode);
      await fetchState(false);
    } catch (err: any) {
      reviewError = err.error || "Failed to submit rating.";
    } finally {
      isSubmittingReview = false;
    }
  }

  function handleReveal(flightId: string) {
    playSound('success', isMuted);
    revealedCodes = { ...revealedCodes, [flightId]: true };
  }

  async function handleHostFlight(e: SubmitEvent) {
    e.preventDefault();
    formError = '';
    if (!passport.hasCreated) {
      formError = 'Please save your Frequent Flyer Passport first!';
      playSound('beep', isMuted);
      return;
    }
    let cleanDodo = '';
    if (formDodo.trim()) {
      cleanDodo = formDodo.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (cleanDodo.length !== 5) {
        formError = 'Dodo Code must be exactly 5 characters (A-Z, 0-9).';
        playSound('beep', isMuted);
        return;
      }
    }
    isSubmittingHost = true;
    try {
      const newFlight = await TerminalAPI.hostFlight({
          hostName: passport.villagerName,
          islandName: passport.islandName,
          dodoCode: cleanDodo,
          hemisphere: formHemisphere,
          gate: Number(formGate),
          description: formDesc.trim() || \`Welcome to \${passport.islandName}! Come over and relax! 🌴\`,
          planeType: formPlaneType,
          planeColor: passport.planeColor || 'orange',
          hostFriendCode: passport.friendCode
      });
      if (dalStore.systemMode === 'DAL') {
        playSound('airplane', isMuted);
        flights = [newFlight, ...flights];
      } else {
        playSound('bell', isMuted);
        dreams = [newFlight, ...dreams];
      }
      selectedFlightId = newFlight.id;
      formDodo = '';
      formDesc = '';
      fetchState();
      earnStampProgress('hasHosted');
    } catch (err: any) {
      formError = err.error || 'Failed to dispatch seaplane.';
      playSound('beep', isMuted);
    } finally {
      isSubmittingHost = false;
    }
  }

  async function handleCreateStandbyRequest(e: SubmitEvent) {
    e.preventDefault();
    requestError = '';
    if (!passport.hasCreated) {
      requestError = 'Please save your Frequent Flyer Passport first!';
      playSound('beep', isMuted);
      return;
    }
    isSubmittingRequest = true;
    try {
      await TerminalAPI.createStandbyRequest({
          name: passport.villagerName,
          island: passport.islandName,
          title: \`\${passport.titlePart1} \${passport.titlePart2}\`,
          avatar: passport.avatarIcon,
          friendCode: passport.friendCode,
          gateType: Number(requestGateType),
          timePreference: requestTime,
          memo: requestMemo.trim() || 'Looking for an open island gate to visit! 🌴'
      });
      playSound('success', isMuted);
      requestMemo = '';
      showStandbyModal = false;
      fetchState();
      earnStampProgress('hasRequested');
    } catch (err: any) {
      requestError = err.error || 'Failed to file standby ticket.';
      playSound('beep', isMuted);
    } finally {
      isSubmittingRequest = false;
    }
  }

  async function handleRemoveStandbyRequest(reqId: string) {
    try {
      await TerminalAPI.removeStandbyRequest(reqId);
      playSound('beep', isMuted);
      fetchState();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleBoardFlight(flightId: string) {
    if (!passport.hasCreated) {
      playSound('beep', isMuted);
      alert('Please fill out your Passport first!');
      return;
    }
    boardingError = '';
    try {
      await TerminalAPI.boardFlight(flightId, {
          name: passport.villagerName,
          island: passport.islandName,
          friendCode: passport.friendCode
      });
      playSound('success', isMuted);
      revealedCodes = { ...revealedCodes, [flightId]: true };
      fetchState();
      earnStampProgress('hasBoarded');
    } catch (err: any) {
      boardingError = err.error || 'Failed to check-in.';
      playSound('beep', isMuted);
    }
  }

  async function handleLeaveFlight(flightId: string, passengerId: string) {
    try {
      await TerminalAPI.leaveFlight(flightId, passengerId);
      playSound('beep', isMuted);
      fetchState();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleUpdateStatus(flightId: string, newStatus: FlightStatus, dodoCode?: string) {
    try {
      await TerminalAPI.updateStatus(flightId, newStatus, dodoCode);
      playSound('bell', isMuted);
      if (newStatus === 'Closed') {
        if (selectedFlightId === flightId) {
          selectedFlightId = null;
        }
      }
      fetchState();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleClearForTakeoff(request: StandbyRequest, flightId: string) {
    try {
      await TerminalAPI.boardFlight(flightId, {
          name: request.name,
          island: request.island,
          friendCode: request.friendCode
      });
      await TerminalAPI.removeStandbyRequest(request.id);
      playSound('success', isMuted);
      
      await TerminalAPI.postChat({
        sender: 'Orville [AI]',
        text: \`🎉 MATCH MADE! Passenger \${request.name} is cleared for immediate takeoff and flying to \${passport.islandName}! Clear skies ahead! 🛩️\`
      });
      fetchState();
    } catch (err) {
      console.error('Failed to match passenger:', err);
    }
  }

  async function handlePostChat(e: SubmitEvent) {
    e.preventDefault();
    if (!chatSender.trim() || !chatText.trim()) {
      playSound('beep', isMuted);
      return;
    }
    isPostingChat = true;
    try {
      await TerminalAPI.postChat({
          sender: chatSender.trim(),
          island: chatIsland.trim() || undefined,
          text: chatText.trim()
      });
      playSound('chatter', isMuted);
      chatText = '';
      fetchState();
      earnStampProgress('hasChatted');
    } catch (err) {
      console.error(err);
    } finally {
      isPostingChat = false;
    }
  }

  async function handleGenerateAIReview(flightId: string) {
    loadingReviewId = flightId;
    playSound('bell', isMuted);
    try {
      await TerminalAPI.generateAIReview(flightId);
      playSound('success', isMuted);
      fetchState();
    } catch (err) {
      console.error('Failed to trigger AI travel review:', err);
    } finally {
      loadingReviewId = null;
    }
  }

  `;
  const newContent = content.substring(0, startIndex) + newFunctions + content.substring(endIndex);
  fs.writeFileSync(path, newContent, 'utf8');
  console.log('Successfully replaced functions in +layout.svelte');
} else {
  console.log('Failed to find start or end markers');
}

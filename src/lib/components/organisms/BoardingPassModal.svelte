<script lang="ts">
  import { Ticket, X, AlertCircle } from '@lucide/svelte';
  import type { Flight, Passport } from '$lib/studio-types';
  import { playSound } from '$lib/utils/audio';
  import { PLANE_COLORS } from '$lib/utils/constants';
  import { scale, fade } from 'svelte/transition';
  import { backOut } from 'svelte/easing';

  let {
    selectedFlight,
    onClose,
    passport,
    onBoardFlight,
    onLeaveFlight,
    boardingError = '',
    isMuted = false,
    onRequestStandby
  } = $props<{
    selectedFlight?: Flight;
    onClose: () => void;
    passport: Passport;
    onBoardFlight: (flightId: string) => void;
    onLeaveFlight: (flightId: string, passengerId: string) => void;
    boardingError?: string;
    isMuted?: boolean;
    onRequestStandby: (gate: number) => void;
  }>();

  let passengersList = $derived(selectedFlight?.passengers || []);
  let passengerIndex = $derived(passengersList.findIndex(p => 
    p.friendCode 
      ? p.friendCode === passport.friendCode 
      : p.name.toLowerCase() === passport.villagerName.toLowerCase()
  ));
  let isPassengerCheckedIn = $derived(passengerIndex !== -1);
  
  let seatNum = $derived(isPassengerCheckedIn ? (passengerIndex + 1) : (passengersList.length + 1));
  let seatLetter = $derived(['A', 'B', 'C', 'D'][seatNum % 4]);
  let seatAssigned = $derived(`${String(seatNum).padStart(2, '0')}${seatLetter}`);
  let boardingNumVal = $derived(selectedFlight ? `#DAL-${selectedFlight.id.replace('DAL-', '')}-${String(seatNum).padStart(2, '0')}` : '');
  
  let planeColorObj = $derived(PLANE_COLORS.find(pc => pc.id === (selectedFlight?.planeColor || 'orange')) || PLANE_COLORS[0]);
  let capacity = $derived(selectedFlight?.capacity || (selectedFlight?.planeType === 'Switch 2' ? 12 : 8));
</script>

{#if selectedFlight}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="fixed inset-0 bg-[#006094]/40 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto" transition:fade={{ duration: 200 }}>
    <div
      class="bg-white rounded-[36px] border-4 border-[#0084CC] max-w-2xl w-full shadow-2xl relative overflow-hidden text-[#4A4A4A] my-8"
      transition:scale={{ duration: 300, start: 0.95, easing: backOut }}
    >
      <!-- Ticket Perforated top stub divider effect -->
      <div class="bg-[#0084CC] text-white p-4 font-system font-black flex items-center justify-between border-b-4 border-dashed border-[#006094]">
        <div class="flex items-center gap-2">
          <Ticket class="w-5 h-5 text-[#FFCC00]" />
          <span class="font-bold">OFFICIAL DAL BOARDING PASS</span>
        </div>
        <button
          onclick={() => { playSound('beep', isMuted); onClose(); }}
          class="p-1 rounded-full bg-[#006094] hover:bg-[#004d75] transition-all border-none cursor-pointer"
        >
          <X class="w-4 h-4 text-[#FFCC00]" />
        </button>
      </div>

      <div class="p-5 flex flex-col md:flex-row gap-5 items-stretch text-[#4A4A4A]">
        <!-- Passenger Boarding stub (Left Side) -->
        <div class="flex-1 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="block text-[8px] font-mono text-slate-400 uppercase font-black tracking-wider leading-none">PASSENGER NAME</span>
              <span class="text-sm font-system font-black text-slate-700 mt-1 block font-bold">
                {passport.hasCreated ? passport.villagerName : "GUEST PASSENGER"}
              </span>
            </div>
            <div>
              <span class="block text-[8px] font-mono text-slate-400 uppercase font-black tracking-wider leading-none">SEAPLANE FLIGHT</span>
              <span class="text-sm font-mono font-black text-[#0084CC] mt-1 block font-bold">
                {selectedFlight.id}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="block text-[8px] font-mono text-slate-400 uppercase font-black tracking-wider leading-none">DEPARTURE PORT</span>
              <span class="text-xs font-bold text-slate-700 mt-1 block">
                🏝️ {passport.hasCreated ? passport.islandName : "HOME PORT"}
              </span>
            </div>
            <div>
              <span class="block text-[8px] font-mono text-slate-400 uppercase font-black tracking-wider leading-none">DESTINATION ISLAND</span>
              <span class="text-xs font-bold text-[#0084CC] mt-1 block">
                🏝️ {selectedFlight.islandName} (Host {selectedFlight.hostName})
              </span>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2 bg-[#FAF8F2] p-2.5 rounded-2xl border border-[#E6DFC7]">
            <div class="text-center border-r border-[#E6DFC7]/60">
              <span class="block text-[7.5px] font-mono text-slate-400 font-bold leading-none">GATE</span>
              <span class="text-sm font-black text-[#0084CC] leading-none mt-1 block font-bold">{selectedFlight.gate}</span>
            </div>
            <div class="text-center border-r border-[#E6DFC7]/60">
              <span class="block text-[7.5px] font-mono text-slate-400 font-bold leading-none">SEAT ASSIGNED</span>
              <span class="text-sm font-mono font-black text-slate-700 leading-none mt-1 block font-bold">{seatAssigned}</span>
            </div>
            <div class="text-center">
              <span class="block text-[7.5px] font-mono text-slate-400 font-bold leading-none">STATUS</span>
              <span class="text-[10px] font-mono font-black text-amber-600 leading-none mt-1 block uppercase font-bold">{selectedFlight.status}</span>
            </div>
          </div>

          <!-- Livery details display on stub -->
          <div class="flex items-center gap-2 bg-[#FAF8F2] px-3 py-2 rounded-2xl border border-[#E6DFC7]/50 text-[10px]">
            <span class="text-lg">✈️</span>
            <div>
              <span class="font-bold text-slate-700">{selectedFlight.planeType || 'Switch'} Model Seaplane</span>
              <span class="text-[8.5px] font-mono block font-semibold" style="color: {planeColorObj.hex}">
                ● Registered {planeColorObj.name} Livery
              </span>
            </div>
          </div>

          <!-- Dodo Code Security and check-in -->
          <div class="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
            {#if isPassengerCheckedIn}
              <!-- Checked-in boarded passenger code reveal -->
              <div class="w-full space-y-2">
                <div class="bg-[#E6F4EA] border-2 border-[#137333] p-3 rounded-2xl text-center animate-fade-in">
                  <span class="block text-[8px] font-mono text-[#137333] font-black uppercase tracking-wider">BOARDED SEAPLANE - DODO CODE</span>
                  <span class="text-2xl font-mono font-black text-[#137333] tracking-widest mt-0.5 block uppercase font-bold">
                    {selectedFlight.dodoCode}
                  </span>
                </div>
                <div class="flex gap-2">
                  <button
                    onclick={() => {
                      const p = passengersList.find(pass => 
                        pass.friendCode 
                          ? pass.friendCode === passport.friendCode 
                          : pass.name.toLowerCase() === passport.villagerName.toLowerCase()
                      );
                      if (p) onLeaveFlight(selectedFlight.id, p.id);
                    }}
                    class="btn-acnh btn-acnh-outline w-full"
                  >
                    👋 Return back home / Clear seat
                  </button>
                </div>
              </div>
            {:else if passengersList.length >= capacity}
              <!-- Seaplane is full - offer standby options -->
              <div class="w-full bg-amber-50 border border-amber-200/60 p-3.5 rounded-2xl space-y-2.5">
                <div class="flex items-center gap-1.5 text-amber-800 font-bold">
                  <span class="text-sm">⚠️</span>
                  <span class="text-[9.5px] font-mono font-black uppercase tracking-wider">SEAPLANE FLIGHT IS FULL</span>
                </div>
                <p class="text-[10.5px] text-slate-600 leading-relaxed font-semibold">
                  Oh, bummer! All <strong>{capacity}</strong> seats on this {selectedFlight.planeType || 'Switch'} seaplane are taken. Check-in is currently unavailable.
                </p>
                <button
                  type="button"
                  onclick={() => onRequestStandby(selectedFlight.gate)}
                  class="w-full bg-[#FF9F43] hover:bg-[#ff8f24] text-white font-mono font-black py-2 rounded-xl text-[10px] uppercase shadow transition-all flex items-center justify-center gap-1 cursor-pointer font-bold border-none"
                >
                  🛋️ FILE STANDBY TICKET ON RADAR
                </button>
              </div>
            {:else}
              <!-- Needs Check-In first -->
              <div class="w-full space-y-2">
                {#if boardingError}
                  <p class="text-xs font-bold text-red-600 flex items-center gap-1 mb-1 font-mono">
                    <AlertCircle class="w-3.5 h-3.5" /> {boardingError}
                  </p>
                {/if}
                <p class="text-[10.5px] text-[#4A4A4A]/70 leading-relaxed font-sans mb-1 text-center sm:text-left font-semibold">
                  🦤 <strong>Orville:</strong> "Step up to the counter! Book your Boarding Pass on Flight <strong>{selectedFlight.id}</strong> to receive clearance and the Dodo Code."
                </p>
                <button
                  onclick={() => onBoardFlight(selectedFlight.id)}
                  disabled={selectedFlight.status === 'Closed' || selectedFlight.status === 'Departed'}
                  class="w-full bg-[#FFCC00] hover:bg-[#FFD11A] disabled:opacity-50 text-[#006094] font-system font-black py-3 px-4 rounded-xl shadow border-b-4 border-[#CC9900] text-center text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer font-bold"
                >
                  <Ticket class="w-4 h-4" />
                  BOARD SEAPLANE (GET DODO CODE™)
                </button>
              </div>
            {/if}
          </div>
        </div>

        <!-- Barcode / Stub section (Right Side) -->
        <div class="md:w-44 border-t md:border-t-0 md:border-l-2 border-slate-100 pt-4 md:pt-0 md:pl-4 flex flex-col justify-between items-center text-center">
          <div class="space-y-1">
            <span class="text-[7px] font-mono text-slate-400 font-bold block uppercase tracking-wide">BOARDING NUMBER</span>
            <span class="font-mono text-xs font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md font-bold">
              {boardingNumVal}
            </span>
          </div>

          <!-- Simulation Barcode -->
          <div class="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-100 my-3 flex flex-col items-center justify-center">
            <div class="h-10 w-full flex gap-0.5 justify-center items-stretch select-none">
              {#each [1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 1, 4] as width}
                <div class="bg-slate-700" style="width: {width}px"></div>
              {/each}
            </div>
            <span class="font-mono text-[7px] text-slate-400 mt-1 block">DODO AIRLINES INC</span>
          </div>

          <span class="text-[10px] text-slate-400 font-semibold italic leading-snug">
            *Please leave through airport gates!
          </span>
        </div>
      </div>
    </div>
  </div>
{/if}

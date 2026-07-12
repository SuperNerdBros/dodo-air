<script lang="ts">
  import { Calendar, Clock, Plus, Trash2 } from '@lucide/svelte';
  import { dalStore } from '$lib/stores/dal.svelte';
  import { playSound } from '$lib/utils/audio';

  let { mySchedules = [], onAddSchedule, onDeleteSchedule, isMuted = false } = $props<{
    mySchedules: any[];
    onAddSchedule: (schedule: any) => Promise<void>;
    onDeleteSchedule: (id: string) => Promise<void>;
    isMuted?: boolean;
  }>();

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  let selectedDay = $state(days[new Date().getDay()]);

  let sliderStart = $state(40); // 10:00
  let sliderEnd = $state(48);   // 12:00
  let isSubmitting = $state(false);

  let actualStart = $derived(Math.min(sliderStart, sliderEnd));
  let actualEnd = $derived(Math.max(sliderStart, sliderEnd));

  function formatTime(val: number) {
    const h24 = Math.floor(val / 4);
    const m = (val % 4) * 15;
    const period = h24 < 12 || h24 === 24 ? 'AM' : 'PM';
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
  }

  let formStartTime = $derived(formatTime(actualStart));
  let formEndTime = $derived(formatTime(actualEnd));

  let activeSchedules = $derived(mySchedules.filter((s: any) => s.day === selectedDay));

  async function handleAdd(e: Event) {
    e.preventDefault();
    if (!formStartTime || !formEndTime) return;
    isSubmitting = true;
    try {
      await onAddSchedule({
        day: selectedDay,
        startTime: formStartTime,
        endTime: formEndTime,
        mode: dalStore.systemMode
      });
      playSound('success', isMuted);
    } catch (e) {
      playSound('beep', isMuted);
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="max-w-4xl mx-auto space-y-6">
  <!-- Header -->
  <div class="bg-white rounded-[36px] border-4 {dalStore.systemMode === 'DAL' ? 'border-[#0084CC]/10 shadow-[0_8px_0_0_rgba(0,132,204,0.05)]' : 'border-[#4B0082]/10 shadow-[0_8px_0_0_rgba(75,0,130,0.05)]'} p-6 text-left transition-colors duration-500">
    <div class="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 border-b border-slate-100 pb-5">
      <div class="w-14 h-14 {dalStore.systemMode === 'DAL' ? 'bg-[#FFCC00] text-[#006094]' : 'bg-[#DDA0DD] text-[#4B0082]'} rounded-2xl flex items-center justify-center shadow-inner shrink-0 transform -rotate-3 transition-colors duration-500">
        <Calendar class="w-7 h-7" />
      </div>
      <div>
        <h2 class="text-2xl font-black {dalStore.systemMode === 'DAL' ? 'text-[#0084CC]' : 'text-[#4B0082]'} uppercase tracking-wide font-system transition-colors duration-500">
          {dalStore.systemMode === 'DAL' ? 'Flight Scheduler' : 'Dream Scheduler'}
        </h2>
        <p class="text-sm text-slate-500 font-system font-bold mt-1">Register your routine opening hours</p>
      </div>
    </div>

    <!-- Week Slider -->
    <div class="flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
      {#each days as day}
        {@const hasSchedule = mySchedules.some((s: any) => s.day === day)}
        <button
          onclick={() => { playSound('beep', isMuted); selectedDay = day; }}
          class="relative flex-shrink-0 px-4 py-3 rounded-2xl font-system font-black tracking-wide text-xs transition-all border-b-4 cursor-pointer font-bold select-none
          {selectedDay === day 
            ? (dalStore.systemMode === 'DAL' ? 'bg-[#FFCC00] text-[#006094] border-[#CC9900] translate-y-0.5 !border-b-2' : 'bg-[#DDA0DD] text-[#4B0082] border-[#ba80ba] translate-y-0.5 !border-b-2') 
            : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:-translate-y-0.5'}"
        >
          {day}
          {#if hasSchedule}
            <span class="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full {selectedDay === day ? (dalStore.systemMode === 'DAL' ? 'bg-[#006094]' : 'bg-[#4B0082]') : (dalStore.systemMode === 'DAL' ? 'bg-[#0084CC]' : 'bg-[#DDA0DD]')}"></span>
          {/if}
        </button>
      {/each}
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Schedule List for Selected Day -->
    <div class="bg-white rounded-[32px] p-5 border-2 {dalStore.systemMode === 'DAL' ? 'border-[#0084CC]/10' : 'border-[#4B0082]/10'} shadow-sm text-left transition-colors duration-500">
      <h3 class="font-system font-black text-xs {dalStore.systemMode === 'DAL' ? 'text-[#0084CC]' : 'text-[#4B0082]'} uppercase tracking-wide border-b border-slate-100 pb-2 mb-4 transition-colors duration-500">
        Scheduled for {selectedDay}
      </h3>

      {#if activeSchedules.length === 0}
        <div class="py-8 text-center text-slate-400 font-system text-xs space-y-2">
          <Clock class="w-8 h-8 mx-auto opacity-20" />
          <p class="font-bold">No hours registered for {selectedDay}.</p>
        </div>
      {:else}
        <div class="space-y-3">
          {#each activeSchedules as schedule}
            <div class="flex items-center justify-between bg-[#FAF8F2] border border-[#E6DFC7]/50 p-3 rounded-2xl">
              <div class="flex items-center gap-3">
                <span class="text-xl">{schedule.mode === 'DAL' ? '🛩️' : '🛌'}</span>
                <div>
                  <span class="font-system font-black text-slate-700 block text-sm">{schedule.startTime} - {schedule.endTime}</span>
                  <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-system block mt-0.5">
                    {schedule.mode === 'DAL' ? 'DAL Flight' : 'Luna Dream'}
                  </span>
                </div>
              </div>
              <button
                onclick={() => { playSound('beep', isMuted); onDeleteSchedule(schedule.id); }}
                class="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 hover:scale-110 transition-all cursor-pointer border-none"
                title="Remove"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Add Form -->
    <div class="bg-white rounded-[32px] p-5 border-2 {dalStore.systemMode === 'DAL' ? 'border-[#0084CC]/10' : 'border-[#4B0082]/10'} shadow-sm text-left transition-colors duration-500">
      <h3 class="font-system font-black text-xs {dalStore.systemMode === 'DAL' ? 'text-[#0084CC]' : 'text-[#4B0082]'} uppercase tracking-wide border-b border-slate-100 pb-2 mb-4 transition-colors duration-500">
        Add Time Slot
      </h3>

      <form onsubmit={handleAdd} class="space-y-6">
        <div style="--thumb-color: {dalStore.systemMode === 'DAL' ? '#0084CC' : '#4B0082'};">
          <div class="flex justify-between items-end mb-2">
            <!-- <span class="block text-[10px] font-system font-black text-slate-400 uppercase tracking-wider">Time Slot</span> -->
            <span class="text-sm font-black {dalStore.systemMode === 'DAL' ? 'text-[#0084CC]' : 'text-[#4B0082]'}">{formStartTime} - {formEndTime}</span>
          </div>
          
          <div class="relative w-full h-8 flex items-center">
            <!-- Track -->
            <div class="absolute w-full h-3 bg-slate-100 border border-slate-200 rounded-full shadow-inner"></div>
            <!-- Highlight -->
            <div 
              class="absolute h-3 {dalStore.systemMode === 'DAL' ? 'bg-[#FFCC00] border-[#CC9900]' : 'bg-[#DDA0DD] border-[#ba80ba]'} border rounded-full transition-all duration-75" 
              style="left: {(actualStart / 96) * 100}%; right: {100 - ((actualEnd / 96) * 100)}%;">
            </div>
            
            <!-- Inputs -->
            <input 
              type="range" 
              min="0" 
              max="96" 
              bind:value={sliderStart} 
              class="multi-range absolute w-full appearance-none bg-transparent pointer-events-none z-10" 
            />
            <input 
              type="range" 
              min="0" 
              max="96" 
              bind:value={sliderEnd} 
              class="multi-range absolute w-full appearance-none bg-transparent pointer-events-none z-20" 
            />
          </div>
          
          <div class="flex justify-between text-[10px] font-bold text-slate-400 mt-2 font-system">
            <span>12 AM</span>
            <span>12 PM</span>
            <span>12 AM</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          class="w-full mt-2 {dalStore.systemMode === 'DAL' ? 'bg-[#FFCC00] hover:bg-[#FFD11A] text-[#006094] border-[#CC9900]' : 'bg-[#DDA0DD] hover:bg-[#e8b5e8] text-[#4B0082] border-[#ba80ba]'} font-system font-black py-3 rounded-2xl border-b-4 shadow transition-all uppercase tracking-wide text-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {#if isSubmitting}
            <Clock class="w-4 h-4 animate-spin" />
            Saving...
          {:else}
            <Plus class="w-4 h-4" />
            Register Hours
          {/if}
        </button>
      </form>
    </div>
  </div>
</div>

<style>
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .multi-range::-webkit-slider-thumb {
    pointer-events: auto;
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background-color: white;
    border: 3px solid var(--thumb-color, #0084CC);
    border-radius: 50%;
    cursor: grab;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: transform 0.1s;
  }
  .multi-range::-webkit-slider-thumb:active {
    cursor: grabbing;
    transform: scale(1.15);
  }
  
  .multi-range::-moz-range-thumb {
    pointer-events: auto;
    appearance: none;
    width: 20px;
    height: 20px;
    background-color: white;
    border: 3px solid var(--thumb-color, #0084CC);
    border-radius: 50%;
    cursor: grab;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: transform 0.1s;
  }
  .multi-range::-moz-range-thumb:active {
    cursor: grabbing;
    transform: scale(1.15);
  }
</style>

<script lang="ts">
  import { dalStore } from '$lib/stores/dal.svelte';
  import AcnhBubble from '$lib/components/molecules/AcnhBubble.svelte';

  let step: 'email' | 'code' = $state('email');
  let email = $state('');
  let code = $state('');
  let isLoading = $state(false);
  let error = $state('');

  async function handleEmailSubmit(e: Event) {
    e.preventDefault();
    if (!email) {
      error = 'Please enter your email address.';
      return;
    }
    error = '';
    isLoading = true;
    try {
      const res = await fetch('/wp-json/dodo-air/v1/auth/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.dev_code) {
          console.log('%c[DEV] Temporary Login Code: ' + data.dev_code, 'color: #0084CC; font-weight: bold; font-size: 14px;');
        }
        step = 'code';
        dalStore.playSound('success');
      } else {
        const data = await res.json();
        error = data.message || 'Failed to request code. Please try again.';
        dalStore.playSound('beep');
      }
    } catch (err) {
      error = 'A network error occurred.';
      dalStore.playSound('beep');
    } finally {
      isLoading = false;
    }
  }

  async function handleCodeSubmit(e: Event) {
    e.preventDefault();
    if (!code) {
      error = 'Please enter the access code.';
      return;
    }
    error = '';
    isLoading = true;
    try {
      const res = await fetch('/wp-json/dodo-air/v1/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      if (res.ok) {
        dalStore.playSound('success');
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      } else {
        const data = await res.json();
        error = data.message || 'Invalid code. Please try again.';
        dalStore.playSound('beep');
      }
    } catch (err) {
      error = 'A network error occurred.';
      dalStore.playSound('beep');
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md">
  {#if step === 'email'}
    <AcnhBubble title="Orville [DAL Dispatch]">
      <div class="text-xl font-bold text-slate-700 leading-relaxed mb-6">
        Welcome to Dodo Airlines! We'll send you a passcode to access your passport. What's your email address?
      </div>
      
      <form onsubmit={handleEmailSubmit} class="flex flex-col gap-4 max-w-[500px] mx-auto">
        <input 
          type="email" 
          bind:value={email} 
          placeholder="your.name@example.com"
          class="w-full bg-[#FAF8F2] border-[#0084CC]/30 border-2 rounded-xl px-4 py-3 text-lg font-bold text-[#0084CC] placeholder-slate-300 outline-none focus:bg-white focus:border-[#0084CC]"
          disabled={isLoading}
          required
        />
        
        {#if error}
          <div class="text-red-500 font-bold text-sm bg-red-50 p-3 rounded-xl border border-red-200">
            {error}
          </div>
        {/if}
        
        <div class="flex justify-end mt-2">
          <button 
            type="submit" 
            class="bg-[#F1AE04] hover:bg-[#FACC15] text-white font-black text-xl px-8 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Checking...' : 'Next'}
          </button>
        </div>
      </form>
    </AcnhBubble>
  {:else}
    <AcnhBubble title="Orville [DAL Dispatch]">
      <div class="text-xl font-bold text-slate-700 leading-relaxed mb-6">
        Great! We just sent a temporary flight code to <strong class="text-[#0084CC]">{email}</strong>. What is it?
      </div>
      
      <form onsubmit={handleCodeSubmit} class="flex flex-col gap-4 max-w-[500px] mx-auto">
        <input 
          type="text" 
          bind:value={code} 
          placeholder="000000"
          class="w-full bg-[#FAF8F2] border-[#0084CC]/30 border-2 rounded-xl px-4 py-3 text-2xl tracking-widest text-center font-black text-[#0084CC] placeholder-slate-300 outline-none focus:bg-white focus:border-[#0084CC]"
          disabled={isLoading}
          required
        />
        
        {#if error}
          <div class="text-red-500 font-bold text-sm bg-red-50 p-3 rounded-xl border border-red-200">
            {error}
          </div>
        {/if}
        
        <div class="flex justify-between mt-2">
          <button 
            type="button" 
            onclick={() => { step = 'email'; error = ''; }}
            class="text-slate-400 hover:text-slate-600 font-bold px-4 py-3 rounded-2xl transition-all"
            disabled={isLoading}
          >
            Back
          </button>
          
          <button 
            type="submit" 
            class="bg-[#0084CC] hover:bg-[#0099FF] text-white font-black text-xl px-8 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Login'}
          </button>
        </div>
      </form>
    </AcnhBubble>
  {/if}
</div>

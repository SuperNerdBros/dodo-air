<script lang="ts">
  import { ShieldCheck, Mail } from '@lucide/svelte';
  
  let { isActive = false } = $props();
</script>

<div class="h-full w-full bg-white/90 backdrop-blur-md rounded-[32px] border-4 border-[#E0DBC5] shadow-lg p-6 sm:p-10 flex flex-col overflow-y-auto font-system relative">
  <div class="max-w-3xl mx-auto w-full pb-20 text-[#5D5745]">
    
    <div class="flex items-center gap-4 mb-8 pb-6 border-b-2 border-[#E6DFC7]">
      <div class="w-16 h-16 bg-[#FFF9E7] border-3 border-[#0084CC] rounded-full flex items-center justify-center shadow-sm shrink-0">
        <ShieldCheck class="w-8 h-8 text-[#0084CC]" />
      </div>
      <div>
        <h1 class="text-3xl font-black text-[#006094] uppercase tracking-wider m-0">Privacy Policy</h1>
        <p class="text-sm font-bold text-slate-500 uppercase tracking-wide">Last Updated: July 2026</p>
      </div>
    </div>

    <div class="space-y-6 text-sm leading-relaxed font-semibold">
      <p>
        Welcome to Dodo Airlines (the "App"), a community tool built for Animal Crossing fans. We take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
      </p>

      <h2 class="text-xl font-black text-[#0084CC] uppercase tracking-wider mt-8">1. Information We Collect</h2>
      <p>We may collect information about you in a variety of ways. The information we may collect includes:</p>
      <ul class="list-disc pl-6 space-y-2 mt-2">
        <li><strong>Account Data:</strong> If you verify your email via our magic link system, we store your email address for authentication purposes.</li>
        <li><strong>Profile Data:</strong> We store the information you enter into your Frequent Flyer Passport, including your Villager Name, Island Name, Friend Code, Dream Address, selected titles, avatar icon, signature, and plane preferences.</li>
        <li><strong>App Activity:</strong> We collect data on your flight history, hosted flights, visited islands, chat messages sent over the terminal radio, and stamps unlocked.</li>
        <li><strong>Guest Data:</strong> If you use a Guest Pass, we temporarily store generic passport details locally on your device for the duration of your session.</li>
      </ul>

      <h2 class="text-xl font-black text-[#0084CC] uppercase tracking-wider mt-8">2. How We Use Your Information</h2>
      <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the App to:</p>
      <ul class="list-disc pl-6 space-y-2 mt-2">
        <li>Facilitate the creation of and secure your Account.</li>
        <li>Enable user-to-user communications, such as sharing Dodo Codes and Dream Addresses.</li>
        <li>Display your customized passport to other active pilots on the network.</li>
        <li>Generate personalized AI flight reviews and automated ATC broadcasts.</li>
        <li>Monitor and analyze usage and trends to improve your experience with the App.</li>
      </ul>

      <h2 class="text-xl font-black text-[#0084CC] uppercase tracking-wider mt-8">3. Disclosure of Your Information</h2>
      <p>We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
      <ul class="list-disc pl-6 space-y-2 mt-2">
        <li><strong>Publicly Visible Info:</strong> When you host a flight or post in the Radio chat, your Passport details (Villager Name, Island Name, Title, Avatar) are visible to other logged-in users. Dodo Codes are only revealed to users you approve for Standby.</li>
        <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others.</li>
        <li><strong>Third-Party Service Providers:</strong> We use AI services (such as Google Gemini) to generate creative flight reviews and ATC broadcasts. Anonymized flight context is sent to these APIs. Your exact email address is never shared.</li>
      </ul>

      <h2 class="text-xl font-black text-[#0084CC] uppercase tracking-wider mt-8">4. Data Security</h2>
      <p>
        We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
      </p>

      <h2 class="text-xl font-black text-[#0084CC] uppercase tracking-wider mt-8">5. Policy for Children</h2>
      <p>
        We do not knowingly solicit information from or market to children under the age of 13. If you become aware of any data we have collected from children under age 13, please contact us using the contact information provided below.
      </p>

      <div class="mt-12 p-6 bg-[#FAF8F2] border-2 border-[#E6DFC7] rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-[#0084CC] shrink-0 border border-[#E6DFC7]">
          <Mail class="w-6 h-6" />
        </div>
        <div>
          <h3 class="text-lg font-black text-[#006094] uppercase tracking-wider m-0 mb-1">Contact Us</h3>
          <p class="text-xs text-slate-500 mb-0">If you have questions or comments about this Privacy Policy, please contact us via our main website at <a href="https://xophz.com" target="_blank" class="text-[#0084CC] underline hover:text-[#006094]">xophz.com</a>.</p>
        </div>
      </div>
    </div>
  </div>
</div>

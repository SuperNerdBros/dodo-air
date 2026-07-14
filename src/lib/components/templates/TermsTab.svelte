<script lang="ts">
  import { Scale, Mail } from '@lucide/svelte';
  
  let { isActive = false } = $props();
</script>

<div class="h-full w-full bg-white/90 backdrop-blur-md rounded-[32px] border-4 border-[#E0DBC5] shadow-lg p-6 sm:p-10 flex flex-col overflow-y-auto font-system relative">
  <div class="max-w-3xl mx-auto w-full pb-20 text-[#5D5745]">
    
    <div class="flex items-center gap-4 mb-8 pb-6 border-b-2 border-[#E6DFC7]">
      <div class="w-16 h-16 bg-[#FFF9E7] border-3 border-[#0084CC] rounded-full flex items-center justify-center shadow-sm shrink-0">
        <Scale class="w-8 h-8 text-[#0084CC]" />
      </div>
      <div>
        <h1 class="text-3xl font-black text-[#006094] uppercase tracking-wider m-0">Terms of Service</h1>
        <p class="text-sm font-bold text-slate-500 uppercase tracking-wide">Last Updated: July 2026</p>
      </div>
    </div>

    <div class="space-y-6 text-sm leading-relaxed font-semibold">
      <p>
        These Terms of Service ("Terms") govern your access to and use of the Dodo Airlines online terminal application ("the App"). By accessing or using the App, you agree to be bound by these Terms.
      </p>

      <h2 class="text-xl font-black text-[#0084CC] uppercase tracking-wider mt-8">1. Acceptance of Terms</h2>
      <p>
        By using the App, you agree to these Terms. If you do not agree to these Terms, do not use the App. We reserve the right to modify these Terms at any time, and we will update the "Last Updated" date when we do.
      </p>

      <h2 class="text-xl font-black text-[#0084CC] uppercase tracking-wider mt-8">2. Not Affiliated with Nintendo</h2>
      <p>
        Dodo Airlines is a fan-made, community-driven application. <strong>We are NOT affiliated, associated, authorized, endorsed by, or in any way officially connected with Nintendo Co., Ltd.</strong>, or any of its subsidiaries or its affiliates. The official Nintendo website can be found at <a href="https://nintendo.com" class="text-[#0084CC] underline hover:text-[#006094]" target="_blank">nintendo.com</a>. The name "Animal Crossing", "Dodo Airlines", as well as related names, marks, emblems and images are registered trademarks of their respective owners.
      </p>

      <h2 class="text-xl font-black text-[#0084CC] uppercase tracking-wider mt-8">3. User Conduct and Content</h2>
      <p>You agree not to use the App to:</p>
      <ul class="list-disc pl-6 space-y-2 mt-2">
        <li>Post or transmit any content that is abusive, threatening, obscene, defamatory, libelous, or racially, sexually, religiously, or otherwise objectionable and offensive.</li>
        <li>Post or transmit any content that contains viruses, malware, or any other malicious code.</li>
        <li>Attempt to exploit, hack, or disrupt the servers, API, or any underlying infrastructure of the App.</li>
        <li>Harass or grief other users by sharing false Dodo Codes, intentionally causing game crashes (e.g. quietly leaving), or stealing items from hosted islands.</li>
      </ul>
      <p>We reserve the right to ban users, revoke passports, and remove content that violates these rules without prior warning.</p>

      <h2 class="text-xl font-black text-[#0084CC] uppercase tracking-wider mt-8">4. Intellectual Property</h2>
      <p>
        The original code, layout, design, and non-game-asset artwork of this application are the property of the creator. You may not distribute, modify, transmit, reuse, download, repost, copy, or use said content, whether in whole or in part, for commercial purposes or for personal gain, without express advance written permission from us.
      </p>

      <h2 class="text-xl font-black text-[#0084CC] uppercase tracking-wider mt-8">5. Disclaimer of Warranties</h2>
      <p>
        The App is provided on an "AS IS" and "AS AVAILABLE" basis. We make no representations or warranties of any kind, express or implied, as to the operation of their services, or the information, content or materials included therein. You expressly agree that your use of these services, their content, and any services or items obtained from us is at your sole risk.
      </p>

      <div class="mt-12 p-6 bg-[#FAF8F2] border-2 border-[#E6DFC7] rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-[#0084CC] shrink-0 border border-[#E6DFC7]">
          <Mail class="w-6 h-6" />
        </div>
        <div>
          <h3 class="text-lg font-black text-[#006094] uppercase tracking-wider m-0 mb-1">Contact Us</h3>
          <p class="text-xs text-slate-500 mb-0">If you have questions about these Terms, please contact us via our main website at <a href="https://xophz.com" target="_blank" class="text-[#0084CC] underline hover:text-[#006094]">xophz.com</a>.</p>
        </div>
      </div>
    </div>
  </div>
</div>

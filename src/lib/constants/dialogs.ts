export const DIALOGS = {
  standbyWizard: {
    step1: "Right-o! Where are you looking to fly today? Pick a destination theme below so we can find the perfect island for you!",
    step2: (themeName: string) => `Got it! ${themeName} sounds great. When you plan on traveling?`,
    step3: "Any special requests or memos for the pilots? A good memo helps them know exactly why you want to visit!",
    step4: "All set! Review your ticket details below. Should I put you on the radar?"
  },
  standbyTab: {
    active: "Can't find an open airport gate that matches your travel itinerary? File a Standby Request to alert online pilots looking to match passenger lists! Tell me where and when you want to fly. I'll add you to the global standby radar so Wilbur can find flights for you!"
  },
  hubWizard: {
    step1: "Roger that! Let's get this seaplane ready for boarding. First, what are the flight details?",
    step2: "Copy that! Now, what kind of visitors are you looking for? Pick a gate theme category!",
    step3: "We need a flight plan description so passengers know what to expect! Tell 'em what's going on!",
    step4: "Loud and clear! Provide your 5-digit Dodo Code™ to open the gates now, or leave it blank to create a recurring flight plan for later!",
    step5: "Got it! Let's set up your routine opening hours so passengers know when to expect you."
  },
  departuresTab: {
    active: "Hey hey! Welcome to the Departure Gates. Search for open gates or hop on standby so to put you on the radar. Let's get you checked in and set up with a Dodo Code™!"
  },
  orvilleIntro: {
    active: "Right-o! Welcome to the Dodo Airlines online terminal! Here you can check the radar for active flights, broadcast your own Dodo Code, and coordinate island visits with pilots across the globe!"
  },
  hubTab: {
    active: "Roger that! Seaplane engine oil looking steady, props balanced. All we need is your 5-digit Dodo Code™ and we'll connect your airport terminal gateway so other islanders can book tickets!"
  },
  directoryTab: {
    active: "Welcome to the DAL Flyers Directory! Check out customized passports from all our active flyers. Give a passport a tap to check trust ratings or vouch for them with a Good Apple!"
  },
  passportTab: {
    active: "Hey hey! Welcome to Dodo Airlines! Here is your official Frequent Flyer Passport. Keep your details and custom title up-to-date, and make sure to stamp your Stamp Book for FF Miles!"
  },
  interactiveWelcome: {
    welcome: "Right-o! Welcome to the front desk at Dodo Airlines. 🦤 I'm Orville, your dispatcher, gate manager, and personal flight coordinator today!",
    intro: "This online terminal is the ultimate community hub! Here, you can search active gates to visit other islands, or broadcast your own Dodo Code™ to host guests!",
    modes: "We support two travel modes depending on your flying preference. We've got standard flight departures and relaxing dream visits! Take a peek at both:",
    walkthrough: "The flight process is simple: If you're hosting, file a flight plan to list your gate. If you're flying, just browse active departures, check in, get the Dodo Code™, and fly!",
    authChoice: "Before you head to the gate, let's look up your Frequent Flyer Passport! This helps builds trust in our community. Enter your email so we can send your a secure access code.",
    verifyCode: "Excellent! I've just sent a 6-digit flight access code to your email. Enter it below to retrieve your passport profile!",
    printPassport: "Wonderful! We've retrieved your credentials. Let's customize your official Frequent Flyer Passport and register your island seaplane!"
  },
  cockpitTab: {
    dalIntro: "Welcome to your Private Flight Hangar! File a Flight Plan and open your gates to the skies. Pick a clear theme, and we'll scan the airwaves to match you with the perfect standby passengers! Roger that! Seaplane engine oil looking steady, props balanced. You can provide your Dodo Code™ now to open the gates immediately, or add it later when you're ready to board!",
    lunaIntro: "Welcome to the library of dreams... Plan your slumber now. You may provide your Doze Code immediately, or wait until you are fully ready to let others drift into your island.",
    dalScheduled: "Your flight is scheduled! Whenever you're ready to open the gates, just give me your 5-digit Dodo Code™ and we'll clear you for boarding.",
    lunaScheduled: "Your dream is scheduled... Provide your Doze Code when you are ready to let others drift into your island's slumber."
  },
  logoutModal: {
    prompt: "Are you sure you want to log out of the Dodo Airlines Terminal? We'll save your passport details!"
  }
};

export const DIALOGS = {
	// --- ORVILLE: Front Desk & Booking ---
	standbyWizard: {
		step1: "Right-o! Where are we flying today? Pick a destination theme and I'll scan the radar!",
		step2: (themeName: string) =>
			`Loud and clear! ${themeName} it is. When are you looking to take off?`,
		step3: 'Any special requests? A good memo helps them know exactly why you want to visit!',
		step4: 'All set! Double-check your ticket details below. Ready to hit the global standby radar?'
	},
	standbyTab: {
		active:
			"No open gates matching your itinerary? File a Standby Request! Tell me when and where, and I'll put you on the radar so Wilbur can spot a flight for you!"
	},
	hubWizard: {
		step1:
			"Roger that! Let's get your gate ready for visitors. First up, what are your flight details?",
		step2: 'Copy that! What kind of visitors are you looking for? Pick a gate theme!',
		step3: "Let's add a flight plan description! Give your passengers the full itinerary.",
		step4:
			'Loud and clear! Enter the 5-digit DODO CODE so I can start flying now, or leave it blank to schedule for later.',
		step5:
			"Got it! Let's set your operating hours so passengers know exactly when to expect your gate open."
	},
	departuresTab: {
		active:
			"Hey hey! Welcome to the Departure Gates! Search open gates or hop on standby. Let's get you checked in!"
	},
	orvilleIntro: {
		active:
			'Right-o! Welcome to the DAL online terminal! Check the radar for flights, broadcast your DODO CODE, and coordinate with others worldwide!'
	},
	directoryTab: {
		active:
			'Welcome to the DAL Flyers Directory! Browse active passports, check trust ratings, or vouch for villagers with a Good Apple!'
	},
	passportTab: {
		active:
			'Hey hey! Here is your official Frequent Flyer Passport! Keep your details updated and collect stamps for FF Miles!'
	},
	interactiveWelcome: {
		welcome:
			"Right-o! Welcome to the DAL Gateway Online Terminal! I'm Orville 🦤, your personal flight dispatcher!",
		intro:
			'This terminal acts as your online community airport hub to ACNH! Search for active islands or dreams to visit, or broadcast your Doze/DODO CODE to host guests!',
		modes:
			'We offer two travel modes! Choose between standard DAL flight departures or relaxing dream visits with Luna!',
		walkthrough:
			"It's easy! Hosting? File a flight plan. Flying? Browse departures, check in, grab a DODO CODE, and take off!",
		authChoice:
			"To continue, we'll need your Frequent Flyer passport! Tell me your email so I can send you a secure access code.",
		verifyCode:
			"Excellent! I've sent a 6-digit access code to your email. Enter it below to pull up your passport!",
		printPassport:
			"Wonderful! Credentials verified. Let's customize your official passport and register your seaplane!",
		xpInfo:
			'The more you fly, the more you earn! Collect FF Miles by participating, and unlock stamps to show off on your passport!'
	},
	logoutModal: {
		prompt:
			"Ready to log out of the DAL Terminal? Don't worry, we'll keep your passport safe at the desk!"
	},

	// --- WILBUR: Hangar & Takeoff ---
	hubTab: {
		active:
			"This is November Oscar Whisker. Props are balanced and burners are ready! Just patch through that 5-digit DODO CODE and I'll green-light this bird for takeoff!"
	},

	// --- MIXED: The Cockpit/Dream Library ---
	cockpitTab: {
		// Wilbur
		dalIntro:
			'Wilbur here. Welcome to your Private Flight Hangar! File a Flight Plan and open your gates. Radio in your DODO CODE to take off immediately, or stash it for later!',
		// Luna
		lunaIntro:
			'Welcome to the library of dreams... I am Luna. Provide your Doze Code now, or wait until you are fully ready to let others drift into your slumber.',
		// Wilbur
		dalScheduled:
			"Flight plan is locked in! Whenever you're ready to open the gates, just radio in that 5-digit DODO CODE and we are cleared for boarding!",
		// Luna
		lunaScheduled:
			'Your dream is scheduled... Provide your Doze Code whenever you are ready to share your slumber with the world.'
	},

	boardingPassModal: {
		dalCheckedIn: (id: string) =>
			`You're all checked in for flight ${id}! Just wait for boarding to commence.`,
		lunaCheckedIn: (id: string) =>
			`Your dream ${id} is ready. We will slumber soon.`,
		dalFull: (cap: number) =>
			`Oh no! This seaplane is at max capacity (${cap} passengers). You can file a standby ticket!`,
		lunaFull: (cap: number) =>
			`This dream is full (${cap} dreamers). Please wait for someone to wake up.`,
		dalBook: (id: string) =>
			`Ready to board flight ${id}? Let's get your boarding pass printed!`,
		lunaBook: (id: string) =>
			`Are you ready to enter dream ${id}? Let's print your dream ticket.`
	}
};

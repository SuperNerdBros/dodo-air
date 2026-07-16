export const DIALOGS = {
	// --- ORVILLE / LUNA: Front Desk & Booking ---
	standbyWizard: {
		step1: "Right-o! Where are we flying today? Pick a destination theme and I'll scan the radar!",
		lunaStep1: 'Welcome, dreamer... What kind of dreamscape are you seeking? Choose a theme.',
		step2: (themeName: string) =>
			`Loud and clear! ${themeName} it is. When are you looking to take off?`,
		lunaStep2: (themeName: string) => `I see... A ${themeName} dream. When shall you drift off?`,
		step3: 'Any special requests? A good memo helps them know exactly why you want to visit!',
		lunaStep3: 'What desires do you hold? A gentle memo helps guide the dream to you.',
		step4:
			'All set! Double-check your ticket details below. Ready to hit the global standby radar?',
		lunaStep4: 'It is written. Review your intentions below before we enter the dreamscape.'
	},
	standbyTab: {
		active:
			"No open gates matching your itinerary? File a Standby Request! Tell me when and where, and I'll put you on the radar so Wilbur can spot a flight for you!",
		lunaActive:
			'Cannot find the dream you seek? Leave your desires here, and we will wait for a dreamer to open their mind to you.'
	},
	hubWizard: {
		step1:
			"Roger that! Let's get your gate ready for visitors. First up, what are your flight details?",
		lunaStep1: 'Ah, you wish to share a dream... Tell me, what form does your island take?',
		step2: 'Copy that! What kind of visitors are you looking for? Pick a gate theme!',
		lunaStep2: 'I see. And what manner of spirits do you wish to invite into your slumber?',
		step3: "Let's add a flight plan description! Give your passengers the full itinerary.",
		lunaStep3: 'Describe your dream... What will travelers find when they arrive?',
		step4:
			'Loud and clear! Enter the 5-digit DODO CODE so I can start flying now, or leave it blank to schedule for later.',
		lunaStep4:
			'Very well. Provide your DOZE CODE to open the dream now, or leave it blank to wait for a more peaceful hour.',
		step5:
			"Got it! Let's set your operating hours so passengers know exactly when to expect your gate open.",
		lunaStep5: 'When shall this dream be accessible? Let us chart the hours of your slumber.'
	},
	departuresTab: {
		active:
			"Hey hey! Welcome to the Departure Gates! Search open gates or hop on standby. Let's get you checked in!",
		lunaActive:
			'Welcome to the Dreamers directory. Browse active DOZE codes, or await your turn to slumber.'
	},
	flightPreview: {
		active:
			"Right-o! Here are the full details for this flight! Check the gate theme, passenger count, and description. When you're ready, grab your boarding pass and let's get you in the air!",
		lunaActive:
			'Here are the full details for this dream... Review the dreamscape, dreamer count, and description. When you feel ready, obtain your doze code and drift into slumber...'
	},
	orvilleIntro: {
		active:
			'Right-o! Welcome to the DAL online terminal! Check the radar for flights, broadcast your DODO CODE, and coordinate with others worldwide!',
		lunaActive:
			'Welcome to the Dreamscape gateway. Drift through the directory, share your DOZE CODE, and connect with dreamers across the world.'
	},
	directoryTab: {
		active:
			'Welcome to the DAL Flyers Directory! Browse active passports, check trust ratings, or vouch for villagers with a Good Apple!',
		lunaActive:
			'Welcome to the Dream Directory... Browse known Dream Addresses, check lucidity ratings, or leave a Z to show your appreciation.'
	},
	passportTab: {
		active:
			'Hey hey! Here is your official Frequent Flyer Passport! Keep your details updated and collect stamps for FF Miles!',
		lunaActive:
			'This is your record of dreams. Keep your details current, and collect fragments of memories for FF Miles.'
	},
	interactiveWelcome: {
		welcome:
			"Right-o! Welcome to the Unofficial ACNH Community Terminal. I'm Orville 🦤, your personal flight dispatcher.",
		lunaWelcome:
			'Welcome to the Dreamscape gateway... I am Luna 🌙, your guide through the realm of dreams.',
		intro:
			'This terminal acts as an online airport hub! Search for active islands or dreams to visit, or broadcast your Doze/DODO CODE to host guests!',
		lunaIntro:
			'This gateway connects you to the collective slumber... Browse peaceful dreams to visit, or share your own DOZE CODE for others to find.',
		modes:
			'We offer two travel modes. Choose between standard DAL flight departures or relaxing dream visits with Luna!',
		lunaModes:
			'The waking world and the dreaming world... You may choose between standard DAL flights or drifting into a peaceful dream.',
		walkthrough:
			"It's easy! Hosting? File a flight plan. Flying? Browse departures, check in, grab a DODO CODE, and take off!",
		lunaWalkthrough:
			'The path is simple... Provide your DOZE CODE to share your dream, or browse the directory to find a slumber to join.',
		authChoice:
			"To continue, we'll need your Frequent Flyer passport! Tell me your email so I can send you a secure access code.",
		lunaAuthChoice:
			'Before we proceed, I must verify your spirit... Provide your email so I may send you a secure connection.',
		verifyCode:
			"Excellent! I've sent a 6-digit access code to your email. Enter it below to pull up your passport!",
		lunaVerifyCode:
			'The connection is sent... Enter the 6 digits you received to link your spirit to the dreamscape.',
		printPassport:
			"Wonderful! Credentials verified. Let's customize your official passport and register your seaplane!",
		lunaPrintPassport:
			'Your spirit is recognized... Now, let us shape the form you will take within the dream.',
		xpInfo:
			'The more you fly, the more you earn! Collect FF Miles by participating, and unlock stamps to show off on your passport!',
		lunaXpInfo:
			'Every dream visited strengthens your spirit... Collect fragments and memories as you explore.'
	},
	logoutModal: {
		prompt:
			"Ready to log out of the DAL Terminal? Don't worry, we'll keep your passport safe at the desk!",
		lunaPrompt: 'Are you prepared to wake from the dream? Your memories will be kept safe.'
	},
	interactiveAbout: {
		intro: "Hey there! I'm X, the developer behind this terminal. Thanks for stopping by!",
		project:
			"This is an open-source, unofficial companion app for the ACNH community. It's built to make finding and hosting flights easier and more fun.",
		support:
			"Building and running this terminal takes time and jet fuel! If you'd like to support the project, any tip is incredibly appreciated.",
		github:
			"I'd love your help building the community. You can join our Discord, submit issues, or contribute code on GitHub.",
		thankYou:
			'Oh my gosh, thank you so much! Your support means the world to me and helps keep the seaplanes flying!',
		closing:
			'I hope you enjoy the terminal as much as I have creating it. Safe travels, and happy flying!'
	},
	loginFlow: {
		default:
			'To access the DAL terminal, we need to verify your Frequent Flyer passport! Please enter your email address so Orville can send you a secure access code.',
		lunaDefault:
			'To enter the dreamscape, we must verify your spirit... Please provide your email address so Luna may send you a secure connection.',
		verify: (email: string) =>
			`Great! We just sent a temporary flight code to ${email}. What is it?`,
		lunaVerify: (email: string) =>
			`The connection is sent... A temporary dream code was sent to ${email}. What is it?`
	},

	// --- WILBUR / LUNA: Hangar & Takeoff ---
	hubTab: {
		active:
			"This is November Oscar Whisker. Props are balanced and burners are ready! Just patch through that 5-digit DODO CODE and I'll green-light this bird for takeoff!",
		lunaActive:
			'The veil is thin, and the stars align. Provide your 5-digit DOZE CODE, and I will open the gateway to your slumber.'
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
		lunaCheckedIn: (id: string) => `Your dream ${id} is ready. We will slumber soon.`,
		dalFull: (cap: number) =>
			`Oh no! This seaplane is at max capacity (${cap} passengers). You can file a standby ticket!`,
		lunaFull: (cap: number) =>
			`This dream is full (${cap} dreamers). Please wait for someone to wake up.`,
		dalBook: (id: string) => `Ready to board flight ${id}? Let's get your boarding pass printed!`,
		lunaBook: (id: string) => `Are you ready to enter dream ${id}? Let's print your dream ticket.`
	},

	fuelDepot: {
		wilburIntro:
			"Hey kid! We've got a bit of a situation here at the DAL Community Power Station. Our AI algorithms are running on fumes!",
		lunaIntro:
			'Dreamer... the incense that powers this realm is fading. The spirits that guide your journeys require sustenance.',
		wilburMetrics:
			'Every time we generate a Travel Review or power up a Radio Chatter Bot, it drains our jet fuel. If the tank goes dry, those systems go offline!',
		lunaMetrics:
			'Each vision we weave and every whisper in the dark consumes our mystical energy. Without it, the dreamscape will grow quiet.',
		wilburRefuel:
			"This terminal is a community effort! If you've got some spare Bells—err, I mean, real-world currency—you can pump 5,000 gallons into the tank right now!",
		lunaRefuel:
			'If you find value in these dreams, a worldly donation will restore our power. Choose a method below to instantly replenish the incense by 5,000.',
		wilburThankYou:
			"November Oscar Whisker! Thanks for the fuel drop, kid! We operate on the honor system here, so I've already pumped the 5,000 gallons into the tank. Hope you actually sent those Bells!",
		lunaThankYou:
			'Your kindness is felt throughout the dreamscape... I have reignited the incense in good faith. May your spirit remain truthful in its waking hours.'
	},
	
	// --- Trading Post / Middleman ---
	interactiveTrade: {
		intro: "Welcome to the DAL Trading Post! Here you can safely list items you're Looking For (LF) or have For Trade (FT).",
		lunaIntro: "Welcome to the exchange of memories... Here you may offer what you have, and seek what you desire.",
		mmRequest: "Roger that! Requesting a Verified DAL Flight Marshal (Middleman) to oversee your exchange. Please hold while we contact the tower...",
		lunaMmRequest: "A wise choice... I shall summon a trusted guardian to oversee this exchange. Please wait.",
		mmAssigned: "We have a Marshal on the line! They will be opening their gates shortly. Stand by for the DODO CODE.",
		lunaMmAssigned: "A guardian has answered the call. They will open their realm shortly. Prepare yourself.",
		mmAwaitingCode: "Marshal! We need your authorization code. Please open your gates and enter the DODO CODE below.",
		lunaMmAwaitingCode: "Guardian... Please open your gateway and provide the DOZE CODE to allow the dreamers to enter.",
		mmInTransit: "The code is live! Both parties, please head to the airport and fly to the Marshal's island. We'll wait until everyone has landed.",
		lunaMmInTransit: "The gateway is open. Both dreamers, please drift toward the guardian's realm. We shall wait for your arrival.",
		mmDepositing: "Welcome to the drop zone. Please deposit your items in the designated areas and stand back so the Marshal can verify the cargo.",
		lunaMmDepositing: "You have arrived. Please lay your offerings in the designated spaces, and step back so the guardian may inspect them.",
		mmVerifying: "Cargo is down. Marshal, please visually inspect all items to ensure they match the flight manifest.",
		lunaMmVerifying: "The offerings are laid bare. Guardian, please inspect them to ensure they align with the agreed truth.",
		mmDistributing: "Verification complete! Marshal, please distribute the cargo to the respective parties.",
		lunaMmDistributing: "The truth is verified. Guardian, you may now distribute the offerings.",
		mmCompleted: "All cargo distributed. Ground crew is clear. Marshal, please press the MINUS BUTTON (-) to terminate the session and force a secure save!",
		lunaMmCompleted: "The exchange is complete. Guardian, please end the session to safely bind these memories to the waking world."
	}
};

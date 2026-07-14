<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	interface Props {
		onEnterDAL: () => void;
		onEnterLuna: () => void;
	}

	const { onEnterDAL, onEnterLuna }: Props = $props();

	const pluginUrl: string =
		(typeof window !== 'undefined' && (window as any).wpApiSettings?.pluginUrl) || '';
	const mainLogoImg = `${pluginUrl}public/logo.png`;
	const dalPortImg = `${pluginUrl}public/dal-port.png`;
	const lunaImg = `${pluginUrl}public/luna.png`;

	let hoveredSide = $state<'dal' | 'luna' | null>(null);
	let mounted = $state(false);

	$effect(() => {
		const t = setTimeout(() => (mounted = true), 50);
		return () => clearTimeout(t);
	});
</script>

<div
	class="splash-root"
	class:dal-active={hoveredSide === 'dal'}
	class:luna-active={hoveredSide === 'luna'}
>
	<div class="splash-bg"></div>
	<div class="splash-bg bg-dal" class:active={hoveredSide === 'dal'}></div>
	<div class="splash-bg bg-luna" class:active={hoveredSide === 'luna'}></div>

	<!-- Animated Clouds Layer -->
	<div class="clouds-layer" aria-hidden="true">
		<div class="cloud cloud-1"></div>
		<div class="cloud cloud-2"></div>
		<div class="cloud cloud-3"></div>
	</div>

	<div class="particles" aria-hidden="true">
		{#each Array(17) as _, i}
			<span class="particle" style="--i:{i}"></span>
		{/each}
	</div>

	{#if mounted}
		<header class="splash-header" in:fly={{ y: -40, duration: 700, delay: 100, easing: cubicOut }}>
			<img src={mainLogoImg} alt="ACNH Community Online Terminal" class="main-logo" />
			<p class="splash-subtitle">Share your dream getaway today.</p>
			<!-- <div class="logo-badge">✈</div> -->
		</header>

		<main class="portals">
			<!-- DAL Portal -->
			<button
				id="splash-enter-dal"
				class="portal dal-portal"
				class:hovered={hoveredSide === 'dal'}
				onmouseenter={() => (hoveredSide = 'dal')}
				onmouseleave={() => (hoveredSide = null)}
				onclick={onEnterDAL}
				in:fly={{ x: -80, duration: 750, delay: 250, easing: cubicOut }}
				aria-label="Enter Dodo Airlines"
			>
				<div class="portal-glow dal-glow-ring"></div>
				<div class="portal-art">
					<img src={dalPortImg} alt="Dodo Airlines Airport" class="portal-image" />
				</div>
				<div class="portal-content">
					<div class="portal-badge dal-badge">DAL</div>
					<h2 class="portal-name">Dodo Airlines</h2>
					<p class="portal-desc">
						Book flights, host islands & connect with flyers across the archipelago.
					</p>
					<div class="enter-btn dal-btn">
						<span>Let's Fly!</span>
						<span class="btn-arrow">→</span>
					</div>
				</div>
				<div class="portal-shine"></div>
			</button>

			<div class="divider" in:fade={{ duration: 500, delay: 400 }}>
				<span class="divider-dot"></span>
				<span class="divider-label">or</span>
				<span class="divider-dot"></span>
			</div>

			<!-- Luna Portal -->
			<button
				id="splash-enter-luna"
				class="portal luna-portal"
				class:hovered={hoveredSide === 'luna'}
				onmouseenter={() => (hoveredSide = 'luna')}
				onmouseleave={() => (hoveredSide = null)}
				onclick={onEnterLuna}
				in:fly={{ x: 80, duration: 750, delay: 350, easing: cubicOut }}
				aria-label="Enter Luna's Dreams"
			>
				<div class="portal-glow luna-glow-ring"></div>
				<div class="portal-art">
					<img src={lunaImg} alt="Luna's Dreams Airport" class="portal-image luna-img" />
				</div>
				<div class="portal-content">
					<div class="portal-badge luna-badge">✦ LUNA</div>
					<h2 class="portal-name luna-name">Luna's Dreams</h2>
					<p class="portal-desc luna-desc">
						Lucid dream with others or surf addresses across the dreamwaves.
					</p>
					<div class="enter-btn luna-btn">
						<span>Let's Dream!</span>
						<span class="btn-arrow">→</span>
					</div>
				</div>
				<div class="portal-shine"></div>
			</button>
		</main>

		<footer
			class="splash-footer flex flex-col items-center gap-2"
			in:fade={{ duration: 600, delay: 600 }}
		>
			<span>🦤 Choose a portal to begin your journey</span>
			<div class="legal-links text-xs opacity-70 hover:opacity-100 transition-opacity">
				<a
					href="#/terms"
					class="hover:text-white transition-colors underline decoration-white/30 hover:decoration-white"
					>Terms of Service</a
				>
				<span class="mx-2 text-white/30">&bull;</span>
				<a
					href="#/privacy"
					class="hover:text-white transition-colors underline decoration-white/30 hover:decoration-white"
					>Privacy Policy</a
				>
			</div>
		</footer>
	{/if}
</div>

<style>
	.splash-root {
		position: fixed;
		inset: 0;
		z-index: 40;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1.75rem;
		overflow: hidden;
		font-family: 'FOT-RodinBokutoh Pro EB', 'FOT-Seurat Pro B', system-ui, sans-serif;
	}

	.splash-bg {
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, #87ceeb 0%, #c8eaf8 30%, #e8d8f8 70%, #2d1a50 100%);
		background-size: 300% 300%;
		animation: bgShift 12s ease infinite;
		transition: opacity 0.8s ease-in-out;
		opacity: 1;
	}
	.splash-bg.bg-dal {
		background: linear-gradient(135deg, #4bbde8 0%, #87ceeb 50%, #c8eaf8 100%);
		opacity: 0;
	}
	.splash-bg.bg-luna {
		background: linear-gradient(135deg, #1a0b2e 0%, #3d1f6e 50%, #9055d0 100%);
		opacity: 0;
	}
	.splash-bg.active {
		opacity: 1;
	}

	@keyframes bgShift {
		0%,
		100% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
	}

	/* Animated Clouds */
	.clouds-layer {
		position: absolute;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
		z-index: 1;
		opacity: 0.6;
		transition: opacity 0.5s ease;
	}
	.bg-luna.active ~ .clouds-layer {
		opacity: 0.2; /* Dim clouds in Luna mode */
	}

	.cloud {
		position: absolute;
		background: white;
		border-radius: 200px;
		filter: blur(8px);
		animation: drift linear infinite;
	}
	.cloud::before,
	.cloud::after {
		content: '';
		position: absolute;
		background: white;
		border-radius: 50%;
	}

	.cloud-1 {
		width: 300px;
		height: 100px;
		top: 15%;
		left: -350px;
		opacity: 0.4;
		animation-duration: 45s;
		animation-delay: 0s;
	}
	.cloud-1::before {
		width: 150px;
		height: 150px;
		top: -60px;
		left: 40px;
	}
	.cloud-1::after {
		width: 100px;
		height: 100px;
		top: -30px;
		left: 160px;
	}

	.cloud-2 {
		width: 200px;
		height: 70px;
		top: 45%;
		left: -250px;
		opacity: 0.3;
		animation-duration: 35s;
		animation-delay: -15s;
	}
	.cloud-2::before {
		width: 100px;
		height: 100px;
		top: -40px;
		left: 30px;
	}
	.cloud-2::after {
		width: 80px;
		height: 80px;
		top: -20px;
		left: 100px;
	}

	.cloud-3 {
		width: 400px;
		height: 120px;
		bottom: 10%;
		left: -450px;
		opacity: 0.25;
		animation-duration: 60s;
		animation-delay: -30s;
	}
	.cloud-3::before {
		width: 180px;
		height: 180px;
		top: -70px;
		left: 60px;
	}
	.cloud-3::after {
		width: 140px;
		height: 140px;
		top: -40px;
		left: 200px;
	}

	@keyframes drift {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(calc(100vw + 500px));
		}
	}

	.particles {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}
	.particle {
		position: absolute;
		width: calc(3px + (var(--i) * 1.5px));
		height: calc(3px + (var(--i) * 1.5px));
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.55);
		left: calc((var(--i) * 5.5%) + 2%);
		top: calc((var(--i) * 4.8%) + 5%);
		animation: float calc(6s + (var(--i) * 0.4s)) ease-in-out infinite alternate;
		animation-delay: calc(var(--i) * -0.35s);
	}
	@keyframes float {
		from {
			transform: translateY(0) scale(1);
			opacity: 0.35;
		}
		to {
			transform: translateY(-24px) scale(1.2);
			opacity: 0.8;
		}
	}

	.splash-header {
		position: relative;
		z-index: 10;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
		text-align: center;
	}
	.logo-badge {
		width: 52px;
		height: 52px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.7);
		backdrop-filter: blur(12px);
		border: 2px solid rgba(255, 255, 255, 0.9);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.6rem;
		color: #4a5a75;
		box-shadow:
			0 4px 15px rgba(0, 0, 0, 0.15),
			inset 0 2px 4px rgba(255, 255, 255, 0.8);
		animation: spinSlow 14s linear infinite;
		transition:
			color 0.5s ease,
			background 0.5s ease,
			border-color 0.5s ease;
	}
	@keyframes spinSlow {
		to {
			transform: rotate(360deg);
		}
	}

	/* Animated logo colors based on hover state */
	.dal-active .logo-badge {
		color: #1a8cbf;
		background: rgba(255, 255, 255, 0.85);
		border-color: rgba(91, 200, 245, 0.8);
		box-shadow:
			0 4px 20px rgba(91, 200, 245, 0.4),
			inset 0 2px 4px rgba(255, 255, 255, 0.8);
	}
	.luna-active .logo-badge {
		color: #9055d0;
		background: rgba(255, 255, 255, 0.85);
		border-color: rgba(192, 132, 245, 0.8);
		box-shadow:
			0 4px 20px rgba(192, 132, 245, 0.4),
			inset 0 2px 4px rgba(255, 255, 255, 0.8);
	}
	.main-logo {
		height: 200px;
		/* max-width: 90vw; */
		object-fit: contain;
		margin: 0.5rem 0;
		filter: drop-shadow(0 4px 15px rgba(255, 255, 255, 0.4))
			drop-shadow(0 2px 5px rgba(0, 0, 0, 0.3));
		transition: filter 0.6s ease;
	}
	.splash-subtitle {
		font-size: clamp(0.9rem, 2vw, 1.1rem);
		color: #ffffff;
		font-weight: 600;
		margin: 0;
		text-shadow:
			0 2px 12px rgba(150, 180, 230, 0.5),
			0 1px 3px rgba(100, 120, 180, 0.7);
		letter-spacing: 0.02em;
		transition: text-shadow 0.6s ease;
	}

	/* Animated shadows based on hover state */
	.dal-active .main-logo {
		filter: drop-shadow(0 4px 20px rgba(91, 200, 245, 0.7))
			drop-shadow(0 2px 5px rgba(20, 110, 180, 0.5));
	}
	.dal-active .splash-subtitle {
		text-shadow:
			0 2px 15px rgba(40, 160, 230, 0.6),
			0 1px 4px rgba(20, 110, 180, 0.8);
	}

	.luna-active .main-logo {
		filter: drop-shadow(0 4px 20px rgba(192, 132, 245, 0.7))
			drop-shadow(0 2px 5px rgba(110, 40, 180, 0.5));
	}
	.luna-active .splash-subtitle {
		text-shadow:
			0 2px 15px rgba(160, 90, 240, 0.6),
			0 1px 4px rgba(110, 40, 180, 0.8);
	}

	.portals {
		position: relative;
		z-index: 10;
		display: flex;
		flex-direction: row;
		align-items: stretch;
		gap: 0;
	}

	.portal {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.9rem;
		width: clamp(200px, 26vw, 320px);
		padding: 1.75rem 1.4rem 1.6rem;
		border-radius: 2rem;
		border: 1.5px solid rgba(255, 255, 255, 0.35);
		background: rgba(255, 255, 255, 0.18);
		backdrop-filter: blur(20px);
		cursor: pointer;
		overflow: hidden;
		transition:
			transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
			box-shadow 0.35s ease,
			border-color 0.35s ease;
		box-shadow:
			0 8px 32px rgba(0, 0, 0, 0.12),
			inset 0 1px 0 rgba(255, 255, 255, 0.4);
		-webkit-tap-highlight-color: transparent;
		text-align: center;
	}
	.portal.hovered {
		transform: translateY(-10px) scale(1.03);
	}

	.portal-shine {
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, transparent 60%);
		border-radius: inherit;
		pointer-events: none;
	}

	.dal-portal {
		border-color: rgba(135, 206, 235, 0.5);
	}
	.dal-portal.hovered {
		border-color: rgba(91, 200, 245, 0.85);
		box-shadow:
			0 20px 60px rgba(91, 200, 245, 0.35),
			0 4px 16px rgba(0, 0, 0, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.5);
	}

	.luna-portal {
		border-color: rgba(192, 132, 245, 0.4);
		background: rgba(26, 11, 46, 0.32);
	}
	.luna-portal.hovered {
		border-color: rgba(192, 132, 245, 0.9);
		box-shadow:
			0 20px 60px rgba(192, 132, 245, 0.4),
			0 4px 16px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.12);
	}

	.portal-glow {
		position: absolute;
		width: 200%;
		height: 200%;
		top: -50%;
		left: -50%;
		border-radius: 50%;
		opacity: 0;
		transition: opacity 0.4s ease;
		pointer-events: none;
	}
	.hovered .portal-glow {
		opacity: 1;
	}
	.dal-glow-ring {
		background: radial-gradient(ellipse, rgba(91, 200, 245, 0.2) 0%, transparent 65%);
	}
	.luna-glow-ring {
		background: radial-gradient(ellipse, rgba(192, 132, 245, 0.25) 0%, transparent 65%);
	}

	.portal-art {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		height: clamp(120px, 16vw, 200px);
	}
	.portal-image {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
		filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.2));
		transition:
			transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
			filter 0.4s ease;
	}
	.hovered .portal-image {
		transform: scale(1.07) translateY(-5px);
	}
	.luna-img {
		filter: drop-shadow(0 8px 18px rgba(160, 100, 230, 0.35));
	}
	.hovered .luna-img {
		filter: drop-shadow(0 14px 30px rgba(192, 132, 245, 0.55));
	}

	.portal-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.45rem;
		width: 100%;
	}

	.portal-badge {
		font-size: 0.6rem;
		font-weight: 800;
		letter-spacing: 0.14em;
		padding: 0.18rem 0.65rem;
		border-radius: 999px;
		text-transform: uppercase;
	}
	.dal-badge {
		background: rgba(91, 200, 245, 0.22);
		color: #1a8cbf;
		border: 1px solid rgba(91, 200, 245, 0.5);
	}
	.luna-badge {
		background: rgba(192, 132, 245, 0.2);
		color: #d4a0f5;
		border: 1px solid rgba(192, 132, 245, 0.4);
	}

	.portal-name {
		font-size: clamp(1rem, 2.2vw, 1.4rem);
		font-weight: 800;
		margin: 0;
		color: #fff;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	}
	.luna-name {
		color: #f0e4ff;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
	}

	.portal-desc {
		font-size: clamp(0.68rem, 1.3vw, 0.78rem);
		color: rgba(255, 255, 255, 0.85);
		margin: 0;
		line-height: 1.45;
		max-width: 230px;
		text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
	}
	.luna-desc {
		color: rgba(230, 210, 255, 0.85);
	}

	.enter-btn {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		margin-top: 0.35rem;
		padding: 0.5rem 1.2rem;
		border-radius: 999px;
		font-size: 0.82rem;
		font-weight: 700;
		letter-spacing: 0.03em;
		transition:
			transform 0.25s ease,
			gap 0.25s ease;
	}
	.hovered .enter-btn {
		transform: scale(1.05);
		gap: 0.7rem;
	}
	.dal-btn {
		background: linear-gradient(135deg, #5bc8f5, #2196d0);
		color: #fff;
		box-shadow: 0 4px 14px rgba(91, 200, 245, 0.4);
	}
	.luna-btn {
		background: linear-gradient(135deg, #c084f5, #7c3aed);
		color: #fff;
		box-shadow: 0 4px 14px rgba(192, 132, 245, 0.45);
	}

	.btn-arrow {
		display: inline-block;
		transition: transform 0.25s ease;
	}
	.hovered .btn-arrow {
		transform: translateX(4px);
	}

	.divider {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.45rem;
		padding: 0 1.1rem;
		position: relative;
		z-index: 10;
	}
	.divider-label {
		font-size: 0.7rem;
		color: rgba(255, 255, 255, 0.45);
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}
	.divider-dot {
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.3);
	}

	.splash-footer {
		position: relative;
		z-index: 10;
		font-size: 0.72rem;
		color: rgba(255, 255, 255, 0.48);
		letter-spacing: 0.04em;
		animation: pulse 3s ease-in-out infinite;
	}
	@keyframes pulse {
		0%,
		100% {
			opacity: 0.48;
		}
		50% {
			opacity: 0.9;
		}
	}

	@media (max-width: 640px) {
		.splash-root {
			gap: 1rem;
		}
		.splash-header {
			gap: 0.1rem;
			margin-bottom: 0.5rem;
		}
		.logo-badge {
			width: 40px;
			height: 40px;
			font-size: 1.2rem;
		}
		.portals {
			flex-direction: column;
			align-items: center;
		}
		.divider {
			flex-direction: row;
			padding: 0.3rem 0;
		}
		.portal {
			width: min(90vw, 340px);
			padding: 1.25rem 1rem;
			gap: 0.5rem;
			flex-direction: row; /* Horizontal layout for mobile */
			text-align: left;
		}
		.portal-content {
			align-items: flex-start;
		}
		.portal-art {
			width: 120px;
			height: 100px;
			flex-shrink: 0;
		}
		.enter-btn {
			margin-top: 0.2rem;
			padding: 0.4rem 1rem;
			font-size: 0.75rem;
		}
		.portal-desc {
			display: none;
		} /* Hide description on mobile to save space */
	}
</style>

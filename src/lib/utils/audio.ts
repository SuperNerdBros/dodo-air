/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SoundType = 'beep' | 'chatter' | 'success' | 'airplane' | 'bell' | 'thwip' | 'stamp' | 'chime' | 'pop' | 'tally';

let sharedAudioCtx: AudioContext | null = null;

export const playSound = (type: SoundType, isMuted: boolean) => {
	if (isMuted) return;
	try {
		if (typeof window === 'undefined') return;

		if (!sharedAudioCtx) {
			const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
			if (!AudioCtx) return;
			sharedAudioCtx = new AudioCtx();
		}

		const ctx = sharedAudioCtx;
		if (ctx.state === 'suspended') {
			ctx.resume().catch(() => {});
		}

		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.connect(gain);
		gain.connect(ctx.destination);

		if (type === 'beep') {
			osc.type = 'sine';
			osc.frequency.setValueAtTime(800, ctx.currentTime);
			gain.gain.setValueAtTime(0.001, ctx.currentTime);
			gain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 0.02);
			gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
			osc.start();
			osc.stop(ctx.currentTime + 0.1);
		} else if (type === 'success') {
			osc.type = 'triangle';
			osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
			gain.gain.setValueAtTime(0.001, ctx.currentTime);
			gain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 0.03);

			const osc2 = ctx.createOscillator();
			const gain2 = ctx.createGain();
			osc2.connect(gain2);
			gain2.connect(ctx.destination);
			osc2.type = 'triangle';
			osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12); // E5
			gain2.gain.setValueAtTime(0.001, ctx.currentTime + 0.12);
			gain2.gain.linearRampToValueAtTime(0.012, ctx.currentTime + 0.15);
			gain2.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
			osc2.start(ctx.currentTime + 0.12);
			osc2.stop(ctx.currentTime + 0.45);

			const osc3 = ctx.createOscillator();
			const gain3 = ctx.createGain();
			osc3.connect(gain3);
			gain3.connect(ctx.destination);
			osc3.type = 'triangle';
			osc3.frequency.setValueAtTime(783.99, ctx.currentTime + 0.24); // G5
			gain3.gain.setValueAtTime(0.001, ctx.currentTime + 0.24);
			gain3.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.27);
			gain3.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.48);
			osc3.start(ctx.currentTime + 0.24);
			osc3.stop(ctx.currentTime + 0.5);

			gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
			osc.start();
			osc.stop(ctx.currentTime + 0.4);
		} else if (type === 'airplane') {
			osc.type = 'triangle';
			osc.frequency.setValueAtTime(110, ctx.currentTime);
			osc.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 0.8);
			gain.gain.setValueAtTime(0.001, ctx.currentTime);
			gain.gain.linearRampToValueAtTime(0.012, ctx.currentTime + 0.15);
			gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9);
			osc.start();
			osc.stop(ctx.currentTime + 0.95);
		} else if (type === 'bell') {
			osc.type = 'sine';
			osc.frequency.setValueAtTime(783.99, ctx.currentTime); // G5
			gain.gain.setValueAtTime(0.001, ctx.currentTime);
			gain.gain.linearRampToValueAtTime(0.012, ctx.currentTime + 0.04);
			gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
			osc.start();
			osc.stop(ctx.currentTime + 0.45);

			const osc2 = ctx.createOscillator();
			const gain2 = ctx.createGain();
			osc2.connect(gain2);
			gain2.connect(ctx.destination);
			osc2.type = 'sine';
			osc2.frequency.setValueAtTime(987.77, ctx.currentTime + 0.12); // B5
			gain2.gain.setValueAtTime(0.001, ctx.currentTime + 0.12);
			gain2.gain.linearRampToValueAtTime(0.009, ctx.currentTime + 0.16);
			gain2.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.55);
			osc2.start(ctx.currentTime + 0.12);
			osc2.stop(ctx.currentTime + 0.6);
		} else if (type === 'chatter') {
			osc.type = 'square';
			osc.frequency.setValueAtTime(250 + Math.random() * 100, ctx.currentTime);
			gain.gain.setValueAtTime(0.001, ctx.currentTime);
			gain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 0.01);
			gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
			osc.start();
			osc.stop(ctx.currentTime + 0.05);
		} else if (type === 'thwip') {
			osc.type = 'sine';
			osc.frequency.setValueAtTime(400, ctx.currentTime);
			osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
			gain.gain.setValueAtTime(0.001, ctx.currentTime);
			gain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 0.02);
			gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
			osc.start();
			osc.stop(ctx.currentTime + 0.12);
		} else if (type === 'pop') {
			osc.type = 'sine';
			osc.frequency.setValueAtTime(300, ctx.currentTime);
			osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.05);
			gain.gain.setValueAtTime(0.001, ctx.currentTime);
			gain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 0.01);
			gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
			osc.start();
			osc.stop(ctx.currentTime + 0.06);
		} else if (type === 'stamp') {
			osc.type = 'triangle';
			osc.frequency.setValueAtTime(150, ctx.currentTime);
			osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
			gain.gain.setValueAtTime(0.001, ctx.currentTime);
			gain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.02);
			gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
			osc.start();
			osc.stop(ctx.currentTime + 0.2);
		} else if (type === 'chime') {
			osc.type = 'sine';
			osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
			gain.gain.setValueAtTime(0.001, ctx.currentTime);
			gain.gain.linearRampToValueAtTime(0.012, ctx.currentTime + 0.02);
			gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
			osc.start();
			osc.stop(ctx.currentTime + 0.35);
			
			const osc2 = ctx.createOscillator();
			const gain2 = ctx.createGain();
			osc2.connect(gain2);
			gain2.connect(ctx.destination);
			osc2.type = 'sine';
			osc2.frequency.setValueAtTime(1108.73, ctx.currentTime + 0.1); // C#6
			gain2.gain.setValueAtTime(0.001, ctx.currentTime + 0.1);
			gain2.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.12);
			gain2.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
			osc2.start(ctx.currentTime + 0.1);
			osc2.stop(ctx.currentTime + 0.45);
		} else if (type === 'tally') {
			osc.type = 'sine';
			osc.frequency.setValueAtTime(1200, ctx.currentTime);
			osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.03);
			gain.gain.setValueAtTime(0.001, ctx.currentTime);
			gain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 0.01);
			gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
			osc.start();
			osc.stop(ctx.currentTime + 0.06);
		}
	} catch (e) {
		// blocked or unsupported
	}
};

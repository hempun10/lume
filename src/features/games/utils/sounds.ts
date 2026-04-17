/**
 * Tiny Web Audio helpers for Draw & Guess: a short pulse beep used
 * to tick the final 10 seconds on the guesser's side, and a lower
 * buzz played when the round times out without a guess.
 *
 * We lazily construct a single `AudioContext` because browsers
 * disallow creating one before a user gesture. Callers should only
 * invoke these from user-driven code paths (inside effects that run
 * after a round starts is fine — by then the user has clicked
 * through to start the game).
 */

let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
	if (typeof window === "undefined") return null;
	if (ctx) return ctx;
	const Ctor =
		window.AudioContext ||
		(window as unknown as { webkitAudioContext?: typeof AudioContext })
			.webkitAudioContext;
	if (!Ctor) return null;
	try {
		ctx = new Ctor();
		return ctx;
	} catch {
		return null;
	}
}

function beep(opts: {
	frequency: number;
	durationMs: number;
	type?: OscillatorType;
	peakGain?: number;
}) {
	const audio = getContext();
	if (!audio) return;
	// Some browsers suspend until a gesture — best effort resume.
	if (audio.state === "suspended") {
		audio.resume().catch(() => {});
	}
	const { frequency, durationMs, type = "sine", peakGain = 0.15 } = opts;
	const now = audio.currentTime;
	const end = now + durationMs / 1000;

	const osc = audio.createOscillator();
	osc.type = type;
	osc.frequency.setValueAtTime(frequency, now);

	const gain = audio.createGain();
	// Quick attack, short decay — avoids clicks while staying crisp.
	gain.gain.setValueAtTime(0, now);
	gain.gain.linearRampToValueAtTime(peakGain, now + 0.005);
	gain.gain.exponentialRampToValueAtTime(0.0001, end);

	osc.connect(gain).connect(audio.destination);
	osc.start(now);
	osc.stop(end + 0.02);
}

/** Short ~80ms high beep, once per second during the final countdown. */
export function playTickPulse() {
	beep({ frequency: 880, durationMs: 80, type: "sine", peakGain: 0.12 });
}

/** Lower ~400ms buzz when the timer hits zero without a guess. */
export function playTimeoutBuzz() {
	beep({ frequency: 196, durationMs: 420, type: "sawtooth", peakGain: 0.14 });
}

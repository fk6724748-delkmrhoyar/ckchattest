// Simple WebAudio-generated ringtone/ringback loop, no external audio files needed.
let ctx: AudioContext | null = null;
let timer: any = null;
let activeOscillators: OscillatorNode[] = [];

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return ctx;
}

function beep(freq: number, start: number, duration: number, gainVal = 0.15) {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.value = gainVal;
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(c.currentTime + start);
  osc.stop(c.currentTime + start + duration);
  activeOscillators.push(osc);
}

// Incoming call ringtone: classic two-tone ring, repeating every 2s
export function startIncomingRingtone() {
  stopRingtone();
  const c = getCtx();
  if (c.state === 'suspended') c.resume().catch(() => {});
  const cycle = () => {
    beep(950, 0, 0.4, 0.18);
    beep(950, 0.5, 0.4, 0.18);
  };
  cycle();
  timer = setInterval(cycle, 2000);
}

// Outgoing call ringback tone: single long low tone every 3s (like a phone ringback)
export function startRingback() {
  stopRingtone();
  const c = getCtx();
  if (c.state === 'suspended') c.resume().catch(() => {});
  const cycle = () => {
    beep(425, 0, 1, 0.1);
  };
  cycle();
  timer = setInterval(cycle, 3000);
}

export function stopRingtone() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  activeOscillators.forEach((o) => {
    try {
      o.stop();
    } catch {}
  });
  activeOscillators = [];
}

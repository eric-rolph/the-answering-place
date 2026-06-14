let context: AudioContext | null = null;
let ambientTimer: number | undefined;

function ctx(): AudioContext {
  context ??= new AudioContext();
  return context;
}

export function tone(frequency: number, duration = 0.18, volume = 0.035, type: OscillatorType = "sine"): void {
  const audio = ctx();
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration);
  oscillator.connect(gain).connect(audio.destination);
  oscillator.start();
  oscillator.stop(audio.currentTime + duration);
}

export function chord(notes: number[]): void {
  notes.forEach((note, index) => window.setTimeout(() => tone(note, 0.7, 0.018), index * 70));
}

export function beginAmbient(): void {
  if (ambientTimer !== undefined) return;
  ambientTimer = window.setInterval(() => {
    const notes = [110, 146.8, 164.8, 220, 293.7];
    tone(notes[Math.floor(Math.random() * notes.length)], 1.8, 0.006);
  }, 3200);
}

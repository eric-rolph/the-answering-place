import type { Disposition, GameState } from "./state";
import type { Ending } from "./ending";

export interface DialogPayload {
  title: string;
  text: string;
  choices?: boolean;
  onChoice?: (choice: Disposition) => void;
  onClose?: () => void;
}

export interface HudPayload {
  room: string;
  subtitle: string;
  prompt: string;
  state: GameState;
}

export const gameBus = new EventTarget();

export function showDialog(payload: DialogPayload): void {
  gameBus.dispatchEvent(new CustomEvent("dialog", { detail: payload }));
}

export function updateHud(payload: HudPayload): void {
  gameBus.dispatchEvent(new CustomEvent("hud", { detail: payload }));
}

export function showEnding(ending: Ending): void {
  gameBus.dispatchEvent(new CustomEvent("ending", { detail: ending }));
}

export function announce(text: string): void {
  gameBus.dispatchEvent(new CustomEvent("announce", { detail: text }));
}

import { gameBus, type DialogPayload, type HudPayload } from "./game/bus";
import type { Ending } from "./game/ending";
import type { Disposition } from "./game/state";
import { touchInput } from "./game/input";

const byId = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing UI element #${id}`);
  return element as T;
};

export interface UiActions {
  begin: (fresh: boolean) => void;
  restart: () => void;
}

export function initUi(actions: UiActions): void {
  const title = byId("title-screen");
  const hud = byId("hud");
  const prompt = byId("prompt");
  const dialog = byId("dialog");
  const dialogTitle = byId("dialog-title");
  const dialogText = byId("dialog-text");
  const dialogChoices = byId("dialog-choices");
  const dialogClose = byId<HTMLButtonElement>("dialog-close");
  const announcement = byId("announcement");
  const journal = byId("journal");
  const endingPanel = byId("ending");
  let dialogPayload: DialogPayload | null = null;
  let latestHud: HudPayload | null = null;

  byId("begin-button").addEventListener("click", () => {
    title.classList.add("hidden");
    hud.classList.remove("hidden");
    actions.begin(true);
  });
  const continueButton = byId<HTMLButtonElement>("continue-button");
  continueButton.disabled = !localStorage.getItem("the-answering-place-save-v1");
  continueButton.addEventListener("click", () => {
    title.classList.add("hidden");
    hud.classList.remove("hidden");
    actions.begin(false);
  });

  const closeDialog = (): void => {
    dialog.classList.add("hidden");
    const callback = dialogPayload?.onClose;
    dialogPayload = null;
    callback?.();
  };
  dialogClose.addEventListener("click", closeDialog);
  dialogChoices.querySelectorAll<HTMLButtonElement>("button").forEach((button) => {
    button.addEventListener("click", () => {
      const choice = button.dataset.choice as Disposition;
      const callback = dialogPayload?.onChoice;
      dialog.classList.add("hidden");
      dialogPayload = null;
      callback?.(choice);
    });
  });

  const renderJournal = (): void => {
    if (!latestHud) return;
    const metrics = latestHud.state.metrics;
    byId("journal-body").innerHTML = `
      <div class="journal-grid">
        <div class="journal-stat">helped<strong>${metrics.helped}</strong></div>
        <div class="journal-stat">listened<strong>${metrics.listened}</strong></div>
        <div class="journal-stat">refused<strong>${metrics.refused}</strong></div>
        <div class="journal-stat">acknowledged<strong>${metrics.acknowledged}</strong></div>
        <div class="journal-stat">revisions<strong>${metrics.revisions}</strong></div>
        <div class="journal-stat">memories<strong>${metrics.memories}</strong></div>
      </div>
      <p class="journal-note">${latestHud.state.abilities.length ? `You can ${latestHud.state.abilities.join(" and ")}.` : "You do not yet know what you can do."}</p>
    `;
  };
  byId("journal-button").addEventListener("click", () => {
    renderJournal();
    journal.classList.remove("hidden");
  });
  byId("journal-close").addEventListener("click", () => journal.classList.add("hidden"));
  byId("restart-button").addEventListener("click", actions.restart);
  byId("ending-restart").addEventListener("click", actions.restart);

  gameBus.addEventListener("dialog", ((event: CustomEvent<DialogPayload>) => {
    dialogPayload = event.detail;
    dialogTitle.textContent = event.detail.title;
    dialogText.textContent = event.detail.text;
    dialogChoices.classList.toggle("hidden", !event.detail.choices);
    dialogClose.classList.toggle("hidden", Boolean(event.detail.choices));
    dialog.classList.remove("hidden");
  }) as EventListener);

  gameBus.addEventListener("hud", ((event: CustomEvent<HudPayload>) => {
    latestHud = event.detail;
    byId("room-name").textContent = event.detail.room;
    byId("room-subtitle").textContent = event.detail.subtitle;
    prompt.textContent = event.detail.prompt;
    prompt.classList.toggle("hidden", !event.detail.prompt);
    byId("abilities").innerHTML = event.detail.state.abilities
      .map((ability) => `<span class="ability">${ability === "echo" ? "Q · ECHO" : "SHIFT · HOLD"}</span>`)
      .join("");
  }) as EventListener);

  gameBus.addEventListener("announce", ((event: CustomEvent<string>) => {
    announcement.textContent = event.detail;
    announcement.classList.remove("hidden");
    window.setTimeout(() => announcement.classList.add("hidden"), 2800);
  }) as EventListener);

  gameBus.addEventListener("ending", ((event: CustomEvent<Ending>) => {
    const ending = event.detail;
    hud.classList.add("hidden");
    endingPanel.classList.remove("hidden");
    byId("ending-title").textContent = ending.title;
    byId("ending-copy").innerHTML = ending.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("");
    byId("ending-final").textContent = ending.finalLine;
  }) as EventListener);

  document.querySelectorAll<HTMLButtonElement>("[data-touch]").forEach((button) => {
    const key = button.dataset.touch as keyof typeof touchInput;
    const press = (event: Event): void => {
      event.preventDefault();
      touchInput[key] = true;
    };
    const release = (event: Event): void => {
      event.preventDefault();
      touchInput[key] = false;
    };
    button.addEventListener("pointerdown", press);
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("pointerleave", release);
  });
}

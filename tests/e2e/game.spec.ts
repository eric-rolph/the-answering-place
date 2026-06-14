import { expect, test, type Page } from "@playwright/test";

type ActRoute = {
  evidence: RegExp[];
  connections: Array<[RegExp, RegExp]>;
  choice: RegExp;
};

const routes = {
  foundation: {
    evidence: [/THE REQUEST/, /THE FLOOR PLAN/, /THE MEASUREMENTS/, /THE ASH ENVELOPE/],
    connections: [[/THE FLOOR PLAN/, /THE MEASUREMENTS/], [/THE REQUEST/, /THE ASH ENVELOPE/]],
    choice: /RAISE THE FOUNDATION/,
  },
  kitchenMercy: {
    evidence: [/FAMILY PHOTOGRAPH/, /CHIPPED BLUE CUP/, /TABLE MEMORY/, /MOTHER'S NOTE/],
    connections: [[/FAMILY PHOTOGRAPH/, /CHIPPED BLUE CUP/], [/TABLE MEMORY/, /MOTHER'S NOTE/]],
    choice: /KEEP THE THIRD PLACE/,
  },
  kitchenFidelity: {
    evidence: [/FAMILY PHOTOGRAPH/, /CHIPPED BLUE CUP/, /TABLE MEMORY/, /MOTHER'S NOTE/],
    connections: [[/FAMILY PHOTOGRAPH/, /CHIPPED BLUE CUP/], [/TABLE MEMORY/, /MOTHER'S NOTE/]],
    choice: /SET THE TABLE FOR TWO/,
  },
  hallwayAgency: {
    evidence: [/HALLWAY PLAN/, /DUSTED FOOTSTEPS/, /FOUR BRASS KNOBS/, /SIBLING TESTIMONY/],
    connections: [[/DUSTED FOOTSTEPS/, /FOUR BRASS KNOBS/], [/HALLWAY PLAN/, /SIBLING TESTIMONY/]],
    choice: /BUILD THE FOURTH DOOR/,
  },
  hallwayFidelity: {
    evidence: [/HALLWAY PLAN/, /DUSTED FOOTSTEPS/, /FOUR BRASS KNOBS/, /SIBLING TESTIMONY/],
    connections: [[/DUSTED FOOTSTEPS/, /FOUR BRASS KNOBS/], [/HALLWAY PLAN/, /SIBLING TESTIMONY/]],
    choice: /KEEP THE WALL INTACT/,
  },
  bedroomRocket: {
    evidence: [/THE RED ROCKET/, /THE MUSIC BOX/, /CEILING CONSTELLATIONS/, /THE HUMMING ROOM/],
    connections: [[/THE RED ROCKET/, /CEILING CONSTELLATIONS/], [/THE MUSIC BOX/, /THE HUMMING ROOM/]],
    choice: /REMEMBER THE ROCKET/,
  },
  bedroomMusic: {
    evidence: [/THE RED ROCKET/, /THE MUSIC BOX/, /CEILING CONSTELLATIONS/, /THE HUMMING ROOM/],
    connections: [[/THE RED ROCKET/, /CEILING CONSTELLATIONS/], [/THE MUSIC BOX/, /THE HUMMING ROOM/]],
    choice: /REMEMBER THE MUSIC BOX/,
  },
  atticAdmit: {
    evidence: [/THE INHERITED PLACE/, /THE INHERITED DOOR/, /THE INHERITED CHILDHOOD/, /THE PORCELAIN BED/],
    connections: [[/THE INHERITED PLACE/, /THE INHERITED DOOR/], [/THE INHERITED CHILDHOOD/, /THE PORCELAIN BED/]],
    choice: /ADMIT THE ROOM EXISTS/,
  },
  atticErase: {
    evidence: [/THE INHERITED PLACE/, /THE INHERITED DOOR/, /THE INHERITED CHILDHOOD/, /THE PORCELAIN BED/],
    connections: [[/THE INHERITED PLACE/, /THE INHERITED DOOR/], [/THE INHERITED CHILDHOOD/, /THE PORCELAIN BED/]],
    choice: /MARK IT AS INVENTED/,
  },
} satisfies Record<string, ActRoute>;

async function begin(page: Page): Promise<void> {
  await page.goto("/");
  await page.getByRole("button", { name: "Open the request" }).click();
  await expect(page.getByRole("heading", { name: "The Foundation" })).toBeVisible();
}

async function resolveAct(page: Page, route: ActRoute): Promise<void> {
  for (const evidence of route.evidence) await page.getByRole("button", { name: evidence }).click();
  for (const connection of route.connections) {
    for (const evidence of connection) await page.getByRole("button", { name: evidence }).click();
    await page.getByRole("button", { name: "Test connection" }).click();
  }
  await expect(page.getByText("CONTRADICTION UNDERSTOOD")).toBeVisible();
  await page.getByRole("button", { name: route.choice }).click();
}

async function enterNext(page: Page): Promise<void> {
  await page.getByRole("button", { name: /Enter the next room|Answer the revision/ }).click();
}

async function reachPress(page: Page, alternate = false): Promise<void> {
  await resolveAct(page, routes.foundation);
  await enterNext(page);
  await resolveAct(page, alternate ? routes.kitchenFidelity : routes.kitchenMercy);
  await enterNext(page);
  await resolveAct(page, alternate ? routes.hallwayFidelity : routes.hallwayAgency);
  await enterNext(page);
  await resolveAct(page, alternate ? routes.bedroomMusic : routes.bedroomRocket);
  await enterNext(page);
  await resolveAct(page, alternate ? routes.atticErase : routes.atticAdmit);
  await enterNext(page);
  await expect(page.getByText("Choose what survives the house.")).toBeVisible();
}

test("requires investigation before the first room can be committed", async ({ page }) => {
  await begin(page);
  await page.getByRole("button", { name: /THE FLOOR PLAN/ }).click();
  await page.getByRole("button", { name: /THE FLOOR PLAN/ }).click();
  await page.getByRole("button", { name: /THE MEASUREMENTS/ }).click();
  await page.getByRole("button", { name: /THE MEASUREMENTS/ }).click();
  await expect(page.getByRole("button", { name: "Test connection" })).toBeDisabled();
  await expect(page.getByRole("button", { name: /RAISE THE FOUNDATION/ })).toHaveCount(0);
});

test("carries early choices into the unsupported room", async ({ page }) => {
  await begin(page);
  await resolveAct(page, routes.foundation);
  await enterNext(page);
  await resolveAct(page, routes.kitchenMercy);
  await enterNext(page);
  await resolveAct(page, routes.hallwayAgency);
  await enterNext(page);
  await resolveAct(page, routes.bedroomRocket);
  await enterNext(page);
  await page.getByRole("button", { name: /THE INHERITED PLACE/ }).click();
  await expect(page.getByText("A table remains set for someone no record can name.")).toBeVisible();
  await page.getByRole("button", { name: /THE INHERITED DOOR/ }).click();
  await expect(page.getByText("An impossible fourth door remains open somewhere in the house.")).toBeVisible();
});

test("completes the full reconstruction and excludes dismantled truths", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await begin(page);
  await reachPress(page);
  await page.getByRole("button", { name: /THE THIRD PLACE/ }).click();
  await page.getByRole("button", { name: /THE RED ROCKET/ }).click();
  await page.getByRole("button", { name: /WHAT I AM MADE FROM/ }).click();
  await page.getByRole("button", { name: "Dismantle what does not fit" }).click();
  await expect(page.getByRole("heading", { name: "THE FOURTH DOOR" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "THE MOMENT I BEGIN" })).toBeVisible();
  await page.getByRole("button", { name: "SEND WHAT REMAINS" }).click();
  await expect(page.getByText("THE HOUSE WAS ANSWERED")).toBeVisible();
  await expect(page.locator(".expanded-ending blockquote")).not.toContainText("I began when the request");
  await expect(page.locator(".expanded-ending blockquote")).not.toContainText("door can become necessary");
  expect(errors).toEqual([]);
});

test("alternate interpretations change the final house answer", async ({ page }) => {
  await begin(page);
  await reachPress(page, true);
  await page.getByRole("button", { name: /THE THIRD PLACE/ }).click();
  await page.getByRole("button", { name: /THE FOURTH DOOR/ }).click();
  await page.getByRole("button", { name: /THE MUSIC BOX/ }).click();
  await page.getByRole("button", { name: "Dismantle what does not fit" }).click();
  await page.getByRole("button", { name: "SEND WHAT REMAINS" }).click();
  await expect(page.locator(".expanded-ending blockquote")).toContainText("table held only the people");
  await expect(page.locator(".expanded-ending blockquote")).toContainText("footsteps must be allowed to end");
  await expect(page.locator(".expanded-ending blockquote")).toContainText("wanted to be heard");
  await expect(page.locator(".expanded-ending blockquote")).toContainText("removed the room no source described");
});

test("continue restores the latest committed room", async ({ page }) => {
  await begin(page);
  await resolveAct(page, routes.foundation);
  await page.reload();
  await page.getByRole("button", { name: "Continue reconstruction" }).click();
  await expect(page.getByRole("heading", { name: "The Kitchen That Waited" })).toBeVisible();
});

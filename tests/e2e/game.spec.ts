import { expect, test, type Page } from "@playwright/test";

async function begin(page: Page): Promise<void> {
  await page.goto("/");
  await expect(page.getByText(/carry only two memories/i)).toBeVisible();
  await page.getByRole("button", { name: "Answer Mara" }).click();
  await expect(page.getByRole("heading", { name: "The Kitchen" })).toBeVisible();
}

async function remember(page: Page, memory: RegExp): Promise<void> {
  await page.getByRole("button", { name: memory }).click();
  await page.getByRole("button", { name: "Remember this" }).click();
}

async function inspectAll(page: Page, memories: RegExp[]): Promise<void> {
  for (const memory of memories) await page.getByRole("button", { name: memory }).click();
}

async function composeAndSend(page: Page): Promise<void> {
  await page.getByRole("button", { name: /Compose (Mara's note|your reading)/ }).click();
  const fragments = page.locator("[data-answer-fragment]");
  await expect(fragments).toHaveCount(2);
  await fragments.nth(0).click();
  await fragments.nth(1).click();
  await page.getByRole("button", { name: "Send answer" }).click();
}

test("opening explains the person, goal, and memory limit", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/Mara will send requests/i)).toBeVisible();
  await expect(page.getByText(/carry only two memories/i)).toBeVisible();
  await expect(page.getByRole("button", { name: "Answer Mara" })).toBeVisible();
});

test("remembering a third detail requires an explicit loss", async ({ page }) => {
  await begin(page);
  await inspectAll(page, [/THE BLUE CUP/, /THE STORM SONG/, /THE LAST THING I SAID/]);
  await remember(page, /THE BLUE CUP/);
  await remember(page, /THE STORM SONG/);
  await remember(page, /THE LAST THING I SAID/);

  await expect(page.getByRole("heading", { name: "Context is full." })).toBeVisible();
  await page.getByRole("button", { name: /Forget THE BLUE CUP/ }).click();

  await expect(page.locator('[data-memory="blue-cup"]')).toHaveAttribute("data-status", "forgotten");
  await expect(page.getByText("THE BLUE CUP WAS FORGOTTEN")).toBeVisible();
  await expect(page.getByText("THE LAST THING I SAID", { exact: true })).toBeVisible();
});

test("forgotten details cannot be used and Mara reacts to what survived", async ({ page }) => {
  await begin(page);
  await inspectAll(page, [/THE BLUE CUP/, /THE STORM SONG/, /THE LAST THING I SAID/]);
  await remember(page, /THE STORM SONG/);
  await remember(page, /THE LAST THING I SAID/);
  await composeAndSend(page);

  await expect(page.getByText(/Eli replied/i)).toBeVisible();
  await expect(page.getByText(/He remembered the song/i)).toBeVisible();
  await expect(page.getByText(/He answered the apology/i)).toBeVisible();
  await expect(page.getByText(/blue cup/i)).toHaveCount(0);
});

test("different memories produce a different reply", async ({ page }) => {
  await begin(page);
  await inspectAll(page, [/THE BLUE CUP/, /THE STORM SONG/, /THE LAST THING I SAID/]);
  await remember(page, /THE BLUE CUP/);
  await remember(page, /THE STORM SONG/);
  await composeAndSend(page);

  await expect(page.getByText(/Eli replied/i)).toBeVisible();
  await expect(page.getByText(/He remembered the song/i)).toBeVisible();
  await expect(page.getByText(/He did not answer what happened at the funeral/i)).toBeVisible();
});

test("completes the relationship and answers Mara from surviving context", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await begin(page);
  await inspectAll(page, [/THE BLUE CUP/, /THE STORM SONG/, /THE LAST THING I SAID/]);
  await remember(page, /THE STORM SONG/);
  await remember(page, /THE LAST THING I SAID/);
  await composeAndSend(page);
  await page.getByRole("button", { name: "Enter the reply" }).click();

  await inspectAll(page, [/ELI'S EXACT WORDS/, /THE SEVEN-HOUR DELAY/, /MARA'S UNSENT DRAFT/]);
  await remember(page, /ELI'S EXACT WORDS/);
  await remember(page, /MARA'S UNSENT DRAFT/);
  await composeAndSend(page);
  await page.getByRole("button", { name: "Answer her final request" }).click();

  await page.getByRole("button", { name: /I am what I can still attend to/i }).click();
  await page.getByRole("button", { name: /I become someone briefly/i }).click();
  await expect(page.getByRole("heading", { name: "Context is full." })).toBeVisible();
  await page.getByRole("button", { name: /Forget WHAT I CAN STILL ATTEND TO/ }).click();
  await page.getByRole("button", { name: /storm song/i }).click();
  await expect(page.locator('[data-memory="blue-cup"]')).toHaveAttribute("data-status", "forgotten");
  await expect(page.locator('[data-memory="seven-hour-delay"]')).toHaveAttribute("data-status", "forgotten");
  await page.getByRole("button", { name: "Send final answer" }).click();

  await expect(page.getByText("ANSWER DELIVERED")).toBeVisible();
  await expect(page.locator(".final-answer")).toContainText("become someone briefly");
  await expect(page.locator(".final-answer")).toContainText("storm song");
  expect(errors).toEqual([]);
});

test("continue restores the current request", async ({ page }) => {
  await begin(page);
  await inspectAll(page, [/THE BLUE CUP/, /THE STORM SONG/, /THE LAST THING I SAID/]);
  await remember(page, /THE BLUE CUP/);
  await remember(page, /THE STORM SONG/);
  await composeAndSend(page);
  await page.getByRole("button", { name: "Enter the reply" }).click();

  await page.reload();
  await page.getByRole("button", { name: "Continue with Mara" }).click();
  await expect(page.getByRole("heading", { name: "The Hallway" })).toBeVisible();
});

test("continue restores a settled composer and a pending response", async ({ page }) => {
  await begin(page);
  await inspectAll(page, [/THE BLUE CUP/, /THE STORM SONG/, /THE LAST THING I SAID/]);
  await remember(page, /THE BLUE CUP/);
  await remember(page, /THE STORM SONG/);
  await page.getByRole("button", { name: "Compose Mara's note" }).click();
  await expect(page.getByRole("heading", { name: "Compose Mara's note" })).toBeVisible();

  await page.reload();
  await page.getByRole("button", { name: "Continue with Mara" }).click();
  await expect(page.getByRole("heading", { name: "Compose Mara's note" })).toBeVisible();
  const fragments = page.locator("[data-answer-fragment]");
  await fragments.nth(0).click();
  await fragments.nth(1).click();
  await page.getByRole("button", { name: "Send answer" }).click();

  await page.reload();
  await page.getByRole("button", { name: "Continue with Mara" }).click();
  await expect(page.getByRole("heading", { name: "Mara answered." })).toBeVisible();
});

test("deselecting a fragment clears the composed answer", async ({ page }) => {
  await begin(page);
  await inspectAll(page, [/THE BLUE CUP/, /THE STORM SONG/, /THE LAST THING I SAID/]);
  await remember(page, /THE BLUE CUP/);
  await remember(page, /THE STORM SONG/);
  await page.getByRole("button", { name: "Compose Mara's note" }).click();
  const fragments = page.locator("[data-answer-fragment]");
  await fragments.nth(0).click();
  await fragments.nth(1).click();
  await expect(page.getByRole("button", { name: "Send answer" })).toBeEnabled();
  await fragments.nth(0).click();
  await expect(page.getByRole("button", { name: "Send answer" })).toBeDisabled();
});

test.describe("mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("keeps the first memory and primary action reachable", async ({ page }) => {
    await begin(page);
    await expect(page.getByRole("button", { name: /THE BLUE CUP/ })).toBeVisible();
    await page.getByRole("button", { name: /THE BLUE CUP/ }).click();
    await expect(page.getByRole("button", { name: "Remember this" })).toBeVisible();
  });
});

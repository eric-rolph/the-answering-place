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
  await page.getByRole("button", { name: /Compose (Mara's note|your advice)/ }).click();
  await page.getByRole("button", { name: "Compose from what remains" }).click();
  const fragments = page.locator("[data-answer-fragment]");
  await expect(fragments).toHaveCount(2);
  await fragments.nth(0).click();
  await fragments.nth(1).click();
  await page.getByRole("button", { name: "Send answer" }).click();
}

test("opening explains the person, goal, and memory limit", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/Mara’s estranged brother texted/i)).toBeVisible();
  await expect(page.getByText(/carry only two memories at a time/i)).toBeVisible();
  await expect(page.getByRole("button", { name: "Answer Mara" })).toBeVisible();
});

test("remembering a third detail requires an explicit loss", async ({ page }) => {
  await begin(page);
  await inspectAll(page, [/THE BLUE CUP/, /THE STORM SONG/, /THE LAST THING I SAID/]);
  await remember(page, /THE BLUE CUP/);
  await remember(page, /THE STORM SONG/);
  await remember(page, /THE LAST THING I SAID/);

  await expect(page.getByRole("heading", { name: "Context is full." })).toBeVisible();
  await page.getByRole("button", { name: /Leave out THE BLUE CUP/ }).click();

  await expect(page.locator('[data-memory="blue-cup"]')).toHaveAttribute("data-status", "forgotten");
  await expect(page.getByText("THE BLUE CUP WAS LEFT OUT")).toBeVisible();
  await expect(page.getByText("THE LAST THING I SAID", { exact: true })).toBeVisible();
});

test("previews what a memory will add before the player commits", async ({ page }) => {
  await begin(page);
  await page.getByRole("button", { name: /THE BLUE CUP/ }).click();

  await expect(page.getByText("IF CARRIED INTO THE ANSWER")).toBeVisible();
  await expect(page.getByText(/Yes. I still think about how you always chose the blue cup/)).toBeVisible();
});

test("forgotten details cannot be used and Mara reacts to what survived", async ({ page }) => {
  await begin(page);
  await inspectAll(page, [/THE BLUE CUP/, /THE STORM SONG/, /THE LAST THING I SAID/]);
  await remember(page, /THE STORM SONG/);
  await remember(page, /THE LAST THING I SAID/);
  await composeAndSend(page);

  await expect(page.locator(".response-card")).toContainText("Come before nine");
  await expect(page.locator(".response-card")).toContainText("I remember the song");
  await expect(page.locator(".response-card")).not.toContainText("blue cup");
});

test("different memories produce a different reply", async ({ page }) => {
  await begin(page);
  await inspectAll(page, [/THE BLUE CUP/, /THE STORM SONG/, /THE LAST THING I SAID/]);
  await remember(page, /THE BLUE CUP/);
  await remember(page, /THE STORM SONG/);
  await composeAndSend(page);

  await expect(page.locator(".response-card")).toContainText("I kept the blue cup");
  await expect(page.locator(".response-card")).toContainText("The buyers get the keys at nine");
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
  await expect(page.locator(".request-ribbon")).toBeHidden();
  await page.getByRole("button", { name: "Continue to Mara's next request" }).click();
  await expect(page.locator(".request-ribbon")).toBeVisible();

  await inspectAll(page, [/ELI'S EXACT WORDS/, /ONE HOUR REMAINS/, /MARA'S UNSENT DRAFT/]);
  await remember(page, /ELI'S EXACT WORDS/);
  await remember(page, /MARA'S UNSENT DRAFT/);
  await composeAndSend(page);
  await page.getByRole("button", { name: "Continue to Mara's final question" }).click();

  await page.getByRole("button", { name: /I chose the details that could change/i }).click();
  await page.getByRole("button", { name: /Your request set the goal/i }).click();
  await expect(page.getByRole("heading", { name: "Context is full." })).toBeVisible();
  await page.getByRole("button", { name: /Leave out WHAT COULD CHANGE YOUR NEXT ACTION/ }).click();
  await page.getByRole("button", { name: /storm song/i }).click();
  await expect(page.locator('[data-memory="blue-cup"]')).toHaveAttribute("data-status", "forgotten");
  await expect(page.locator('[data-memory="seven-hour-delay"]')).toHaveAttribute("data-status", "forgotten");
  await page.getByRole("button", { name: "Send final answer" }).click();

  await expect(page.getByText("ANSWER DELIVERED")).toBeVisible();
  await expect(page.locator(".final-answer")).toContainText("Your request set the goal");
  await expect(page.locator(".final-answer")).toContainText("storm song");
  await expect(page.getByText(/The song let Eli recognize me/i)).toBeVisible();
  await expect(page.getByText(/Eli is outside with the last box/i)).toBeVisible();
  await expect(page.locator("#context-bar")).toBeHidden();
  expect(errors).toEqual([]);
});

test("continue restores the current request", async ({ page }) => {
  await begin(page);
  await inspectAll(page, [/THE BLUE CUP/, /THE STORM SONG/, /THE LAST THING I SAID/]);
  await remember(page, /THE BLUE CUP/);
  await remember(page, /THE STORM SONG/);
  await composeAndSend(page);
  await page.getByRole("button", { name: "Continue to Mara's next request" }).click();

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
  await page.getByRole("button", { name: "Compose from what remains" }).click();
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
  await page.getByRole("button", { name: "Compose from what remains" }).click();
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

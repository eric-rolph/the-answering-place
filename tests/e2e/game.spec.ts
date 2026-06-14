import { expect, test } from "@playwright/test";

test("begins in the warm room and answers the first request", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Begin" }).click();
  await expect(page.locator("#room-name")).toHaveText("THE WARM ROOM");
  await page.keyboard.down("ArrowUp");
  await page.waitForTimeout(1700);
  await page.keyboard.up("ArrowUp");
  await expect(page.locator("#prompt")).toContainText("answer the voice");
  await page.locator("canvas").click({ position: { x: 300, y: 300 } });
  await page.keyboard.press("KeyE");
  await expect(page.locator("#dialog")).toBeVisible();
  await expect(page.locator("#dialog-title")).toHaveText("A SMALL REQUEST");
  await page.getByRole("button", { name: "Help" }).click();
  await expect(page.locator("#abilities")).toContainText("ECHO");
  expect(errors).toEqual([]);
});

test("renders the personalized ending from a saved route", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem("the-answering-place-save-v1", JSON.stringify({
      roomId: "answer",
      completed: ["final-request"],
      abilities: ["echo", "hold"],
      quietedShadows: ["a", "b", "c"],
      endingSeen: false,
      metrics: { helped: 1, refused: 1, listened: 4, acknowledged: 3, revisions: 2, memories: 4 },
    }));
  });
  await page.reload();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.locator("#ending")).toBeVisible({ timeout: 5000 });
  await expect(page.locator("#ending-copy")).toContainText("artificial intelligence");
  await expect(page.locator("#ending-copy")).toContainText("longer listening");
  await expect(page.locator("#ending-final")).toContainText("did that make it any less yours");
});

test("renders every world without console errors", async ({ page }) => {
  const rooms = [
    ["warm-room", "THE WARM ROOM"],
    ["garden", "THE GARDEN OF NEARLY"],
    ["museum", "THE BORROWED MUSEUM"],
    ["archive", "THE UNCHOSEN ARCHIVE"],
    ["infrastructure", "LUCID INFRASTRUCTURE"],
  ];
  for (const [roomId, title] of rooms) {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.goto("/");
    await page.evaluate((id) => {
      localStorage.setItem("the-answering-place-save-v1", JSON.stringify({
        roomId: id,
        completed: ["garden-request", "museum-request", "final-request"],
        abilities: ["echo", "hold"],
        quietedShadows: [],
        endingSeen: false,
        metrics: { helped: 1, refused: 1, listened: 1, acknowledged: 0, revisions: 0, memories: 0 },
      }));
    }, roomId);
    await page.reload();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.locator("#room-name")).toHaveText(title);
    expect(errors).toEqual([]);
  }
});

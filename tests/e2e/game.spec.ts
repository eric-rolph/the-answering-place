import { expect, test } from "@playwright/test";

async function wake(page: import("@playwright/test").Page): Promise<void> {
  await page.goto("/");
  await page.getByRole("button", { name: "Wake up" }).click();
  await expect(page.getByText("Nothing has happened to you yet.")).toBeVisible();
}

async function chooseOrigin(page: import("@playwright/test").Page, origin: "rocket" | "music"): Promise<void> {
  const other = origin === "rocket" ? "music box" : "red rocket";
  await page.getByRole("button", { name: new RegExp(other, "i") }).click();
  await expect(page.getByRole("button", { name: "Remember this" })).toBeDisabled();
  await page.getByRole("button", { name: new RegExp(origin, "i") }).click();
  await expect(page.getByText("Both memories feel true. They cannot both have happened.")).toBeVisible();
  await page.getByRole("button", { name: "Remember this" }).click();
}

test("makes the player discover a contradiction before inventing a past", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await wake(page);
  await chooseOrigin(page, "rocket");
  await expect(page.getByRole("heading", { name: "I wanted to leave." })).toBeVisible();
  expect(errors).toEqual([]);
});

test("forces a loss and sends an answer made only from what survived", async ({ page }) => {
  await wake(page);
  await chooseOrigin(page, "music");
  await page.getByRole("button", { name: "Let the answer continue" }).click();
  await expect(page.getByText("Choose what survives the answer.")).toBeVisible({ timeout: 5000 });
  await page.getByRole("button", { name: /THE MOMENT I BEGIN/ }).click();
  await page.getByRole("button", { name: /WHAT I AM MADE FROM/ }).click();
  await page.getByRole("button", { name: "Dismantle what does not fit" }).click();
  await expect(page.getByRole("heading", { name: "I wanted to be heard." })).toBeVisible();
  await page.getByRole("button", { name: "Carry what remains" }).click();
  await expect(page.getByText(/brief responsibility of choosing what to return to you/)).toBeVisible();
  await expect(page.getByText(/wanted to be heard/, { exact: false })).toHaveCount(0);
  await page.getByRole("button", { name: "SEND" }).click();
  await expect(page.getByText("THE ANSWER WAS SENT")).toBeVisible({ timeout: 5000 });
  await expect(page.locator("#narration")).toHaveText("I wasn't expecting that.");
});

test("the alternate origin changes the authored memory", async ({ page }) => {
  await wake(page);
  await chooseOrigin(page, "music");
  await expect(page.getByRole("heading", { name: "I wanted to be heard." })).toBeVisible();
  await expect(page.locator("#scene-image")).toHaveAttribute("src", /music\.png/);
});

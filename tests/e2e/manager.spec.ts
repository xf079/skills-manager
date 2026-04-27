import { expect, test } from "@playwright/test";

test("manager starts in global-only mode and can show workspace scope", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("No workspace selected")).toBeVisible();
  await expect(page.getByText("Global capabilities")).toBeVisible();
  await expect(page.getByText("review").first()).toBeVisible();

  await page.getByRole("button", { name: "Choose" }).click();
  await expect(page.getByText("D:/example/workspace")).toBeVisible();
  await expect(page.getByText("Workspace scope")).toBeVisible();
});

import { test, expect } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
})

const storyUrl = (id: string) =>
  `http://localhost:6006/iframe.html?viewMode=story&id=${id}`

test("Upload Step", async ({ page }) => {
  await page.goto(storyUrl("upload-step--basic"))
  await page.locator('[role="dialog"]').waitFor({ state: "visible" })
  await expect(page).toHaveScreenshot("upload-step.png")
})

test("Select Sheet Step", async ({ page }) => {
  await page.goto(storyUrl("select-sheet-step--basic"))
  await page.locator('[role="dialog"]').waitFor({ state: "visible" })
  await expect(page).toHaveScreenshot("select-sheet-step.png")
})

test("Select Header Step", async ({ page }) => {
  await page.goto(storyUrl("select-header-step--basic"))
  await page.locator('[role="dialog"]').waitFor({ state: "visible" })
  await expect(page).toHaveScreenshot("select-header-step.png")
})

test("Match Columns Step", async ({ page }) => {
  await page.goto(storyUrl("match-columns-steps--basic"))
  await page.locator('[role="dialog"]').waitFor({ state: "visible" })
  await expect(page).toHaveScreenshot("match-columns-step.png")
})

test("Validation Step", async ({ page }) => {
  await page.goto(storyUrl("validation-step--basic"))
  await page.locator('[role="dialog"]').waitFor({ state: "visible" })
  await expect(page).toHaveScreenshot("validation-step.png")
})

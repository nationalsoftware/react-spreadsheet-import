import { test, expect } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
})

test("Full import flow", async ({ page }) => {
  const csvPath = "src/stories/static/exampleFile.csv"

  // Open the Basic story and launch the import flow
  await page.goto("http://localhost:6006/iframe.html?viewMode=story&id=react-spreadsheet-import--basic")
  await page.getByRole("button", { name: "Open Flow" }).click()
  await page.locator('[role="dialog"]').waitFor({ state: "visible" })

  // Step 1: Upload — set the CSV file on the hidden dropzone input
  await page.setInputFiles('input[type="file"]', csvPath)

  // Step 2: Select Header — accept the first row as the header
  await page.getByRole("button", { name: "Next" }).waitFor({ state: "visible" })
  await page.getByRole("button", { name: "Next" }).click()

  // Step 3: Match Columns — wait for the step to load then advance
  await page.getByRole("heading", { name: "Match Columns" }).waitFor()
  await page.getByRole("button", { name: "Next" }).click()

  // Step 4: Validation — confirm submission
  // Button is labelled "Confirm" in this step
  await page.getByRole("button", { name: "Confirm" }).waitFor({ state: "visible" })
  await page.getByRole("button", { name: "Confirm" }).click()

  // The sample CSV contains rows with validation errors (invalid age values,
  // unrecognised team names) so a confirmation alert appears
  await page.getByRole("button", { name: "Submit" }).waitFor({ state: "visible" })
  await page.getByRole("button", { name: "Submit" }).click()

  // Verify the flow completed and returned data is displayed
  await expect(page.getByText("Returned data")).toBeVisible()

  // Allow the modal closing animation to finish before the screenshot is captured
  await page.waitForTimeout(500)
})

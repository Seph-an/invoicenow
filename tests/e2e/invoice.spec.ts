import { expect, test } from "@playwright/test";

test("creates, persists, downloads, and resets a quotation", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  await page.getByLabel("Generate quotation").check();
  await expect(page.getByLabel("Quotation number")).toHaveValue("QTN-0001");
  await page.getByLabel("Company name").fill("Acme Africa");
  await page.getByLabel("Item description").fill("Consulting");
  await page.getByLabel("Quantity").fill("3");
  await page.getByRole("spinbutton", { name: "Rate", exact: true }).fill("19.99");
  await page.getByRole("button", { name: "Add discount" }).click();
  await page.getByLabel("Discount (%)").fill("10");
  await page.getByLabel("Tax (%)").fill("16");

  await expect(page.getByText("$62.61", { exact: true })).toBeVisible();
  await page.waitForTimeout(500);
  await page.reload();
  await expect(page.getByLabel("Company name")).toHaveValue("Acme Africa");
  await expect(page.getByLabel("Quotation number")).toHaveValue("QTN-0001");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("qtn-0001.pdf");
  expect((await download.createReadStream())?.readable).toBe(true);

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.getByLabel("Company name")).toHaveValue("Your Company");
  await page.reload();
  await expect(page.getByLabel("Company name")).toHaveValue("Your Company");
});

test("does not overflow the page on a narrow phone", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const sizes = await page.evaluate(() => ({ body: document.body.scrollWidth, viewport: window.innerWidth }));
  expect(sizes.body).toBeLessThanOrEqual(sizes.viewport);
});

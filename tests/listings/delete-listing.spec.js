import { test, expect } from "@playwright/test";
import { login } from "../utils/login";
import { createListing, deleteOpenListing, openListingByTitle } from "../utils/listings";

test("user can delete their own listing", async ({ page }) => {
  await login(page);

  const listing = await createListing(page, {
    title: `qa-delete-${Date.now()}`,
  });

  await openListingByTitle(page, listing.title);
  await deleteOpenListing(page);
  await page.goto(`/listings?q=${encodeURIComponent(listing.title)}`);
  await expect(page.getByText("No listings found")).toBeVisible();
});

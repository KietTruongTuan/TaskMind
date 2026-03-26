import { Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";

import { CustomWorld } from "./shared.steps";

Then('I should see the success toast {string}', {timeout: 10000 }, async function (this: CustomWorld, expectedMsg: string) {
    const toastLocator = this.page.getByRole('status').filter({ hasText: expectedMsg });
    await expect(toastLocator).toBeVisible({ timeout: 10000 });
    // expect the success message to be green
    const textToastLocator = this.page.getByRole('status').filter({ hasText: expectedMsg});
    await expect(textToastLocator).toHaveCSS('color', 'rgb(0, 215, 57)')
});
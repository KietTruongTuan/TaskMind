import { Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { CustomWorld } from './shared.steps'

Then('I should see the generated tasks', {timeout: 40000 }, async function (this: CustomWorld) {
    const statusBadges = await this.page.getByTestId("status-dropdown")
    await expect(statusBadges.first()).toBeVisible({ timeout: 40000 })
});
import { Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { CustomWorld } from './shared.steps'

Then('I should see generated tasks', {timeout: 40000 }, async function (this: CustomWorld) {
    const todoBadges = await this.page.getByTestId("status-dropdown")
    await expect(todoBadges.first()).toBeVisible({timeout: 40000})
});
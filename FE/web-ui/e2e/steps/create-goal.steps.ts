import { When } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { CustomWorld } from './shared.steps'

When('I click the information {string}', async function (this: CustomWorld, name: string) {
    const text = this.page.getByText(name, { exact: true })
    await expect(text.first()).toBeVisible({ timeout: 45000 })
    await text.first().click({ timeout: 45000 })
});
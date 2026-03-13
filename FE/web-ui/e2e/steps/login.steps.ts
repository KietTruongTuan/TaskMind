import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from './shared.steps';

Given('I am on the login page', async function (this: CustomWorld) {
    await this.page.goto('http://localhost:3000/tm/authentication');
});

When('I enter {string} and {string}', async function (this: CustomWorld, email: string, password: string) {
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel("Password").fill(password);
});

When('I click the login button', async function (this: CustomWorld) {
    await this.page.getByRole('button', { name: 'Sign In', exact: true }).click();
});

Then('I should see the {string} page', async function (this: CustomWorld, expectedText: string) {
    await expect(this.page.getByText(expectedText).first()).toBeVisible();
});
Then('I should see the greeting Hi, {string}!', async function (this: CustomWorld, username: string) {
    await expect(this.page.getByRole('heading', {name: `Hi, ${username}!`}).first()).toBeVisible();
});

Then('I should see the {string} section', async function (this: CustomWorld, sectionName: string) {
    await expect(this.page.getByText(sectionName).first()).toBeVisible();
});

Then('I should see the metrics:', async function (this: CustomWorld, dataTable: DataTable) {
    const metrics = dataTable.raw().flat();
    for (const metric of metrics) {
        await expect(this.page.getByText(metric).first()).toBeVisible();
    }
});
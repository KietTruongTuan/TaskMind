import {
  Given,
  Then,
  setWorldConstructor,
  World,
  IWorldOptions,
  When,
  DataTable,
} from "@cucumber/cucumber";
import { expect, Browser, Page, chromium } from "@playwright/test";

const HOST_DOMAIN = 'http://localhost:3000';
export const PAGE_ROUTES: { [key: string]: string } = {
  'Log in': `${HOST_DOMAIN}/tm/authentication`,
  'Dashboard': `${HOST_DOMAIN}/tm/workspace/dashboard`,
  'New Goal': `${HOST_DOMAIN}/tm/workspace/goal/add`,
  'My Goals': `${HOST_DOMAIN}/tm/workspace/goal/my-goals`,
  'All Tasks': `${HOST_DOMAIN}/tm/workspace/task/all-tasks`
};

export class CustomWorld extends World {
  browser!: Browser;
  page!: Page;

  constructor(options: IWorldOptions) {
    super(options);
  }

  async init(requiresAuth: boolean = false, authState?: any): Promise<void> {
    this.browser = await chromium.launch({ headless: false });
    const contextOptions = (requiresAuth && authState)
      ? { storageState: authState }
      : {};

    const context = await this.browser.newContext(contextOptions);
    this.page = await context.newPage();
  }

  async close(): Promise<void> {
    await this.browser.close();
  }
};

setWorldConstructor(CustomWorld);




Given('I am on the {string} page', async function (this: CustomWorld, pageName: string) {
  await this.page.goto(PAGE_ROUTES[pageName]);
});





When('I click the {string} button', async function (this: CustomWorld, buttonName: string) {
  await this.page.getByRole('button', { name: buttonName, exact: true }).click({ timeout: 45000 });
});

When('I click the {string} testId button', async function (this: CustomWorld, buttonId: string) {
  await this.page.getByTestId(buttonId).click({ timeout: 45000 });
});

When('I click the {string} checkbox', async function (this: CustomWorld, checkboxName: string) {
  await this.page.getByRole('checkbox', { name: checkboxName }).click({ timeout: 45000 });
});

When('I enter {string} into the {string} field', async function (this: CustomWorld, inputString: string, fieldName: string) {
  const inputField = this.page.getByLabel(fieldName);
  await inputField.fill(inputString, { timeout: 45000 });
  await inputField.blur();
});

When('I enter {string} into the {string} testId field', async function (this: CustomWorld, inputString: string, fieldId: string) {
  const inputField = this.page.getByTestId(fieldId);
  await inputField.fill(inputString, { timeout: 45000 });
  await inputField.blur();
});

When('I change {string} status to {string}', async function (this: CustomWorld, name: string, newStatus: string) {
  const container = this.page.locator('div').filter({
    hasText: name,
  }).filter({
    has: this.page.getByTestId('status-dropdown'),
  }).last();

  const trigger = container.getByTestId('status-dropdown');
  await trigger.waitFor({ state: 'visible', timeout: 45000 });
  await trigger.click({ timeout: 45000 });

  const option = this.page.getByRole('option', { name: newStatus, exact: true });
  await option.waitFor({ state: 'visible', timeout: 45000 });
  await option.click({ timeout: 45000 });
});

When('I wait for {string} seconds', async function (this: CustomWorld, seconds: string) {
  const secondsNumber = parseInt(seconds, 10);
  await this.page.waitForTimeout(secondsNumber * 1000);
});




Then('I should see the text {string} in {string} color', async function (this: CustomWorld, expectedText: string, expectedColor: string) {
  const textLocator = await this.page.getByText(expectedText, { exact: true })
  await expect(textLocator).toBeVisible({ timeout: 45000 });
  if (expectedColor === 'red') {
    await expect(textLocator).toHaveCSS('color', 'rgb(239, 68, 68)');
  }
  else {
    console.warn(`${expectedColor} is not a recognized color`);
  }
});

Then('I should see the headline {string}', async function (this: CustomWorld, username: string) {
  await expect(this.page.getByRole('heading', { name: username }).first()).toBeVisible({ timeout: 45000 });
});

Then('I should see the {string} text', async function (this: CustomWorld, textContent: string) {
  await expect(this.page.getByText(textContent).first()).toBeVisible({ timeout: 45000 });
});
Then('I should not see the {string} text', async function (this: CustomWorld, textContent: string) {
  await expect(this.page.getByText(textContent).first()).toBeHidden({ timeout: 45000 });
});

Then('I should see the followings:', async function (this: CustomWorld, dataTable: DataTable) {
  const expected = dataTable.raw().flat();
  for (const thing of expected) {
    await expect(this.page.getByText(thing).first()).toBeVisible({ timeout: 45000 });
  }
});

Then('I should see the following components:', async function (this: CustomWorld, dataTable: DataTable) {
  const expected = dataTable.raw().flat();
  for (const componentId of expected) {
    await expect(this.page.getByTestId(componentId).first()).toBeVisible({ timeout: 45000 });
  }
});

Then('I should see the {string} page', async function (this: CustomWorld, pageName: string) {
  const expectedPath = PAGE_ROUTES[pageName]
  if (!expectedPath) {
    throw new Error(`Path of page ${pageName} is not defined!`);
  }
  await expect(this.page).toHaveURL(expectedPath);

  const pageTestId = `${pageName.toLowerCase().replace(/\s/g, '-')}`;
  const tabLocator = this.page.getByTestId(`${pageTestId}-tab`);

  await expect(tabLocator).toBeVisible({ timeout: 45000 });
  await expect(tabLocator).toBeDisabled();
});

Then('I should see the {string} button', async function (this: CustomWorld, expectedButton) {
  const buttonLocator = this.page.getByRole('button', { name: expectedButton, exact: true });
  await expect(buttonLocator).toBeVisible({ timeout: 45000 });
})
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
export const PAGE_ROUTES: {[key: string]: string} = {
  'Log in'      : `${HOST_DOMAIN}/tm/authentication`,
  'Dashboard'   : `${HOST_DOMAIN}/tm/workspace/dashboard`,
  'New Goal'    : `${HOST_DOMAIN}/tm/workspace/goal/add`,
};

export class CustomWorld extends World {
  browser!: Browser;
  page!: Page;  

  constructor(options: IWorldOptions) {
    super(options);
  }

  async init(requiresAuth: boolean = false, authState?: any): Promise<void> {
    this.browser = await chromium.launch();
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





When('I click the {string} button', async function (this: CustomWorld, buttonName) {
    await this.page.getByRole('button', { name: buttonName, exact: true }).click();
});

When('I enter {string} into the {string} field', async function (this: CustomWorld, inputString: string, fieldName: string) {
    await this.page.getByLabel(fieldName).fill(inputString);
});





Then('I should see the text {string}', async function (this:CustomWorld, expectedText: string) {
    await expect(this.page.getByText(expectedText, { exact: true })).toBeVisible();
});

Then('I should see the headline {string}', async function (this: CustomWorld, username: string) {
    await expect(this.page.getByRole('heading', {name: username}).first()).toBeVisible();
});

Then('I should see the followings:', async function (this: CustomWorld, dataTable: DataTable) {
    const metrics = dataTable.raw().flat();
    for (const metric of metrics) {
        await expect(this.page.getByText(metric).first()).toBeVisible();
    }
});

Then('I should see the {string} page', async function (this: CustomWorld, pageName: string) {
    const expectedPath = PAGE_ROUTES[pageName]
    if (!expectedPath) {
      throw new Error(`Path of page ${pageName} is not defined!`)
    }
    await expect(this.page).toHaveURL(expectedPath);
  
    // expect pages to have test id follows format "page-name-tab"
    const pageTestId = `${pageName.toLowerCase().replace(/\s/g, '-')}`;
    const tabLocator = this.page.getByTestId(`${pageTestId}-tab`);

    // tab name must be visible but disabled (currently on that page)
    await expect(tabLocator).toBeVisible();
    await expect(tabLocator).toBeDisabled(); 
});

Then('I should see the {string} button', async function (this:CustomWorld, expectedButton) {
    const buttonLocator = await this.page.getByRole('button', { name: expectedButton, exact: true});
    await expect(buttonLocator).toBeVisible();
})
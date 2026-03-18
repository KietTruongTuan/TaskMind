import {
  Then,
  setWorldConstructor,
  World,
  IWorldOptions,
  When,
  DataTable
} from "@cucumber/cucumber";
import { expect, Browser, Page, chromium } from "@playwright/test";

const PAGE_ROUTES: {[key: string]: string} = {
  'Dashboard': '/dashboard',
}

export class CustomWorld extends World {
  browser!: Browser;
  page!: Page;

  constructor(options: IWorldOptions) {
    super(options);
  }

  async init(): Promise<void> {
    this.browser = await chromium.launch();
    const context = await this.browser.newContext();
    this.page = await context.newPage();
  }

  async close(): Promise<void> {
    await this.browser.close();
  }
}


setWorldConstructor(CustomWorld);

When('I click the {string} button', async function (this: CustomWorld, buttonName) {
    await this.page.getByRole('button', { name: buttonName, exact: true }).click();
});

When('I enter {string} into the {string} field', async function (this: CustomWorld, inputString: string, fieldName: string) {
    await this.page.getByLabel(fieldName).fill(inputString);
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

    await expect(this.page).toHaveURL(new RegExp(`.*${expectedPath}`));
  
    // expect pages to have test id follows format "page-name-tab"
    const pageTestId = `${pageName.toLowerCase().replace(/\s/g, '-')}`;
    const tabLocator = this.page.getByTestId(`${pageTestId}-tab`);

    // tab name must be visible but disabled (currently on that page)
    await expect(tabLocator).toBeVisible();
    await expect(tabLocator).toBeDisabled(); 
});
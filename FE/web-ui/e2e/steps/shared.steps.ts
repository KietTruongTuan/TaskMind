import {
  Given,
  Then,
  setWorldConstructor,
  World,
  IWorldOptions,
  When,
} from "@cucumber/cucumber";
import { expect, Browser, Page, chromium } from "@playwright/test";

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

Given("I am on the homepage", async function (this: CustomWorld) {
  await this.page.goto("http://localhost:3000/");
});

Then("I should see {string}", async function (this: CustomWorld, text: string) {
  await expect(this.page.getByText(text)).toBeVisible();
});

When(
  "I clicks the button {string}",
  async function (this: CustomWorld, buttonText: string) {
    await this.page.getByText(buttonText).click();
  }
);

Then("I should see the url {string}", async function (url: string) {
  await expect(this.page).toHaveURL(url);
});

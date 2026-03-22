import { After, AfterStep, Before, BeforeAll } from "@cucumber/cucumber";
import { chromium } from "@playwright/test";

import { CustomWorld, PAGE_ROUTES } from "../steps/shared.steps";

let sharedAuthState: any = undefined

BeforeAll({ timeout: 30000 }, async function () {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // login the test account once to get token
  await page.goto(PAGE_ROUTES['Log in']);
  await page.getByLabel('Email').fill('example@gmail.com');
  await page.getByLabel('Password').fill('ExamplePassword123');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();

  // wait for login to complete, then store the auth cookies
  await page.waitForURL(PAGE_ROUTES['Dashboard']);
  sharedAuthState = await context.storageState();

  await browser.close();
})

Before(async function (this: CustomWorld, scenario) {
  const requiresAuth = scenario.pickle.tags.some(tag => tag.name === '@auth');
  await this.init(requiresAuth, sharedAuthState);
});

AfterStep(async function (this: CustomWorld, { result }) {
  if (result?.status === "FAILED") {
    const screenshot = await this.page.screenshot({ fullPage: false });
    await this.attach(screenshot, "image/png");
  }
});

After(async function () {
  await this.browser.close();
});

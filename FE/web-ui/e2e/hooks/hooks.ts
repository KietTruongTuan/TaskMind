import { After, AfterStep, Before, BeforeAll, setDefaultTimeout } from "@cucumber/cucumber";
import { chromium } from "@playwright/test";

setDefaultTimeout(45000);

import { CustomWorld, PAGE_ROUTES } from "../steps/shared.steps";

let sharedAuthState: any = undefined

BeforeAll({ timeout: 30000 }, async function () {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(PAGE_ROUTES['Log in']);
  
  await page.getByLabel('Email').fill('example@gmail.com');
  await page.getByLabel('Password', { exact: true }).fill('ExamplePassword123');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();

  try {
    // wait for login to complete
    await page.waitForURL(PAGE_ROUTES['Dashboard'], { timeout: 20000 });
  } catch (error) {
    await page.getByTestId('goto-button').click();
    await page.getByLabel('Username').fill('TestUser');
    await page.getByLabel('Email').fill('example@gmail.com');
    await page.getByLabel('Password', { exact: true }).fill('ExamplePassword123');
    await page.getByLabel('Confirm Password').fill('ExamplePassword123');
    await page.getByRole('button', { name: 'Sign Up', exact: true }).click();
    
    await page.waitForFunction(() => {
      const el = document.querySelector('[data-testid="goto-button"]');
      return el && el.textContent === 'Sign Up';
    }, { timeout: 15000 });

    await page.getByLabel('Email').fill('example@gmail.com');
    await page.getByLabel('Password', { exact: true }).fill('ExamplePassword123');
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    await page.waitForURL(PAGE_ROUTES['Dashboard'], { timeout: 20000 });
  }
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

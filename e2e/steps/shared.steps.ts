import { Given, Then, After } from "@cucumber/cucumber";
import { Browser, chromium, expect, Page } from "@playwright/test";

let browser: Browser;
let page: Page;

Given("I am on the homepage", async function () {
  // Write code here that turns the phrase above into concrete actions
  browser = await chromium.launch();
  page = await browser.newPage();
  await page.goto("http://localhost:3000/");
});

Then("I should see {string}", async function (text: string) {
  // Write code here that turns the phrase above into concrete actions
  await expect(page.getByText(text)).toBeVisible();
});

After(async function () {
  await browser?.close(); // closes Chromium and ends the process
});

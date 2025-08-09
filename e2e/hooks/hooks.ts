import { After, AfterStep, Before } from "@cucumber/cucumber";
import { CustomWorld } from "../steps/shared.steps";


Before(async function (this: CustomWorld) {
  await this.init();
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

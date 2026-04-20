import { Given, Then } from '@cucumber/cucumber';
import { CustomWorld ,PAGE_ROUTES} from './shared.steps';
import { expect } from '@playwright/test';

Given('I am logged in', async function (this: CustomWorld) {
    await this.page.getByLabel('Email').fill('example@gmail.com');
    await this.page.getByLabel('Password').fill('ExamplePassword123');
    await this.page.getByRole('button', {name: 'Sign in', exact: true}).click();
    
    // wait for the login to complete before next step
    await expect(this.page).toHaveURL(PAGE_ROUTES['Log in'])
});





Then('I should see the error toast {string}', async function (this: CustomWorld, expectedErrMsg: string) {
    // scan for the toast error
    const toastLocator = this.page.getByRole('status').filter({ hasText: expectedErrMsg });
    await expect(toastLocator).toBeVisible();
    // expect the error message text to be red
    const textErrLocator = this.page.getByText(expectedErrMsg, { exact: true });
    await expect(textErrLocator).toHaveCSS('color', 'rgb(214, 0, 0)')
});

Then('The {string} button should be disabled', async function (this: CustomWorld, buttonName: string) {
    const buttonLocator = this.page.getByRole('button', { name: buttonName, exact: true });
    await expect(buttonLocator).toBeDisabled();
});
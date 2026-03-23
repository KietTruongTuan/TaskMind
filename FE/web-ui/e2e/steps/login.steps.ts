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





Then('I should see the error toast {string}', async function (this:CustomWorld, expectedErrMsg: string) {
    // expect a toast notification
    const toastLocator = await this.page.getByRole('alert').filter({ hasText: expectedErrMsg });
    // expect the error message to be in red
    await expect(toastLocator).toBeVisible();
    await expect(toastLocator).toHaveClass(/.*red*/)
})
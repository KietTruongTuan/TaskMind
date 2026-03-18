import { Given } from '@cucumber/cucumber';
import { CustomWorld } from './shared.steps';

Given('I am on the login page', async function (this: CustomWorld) {
    await this.page.goto('http://localhost:3000/tm/authentication');
});
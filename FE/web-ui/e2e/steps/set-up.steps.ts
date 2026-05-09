import { Given } from "@cucumber/cucumber";
import { deleteAllGoals, initializeGoalData } from "../helper/data/set-up-data";

Given('Clear all goals in the database', { timeout: 30000 }, async function () {
  await deleteAllGoals();
});

Given('There are some goals in the database', { timeout: 30000 }, async function () {
  await initializeGoalData();
});

@auth @create-goal
Feature: User creates Goal
    As a user
    I want to be able to input a Name, and Deadline, optionally a Description or Tag
    In order to creates a plan executing that Goal

    Scenario: Generate a new goal
        Given I am on the "New Goal" page
        When I enter "Complete capstone project" into the "Name" field
        And I enter "2026-12-12" into the "Deadline" field
        And I enter "Capstone project description" into the "Description" field
        And I click the "Create your plan" button
        Then I should see the following components:
            | task-list                   |
            | goal-chat-input             |
            | goal-chat-send              |
            | goal-chat-message-container |
            | status-dropdown             |
        Then I should see the followings:
            | Complete capstone project |
            | Progress                  |
            | Completed                 |
            | Deadline                  |
            | Estimated time remaining  |
        And I should see the "Save" button

    Scenario: Edit the generated goal and save
        Given I am on the "New Goal" page
        When I enter "Complete capstone project" into the "Name" field
        And I enter "2026-12-12" into the "Deadline" field
        And I enter "Capstone project description" into the "Description" field
        And I click the "Create your plan" button
        And I enter "Focus on implementation" into the "goal-chat-input" testId field
        And I click the "goal-chat-send" testId button
        And I click the information "Complete capstone project"
        And I enter "Complete capstone project v2" into the "edit-goal-name-input" testId field
        And I click the "Save" button
        Then I should see the "Your goal is successfully saved" text

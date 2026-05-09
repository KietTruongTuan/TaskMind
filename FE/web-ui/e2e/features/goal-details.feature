@auth @goal-details

Feature: User view and edit a goal
    As a user
    I want to be able to view and edit my goals

    Background:
        Given Clear all goals in the database
        And There are some goals in the database

    Scenario: View goal details
        Given I am on the "My Goals" page
        When I click the information "Goal 1"
        Then I should see the "Goal 1" text
        And I should see the followings:
            | Goal 1        |
            | Description 1 |
            | 2026-12-31    |
            | To do         |
            | 20%           |
            | Tag 1         |
            | Tag 2         |
            | Task 11       |
            | Task 12       |
            | Task 13       |
            | Task 14       |
            | Task 15       |

    Scenario: Edit goal information and tasks
        Given I am on the "My Goals" page
        When I click the information "Goal 1"
        And I change "Goal 1" status to "In progress"
        And I wait for "3" seconds
        And I click the information "Goal 1"
        And I enter "Edited Goal 1" into the "edit-goal-name-input" testId field
        And I wait for "3" seconds
        And I click the information "Description 1"
        And I enter "Edited Description 1" into the "edit-goal-description-input" testId field
        And I wait for "3" seconds
        And I click the information "2026-12-30"
        And I enter "2027-01-01" into the "edit-goal-deadline-input" testId field
        And I wait for "3" seconds
        And I change "Goal 1" status to "In progress"
        And I wait for "3" seconds
        And I click the information "Task 11"
        And I enter "Edited Task 11" into the "edit-task-name-input" testId field
        And I change "Task 11" status to "Completed"
        Then I should see the followings:
            | Edited Goal 1        |
            | Edited Description 1 |
            | 2027-01-01           |
            | Edited Task 11       |
            | 40%                  |

    Scenario: View and manage tasks in kanban board
        Given I am on the "My Goals" page
        When I click the information "Goal 1"
        And I click the "tab-trigger-board" testId button
        And I drag "Task 11" to "In progress" column
        Then "Task 11" status should be "In progress"

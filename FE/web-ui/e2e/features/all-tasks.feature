@auth @all-tasks
Feature: User manage their tasks through a kanban board
    As a user
    I want to be able to see and manage my tasks in a kanban board

    Background:
        Given Clear all goals in the database
        And There are some goals in the database

    Scenario: View all of my tasks in a kanban board
        Given I am on the "All Tasks" page
        Then I should see the headline "All Tasks"
        And I should see the followings:
            | Task 11 |
            | Task 12 |
            | Task 13 |
            | Task 14 |
            | Task 15 |
        And I should see the following components:
            | kanban-board |

    Scenario: Change status by dragging task between columns
        Given I am on the "All Tasks" page
        When I drag "Task 11" to "In progress" column
        Then "Task 11" status should be "In progress"
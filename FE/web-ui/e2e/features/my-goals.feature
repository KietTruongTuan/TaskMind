@auth @my-goals
Feature: User manage their own goals
    As a user
    I want to be able to see and manage goals that I have created

    Background:
        Given Clear all goals in the database
        And There are some goals in the database

    Scenario: View my created goals
        Given I am on the "My Goals" page
        Then I should see the headline "My Goals"
        And I should see the followings:
            | Goal 1 |
            | Goal 2 |
            | Goal 3 |
            | Goal 4 |
        And I should see the following components:
            | filter-dropdown-trigger |
            | search-bar              |

    Scenario: Search goals
        Given I am on the "My Goals" page
        When I enter "Goal 1" into the "search-bar" testId field
        Then I should see the "Goal 1" text
        And I should not see the "Goal 2" text
    
    Scenario: Filter goals by status
        Given I am on the "My Goals" page
        When I click the "filter-dropdown-trigger" testId button
        And I click the "To do" checkbox
        And I click the "Filter" button 
        Then I should see the "Goal 1" text
        And I should not see the "Goal 2" text

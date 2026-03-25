@auth
Feature: User creates Goal
    As a user
    I want to be able to input a Name, and Deadline, optionally a Description or Tag 
    In order to creates a plan executing that Goal 


    Scenario: Creates a goal with Name and Deadline 
        Given I am on the "New Goal" page
        When I enter "Learn JavaScript" into the "Name" field
        And I enter "2026-12-12" into the "Deadline" field
        And I click the "Create your plan" button
        Then I should see generated tasks
        And I should see the followings:
            # the goal itself should appear as title
            | Learn JavaScript          |
            # the goal metrics
            | Progress                  |
            | Completed                 |
            | Deadline                  |
            | Estimated time remaining  |
        And I should see the "Save" button
        And I should see the "Cancel" button


    




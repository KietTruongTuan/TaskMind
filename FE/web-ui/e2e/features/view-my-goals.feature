@auth
Feature: User view the goal they created
    As a user
    I want to be able to see the goal that I have created
    In order to monitoring my own progress: track created goals, their progress,
    deadline, etc...

    Scenario: View created goals
        Given I am on the "Dashboard" page
        When I click the "My Goals" button
        Then I should see the headline "My Goals"
        And I should see the followings:
            | Track and manage all your goals       |
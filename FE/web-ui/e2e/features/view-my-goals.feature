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

    Scenario: Creates a goal, save it, and view it 
        # navigate to New Goal page to create goal
        Given I am on the "Dashboard" page
        When I click the "New Goal" button

        # create a new goal and save it
        And I enter "Lose weight to get in shape by the end of this year" into the "Name" field
        And I enter "2026-12-31" into the "Deadline" field
        And I click the "Create your plan" button
        Then I should see the generated tasks
        When I click the "Save" button

        # expect to be directed to the My Goals to see the created goal
        Then I should see the success toast "Your goal is successfully saved."
        And I should see the "My Goals" page
        And I should see the followings:
            | Lose weight to get in shape by the end of this year   |

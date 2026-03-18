Feature: User login
    As a user
        I want to be able to login into my account 
            So that i can access the dashboard of my account

    Scenario: Successful login with valid credentials
        Given I am on the login page
        When I enter "example@gmail.com" into the "Email" field
        And I enter "ExamplePassword123" into the "Password" field
        And I click the "Sign In" button
        Then I should see the "Dashboard" page
        And I should see the headline "Hi, TestUser!" 
        And I should see the followings:
            | Recent Goals|
            | Total Goal  |
            | Completed   |
            | In Progress |
            | Ovrdue     |

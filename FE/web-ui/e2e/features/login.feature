Feature: User login
    As a user
        I want to be able to login into my account 
            So that i can access the dashboard of my account

    Scenario: Successful login with valid credentials
        Given I am on the login page
        When I enter "kien.le4941010@hcmut.edu.vn" and "Kien@494"
        And I click the login button
        Then I should see the "Dashboard" page
        And I should see the greeting Hi, "Kien"! 
        And I should see the "Recent Goals" section
        And I should see the metrics:
            | Total Goal  |
            | Completed   |
            | In Progress |
            | Overdue     |

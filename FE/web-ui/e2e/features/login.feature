Feature: User login

    Scenario: Successful login with valid credentials
        Given I am on the login page
        When I enter "concac@gmail.com" and "Kien@494"
        And I click the login button
        Then I should see the "Dashboard" page

    
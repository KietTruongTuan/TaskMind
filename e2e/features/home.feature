Feature: Homepage Starts
    As a user
            I want to see the homepage
                So that I can access the main features of the application

    Scenario: User visits the homepage
        Given I am on the homepage
        Then I should see "Read our docs"

    Scenario: I should visit NextJs Docs Page
        Given I am on the homepage
        When I clicks the button "Read our docs"
        Then I should see the url "http://localhost:3000/demo"

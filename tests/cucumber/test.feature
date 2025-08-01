Feature: Example feature
    As a test script of wdio-cucumber-framework
    I should pass
    to get get published

    Background: Some repeated setup
        Given I choose the "cucumberScenario" scenario
        And   I go on the website "https://mymockpage.com"

    Scenario: Sync Execution
        When  I click on link "=foo"
        Then  the title of the page should be:
        """
        Mock Page Title
        """

    Scenario: Retry Check
        Then  I should fail once but pass on the second run

    @skip(browserName="chrome")
    @skip(browserName=["firefox","safari"])
    Scenario: Skipped... should never be executed
        Then  this test should fail

    Scenario Outline: Multiple Examples
        Given Foo <foo> and Bar <bar> are passed

        @first
        Examples:
                | foo       | bar      |
                | f1        | b1       |

        @second
        Examples:
                | foo       | bar      |
                | f2        | b2       |

    Scenario: data tables
        Given a table step
            | Vegetable | Rating |
            | Apricot   | 5      |
            | Brocolli  | 2      |
            | Cucumber  | 10     |

    Scenario: ignoreUndefinedDefinitions
        Given this step doesn't exist

    Scenario: failAmbiguousDefinitions
        Given this is ambiguous

    @retry
    Scenario: failsTheFirstTimeToCheckRetries
        Then  this steps fails only the first time used

    Scenario: timeout step
        Then this is a step with timeout

    Scenario: Using Snapshot matcher in Cucumber works
        # Test is simply to make sure snapshot matcher doesn't fail
        When I use the snapshot matcher

    Scenario: Supports snapshot testing
        Then it can take a file snapshot
        And  it can take an inline snapshot

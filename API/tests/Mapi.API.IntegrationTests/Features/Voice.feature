Feature: Voice Commands
  As a store owner
  I want to query prices via voice
  So that I can quickly look up item prices hands-free

  Background:
    Given I am authenticated as "voice@example.com" with password "Password123!" and store name "Voice Store"
    And I have an item with name "Milk" and bisaya name "Gatas" and price 50.00

  Scenario: Exact name match returns price
    When I send a voice command "How much is Milk?"
    Then the response status should be 200
    And the voice response should contain "Milk"
    And the voice response should contain "50"

  Scenario: BisayaName match returns price
    When I send a voice command "How much is Gatas?"
    Then the response status should be 200
    And the voice response should contain "Milk"

  Scenario: Item not found returns appropriate message
    When I send a voice command "How much is Unknown?"
    Then the response status should be 200
    And the voice response should contain "couldn't find"

  Scenario: Ambiguous match returns multiple results
    Given I also have an item with name "Gabi" and bisaya name "Gabi" and price 30.00
    When I send a voice command "How much is G?"
    Then the response status should be 200
    And the voice result should be ambiguous

  Scenario: Add new item via voice
    When I send a voice command "Add Sugar price 75"
    Then the response status should be 200
    And the voice response should contain "added"

  Scenario: Duplicate add triggers confirmation
    When I send a voice command "Add Milk price 60"
    Then the response status should be 200
    And the voice result should require confirmation

  Scenario: Confirm add updates item price
    Given I send a voice command "Add Milk price 60" to trigger a confirmation
    When I send a confirm-add request for "Milk" with price 60
    Then the response status should be 200
    And the voice response should contain "60"

  Scenario: Remove trigger deletes the matched item
    Given I have a trigger with phrase "remove" and the Remove action
    When I send a voice command "remove Milk"
    Then the response status should be 200
    And the voice response should contain "Milk"
    When I request GET "/api/v1/items"
    Then the response status should be 200
    And the items list should not contain "Milk"

  Scenario: Remove trigger with unknown item returns not found
    Given I have a trigger with phrase "remove" and the Remove action
    When I send a voice command "remove Unknown"
    Then the response status should be 200
    And the voice response should contain "couldn't find"

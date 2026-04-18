Feature: Voice Commands
  As a store owner
  I want to query and manage prices via voice
  So that I can quickly look up and update item prices hands-free

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

  Scenario: Add trigger asks for price when item does not exist
    Given I have a trigger with phrase "add" and the Add action
    When I send a voice command "add Sugar"
    Then the response status should be 200
    And the voice response should contain "price"
    And the voice result should have pending intent "Add"

  Scenario: Add trigger with existing item asks to confirm update
    Given I have a trigger with phrase "add" and the Add action
    When I send a voice command "add Milk"
    Then the response status should be 200
    And the voice result should require confirmation
    And the voice result should have pending intent "ConfirmUpdate"

  Scenario: Confirm update with yes transitions to asking for new price
    Given I have a trigger with phrase "add" and the Add action
    And I send a voice command "add Milk" to start a pending flow
    When I send a voice command with pending intent "ConfirmUpdate" and pending item "Milk" and transcript "yes"
    Then the response status should be 200
    And the voice result should have pending intent "Update"

  Scenario: Add item via two-step flow
    Given I have a trigger with phrase "add" and the Add action
    And I send a voice command "add Sugar" to start a pending flow
    When I send a voice command with pending intent "Add" and pending item "Sugar" and transcript "75"
    Then the response status should be 200
    And the voice response should contain "added"
    And the voice result should have items modified

  Scenario: Update trigger asks for new price when item exists
    Given I have a trigger with phrase "update" and the Update action
    When I send a voice command "update Milk"
    Then the response status should be 200
    And the voice response should contain "new price"
    And the voice result should have pending intent "Update"

  Scenario: Update item price via two-step flow
    Given I have a trigger with phrase "update" and the Update action
    And I send a voice command "update Milk" to start a pending flow
    When I send a voice command with pending intent "Update" and pending item "Milk" and transcript "80"
    Then the response status should be 200
    And the voice response should contain "80"
    And the voice result should have items modified

  Scenario: Update trigger with unknown item returns not found
    Given I have a trigger with phrase "update" and the Update action
    When I send a voice command "update Unknown"
    Then the response status should be 200
    And the voice response should contain "couldn't find"

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

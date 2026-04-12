Feature: Trigger Management
  As a store owner
  I want to define custom trigger phrases with assigned actions
  So that I can create custom voice commands

  Background:
    Given I am authenticated as "trigger@example.com" with password "Password123!" and store name "Trigger Store"

  Scenario: Create a trigger with an action
    When I create a trigger with phrase "What's the price of" and the Query action
    Then the response status should be 201
    And the trigger response should contain phrase "What's the price of"
    And the trigger response should have an action type of "Query"

  Scenario: Create a trigger without an action returns 400
    When I try to create a trigger with phrase "Missing action" and no action
    Then the response status should be 400

  Scenario: Update a trigger's phrase and action
    Given I have a trigger with phrase "Old phrase" and the Query action
    When I update the trigger phrase to "New phrase" and assign the Add action
    Then the response status should be 200
    And the trigger response should contain phrase "New phrase"
    And the trigger response should have an action type of "Add"

  Scenario: Delete a trigger
    Given I have a trigger with phrase "Delete me" and the Query action
    When I delete the trigger
    Then the response status should be 204

  Scenario: Trigger invocation via voice command
    Given I have an item with name "Milk" and bisaya name "Gatas" and price 50.00
    And I have a trigger with phrase "How much does" and the Query action
    When I send a voice command "How much does milk"
    Then the response status should be 200
    And the voice response should contain "Milk"

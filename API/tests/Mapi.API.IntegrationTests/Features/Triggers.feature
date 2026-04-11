Feature: Trigger and Action Management
  As a store owner
  I want to define custom trigger phrases and linked actions
  So that I can create custom voice commands

  Background:
    Given I am authenticated as "trigger@example.com" with password "Password123!" and store name "Trigger Store"

  Scenario: Create a trigger
    When I create a trigger with phrase "What's the price of"
    Then the response status should be 201
    And the trigger response should contain phrase "What's the price of"

  Scenario: Create an action
    When I create an action with type "Query" and template "{name} costs {price}"
    Then the response status should be 201
    And the action response should contain template "{name} costs {price}"

  Scenario: Link action to trigger
    Given I have a trigger with phrase "Check price of"
    And I have an action with type "Query" and template "{name} is {price}"
    When I link the action to the trigger with sort order 1
    Then the response status should be 204

  Scenario: Delete action linked to trigger fails
    Given I have a trigger with phrase "Ask price"
    And I have an action with type "Query" and template "{name} is {price}"
    And the action is linked to the trigger
    When I try to delete the action
    Then the response status should be 409

  Scenario: Trigger invocation via voice command
    Given I have an item with name "Milk" and bisaya name "Gatas" and price 50.00
    And I have a trigger with phrase "How much does"
    And I have an action with type "Query" and template "{name} is {price}"
    And the action is linked to the trigger with sort order 1
    When I send a voice command "How much does milk"
    Then the response status should be 200
    And the voice response should contain "Milk"

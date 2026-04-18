Feature: Action Catalogue
  As a store owner
  I want to view available actions
  So that I can assign them to my trigger phrases

  Background:
    Given I am authenticated as "actions@example.com" with password "Password123!" and store name "Actions Store"

  Scenario: Get all actions returns exactly 4 seeded actions
    When I request GET "/api/v1/actions"
    Then the response status should be 200
    And the actions list should contain exactly 4 actions

  Scenario: Get all actions includes all ActionTypes
    When I request GET "/api/v1/actions"
    Then the response status should be 200
    And the actions list should contain action type "Query"
    And the actions list should contain action type "Add"
    And the actions list should contain action type "Update"
    And the actions list should contain action type "Remove"

  Scenario: Get all actions returns same results for any user
    When I request GET "/api/v1/actions"
    Then the response status should be 200
    And the actions list should contain exactly 4 actions

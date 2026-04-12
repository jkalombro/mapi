Feature: Action Management
  As a store owner
  I want to manage my actions
  So that I can configure voice response templates

  Background:
    Given I am authenticated as "actions@example.com" with password "Password123!" and store name "Actions Store"

  # =========================================================
  # GET all actions (US2)
  # =========================================================

  Scenario: Get all actions returns user's actions
    Given I have an action with type "Query" and template "The price of {name} is {price}."
    When I request GET "/api/v1/actions"
    Then the response status should be 200
    And the actions list should contain template "The price of {name} is {price}."

  Scenario: Get all actions returns empty array when none exist
    When I request GET "/api/v1/actions"
    Then the response status should be 200
    And the actions list should be empty

  Scenario: Get all actions excludes other user's actions
    Given I am authenticated as "other-actions@example.com" with password "Password123!" and store name "Other Store"
    And I have an action with type "Query" and template "Private template"
    When I am authenticated as "actions2@example.com" with password "Password123!" and store name "My Store"
    And I request GET "/api/v1/actions"
    Then the response status should be 200
    And the actions list should not contain template "Private template"

  # =========================================================
  # POST create action (US1)
  # =========================================================

  Scenario: Create action returns 201 with Location header
    When I create an action with type "Query" and template "{name} costs {price}"
    Then the response status should be 201
    And the action response should contain template "{name} costs {price}"
    And the response should have a Location header

  Scenario Outline: Create action accepts all ActionType string values
    When I create an action with type "<actionType>" and template "Item {name} has been <actionWord>"
    Then the response status should be 201
    And the action response should have action type "<actionType>"

    Examples:
      | actionType | actionWord |
      | Query      | queried    |
      | Add        | added      |
      | Update     | updated    |
      | Remove     | removed    |

  Scenario: Create action with empty ResponseTemplate returns 400
    When I try to create an action with type "Query" and empty template
    Then the response status should be 400

  Scenario: Create action with ResponseTemplate over 500 characters returns 400
    When I try to create an action with type "Query" and template over 500 chars
    Then the response status should be 400

  # =========================================================
  # PUT update action (US3)
  # =========================================================

  Scenario: Update action ResponseTemplate returns 200 with ActionType unchanged
    Given I have an action with type "Query" and template "Original template"
    When I update the action response template to "Updated template"
    Then the response status should be 200
    And the action response should contain template "Updated template"
    And the action response should have action type "Query"

  Scenario: Update action with empty ResponseTemplate returns 400
    Given I have an action with type "Query" and template "Original template"
    When I try to update the action with empty response template
    Then the response status should be 400

  Scenario: Update action with unknown id returns 404
    When I try to update a non-existent action with template "Some template"
    Then the response status should be 404

  # =========================================================
  # DELETE action (US4)
  # =========================================================

  Scenario: Delete unlinked action returns 204
    Given I have an action with type "Query" and template "Deletable template"
    When I delete the action
    Then the response status should be 204

  Scenario: Delete linked action returns 409 Conflict
    Given I have a trigger with phrase "Ask about price"
    And I have an action with type "Query" and template "{name} costs {price}"
    And the action is linked to the trigger
    When I try to delete the action
    Then the response status should be 409

  Scenario: Delete non-existent action returns 404
    When I try to delete a non-existent action
    Then the response status should be 404

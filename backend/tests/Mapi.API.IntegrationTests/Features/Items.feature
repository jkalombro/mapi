Feature: Item Management
  As a store owner
  I want to manage my inventory items
  So that I can track prices and names

  Background:
    Given I am authenticated as "items@example.com" with password "Password123!" and store name "Item Store"

  Scenario: Create a new item
    When I create an item with name "Milk", bisaya name "Gatas", and price 50.00
    Then the response status should be 201
    And the item response should contain name "Milk"

  Scenario: Get all items
    Given I have created an item with name "Rice" and bisaya name "Bugas" and price 100.00
    When I request GET "/api/v1/items"
    Then the response status should be 200
    And the items list should contain "Rice"

  Scenario: Update an existing item
    Given I have created an item with name "Sugar" and bisaya name "Asukal" and price 75.00
    When I update the item name to "Brown Sugar" with bisaya name "Kayumanggi Asukal" and price 80.00
    Then the response status should be 200
    And the item response should contain name "Brown Sugar"

  Scenario: Delete an item
    Given I have created an item with name "Salt" and bisaya name "Asin" and price 20.00
    When I delete the item
    Then the response status should be 204

  Scenario: Data isolation between users
    Given I am authenticated as "user2@example.com" with password "Password123!" and store name "Store 2"
    And user2 has created an item with name "Private Item" and bisaya name "Segreto" and price 10.00
    When I am authenticated as "user1@example.com" with password "Password123!" and store name "Store 1"
    And I request GET "/api/v1/items"
    Then the response status should be 200
    And the items list should not contain "Private Item"

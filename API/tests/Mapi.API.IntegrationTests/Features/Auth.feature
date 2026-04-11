Feature: Authentication
  As a store owner
  I want to register and login to Mapi
  So that I can manage my store securely

  Scenario: Successful registration
    Given I have valid registration details with email "test@example.com" and password "Password123!" and store name "Test Store"
    When I send a POST request to "/api/v1/auth/register"
    Then the response status should be 201
    And the response should contain an access token

  Scenario: Registration with duplicate email fails
    Given a user already exists with email "existing@example.com"
    When I register with email "existing@example.com" and password "Password123!" and store name "Store"
    Then the response status should be 409

  Scenario: Successful login
    Given a registered user with email "login@example.com" and password "Password123!" and store name "Login Store"
    When I login with email "login@example.com" and password "Password123!"
    Then the response status should be 200
    And the response should contain an access token

  Scenario: Login with wrong password fails
    Given a registered user with email "wrongpw@example.com" and password "Correct123!" and store name "Store"
    When I login with email "wrongpw@example.com" and password "WrongPassword!"
    Then the response status should be 404

  Scenario: Login with unknown email fails
    When I login with email "unknown@example.com" and password "AnyPassword!"
    Then the response status should be 404

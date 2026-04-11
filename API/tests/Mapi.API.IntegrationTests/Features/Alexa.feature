Feature: Alexa Voice Integration
  As an Alexa user
  I want to query my Mapi store via Alexa
  So that I can use voice commands on my Alexa device

  Scenario: Unlinked user receives link prompt
    When I send an Alexa skill request with userId "amzn1.unknown.user" and intent "PriceQueryIntent" and slot "Unknown"
    Then the Alexa response should contain "not linked"

  Scenario: Unrecognized intent returns appropriate message
    Given a Mapi user linked to Alexa userId "amzn1.linked.user001"
    When I send an Alexa skill request with userId "amzn1.linked.user001" and intent "UnknownIntent" and slot "Milk"
    Then the Alexa response should contain "didn't understand"

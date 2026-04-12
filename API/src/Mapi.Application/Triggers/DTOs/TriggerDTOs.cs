namespace Mapi.Application.Triggers.DTOs;

public record TriggerRequest(string Phrase, Guid ActionId);

public record TriggerResponse(
    Guid Id,
    string Phrase,
    Guid ActionId,
    string ActionType,
    DateTime CreatedAt,
    DateTime UpdatedAt);

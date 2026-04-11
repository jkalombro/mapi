namespace Mapi.Application.Triggers.DTOs;

public record TriggerRequest(string Phrase);

public record TriggerActionLinkRequest(Guid ActionId, int SortOrder);

public record TriggerActionResponse(Guid ActionId, string ActionType, string ResponseTemplate, int SortOrder);

public record TriggerResponse(
    Guid Id,
    string Phrase,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    IReadOnlyList<TriggerActionResponse> Actions);

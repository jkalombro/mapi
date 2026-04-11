using Mapi.Domain.Enums;

namespace Mapi.Application.Actions.DTOs;

public record ActionRequest(ActionType ActionType, string ResponseTemplate);

public record ActionResponse(Guid Id, ActionType ActionType, string ResponseTemplate, DateTime CreatedAt, DateTime UpdatedAt);

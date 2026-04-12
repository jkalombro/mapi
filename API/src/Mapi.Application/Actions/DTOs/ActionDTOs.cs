using Mapi.Domain.Enums;

namespace Mapi.Application.Actions.DTOs;

public record ActionResponse(Guid Id, ActionType ActionType, string ResponseTemplate, DateTime CreatedAt, DateTime UpdatedAt);

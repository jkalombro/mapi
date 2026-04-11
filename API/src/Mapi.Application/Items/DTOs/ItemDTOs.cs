namespace Mapi.Application.Items.DTOs;

public record ItemRequest(string ItemName, string BisayaName, decimal Price);

public record ItemResponse(Guid Id, string ItemName, string BisayaName, decimal Price, DateTime CreatedAt, DateTime UpdatedAt);

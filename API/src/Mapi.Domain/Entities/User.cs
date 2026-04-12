namespace Mapi.Domain.Entities;

public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string StoreName { get; set; } = string.Empty;
    public string? AlexaUserId { get; set; }

    public ICollection<Item> Items { get; set; } = new List<Item>();
    public ICollection<Trigger> Triggers { get; set; } = new List<Trigger>();
}

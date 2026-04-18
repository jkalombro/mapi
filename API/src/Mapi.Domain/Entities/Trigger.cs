namespace Mapi.Domain.Entities;

public class Trigger : BaseEntity
{
    public Guid UserId { get; set; }
    public string Phrase { get; set; } = string.Empty;
    public Guid ActionId { get; set; }

    public User User { get; set; } = null!;
    public Action Action { get; set; } = null!;
}

namespace Mapi.Domain.Entities;

public class Item : BaseEntity
{
    public Guid UserId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string BisayaName { get; set; } = string.Empty;
    public decimal Price { get; set; }

    public User User { get; set; } = null!;
}

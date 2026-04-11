namespace Mapi.Domain.Entities;

public class Trigger : BaseEntity
{
    public Guid UserId { get; set; }
    public string Phrase { get; set; } = string.Empty;

    public User User { get; set; } = null!;
    public ICollection<TriggerActionMap> TriggerActionMaps { get; set; } = new List<TriggerActionMap>();
}

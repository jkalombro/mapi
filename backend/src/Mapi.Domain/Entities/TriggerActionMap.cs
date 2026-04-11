namespace Mapi.Domain.Entities;

public class TriggerActionMap : BaseEntity
{
    public Guid TriggerId { get; set; }
    public Guid ActionId { get; set; }
    public int SortOrder { get; set; }

    public Trigger Trigger { get; set; } = null!;
    public Action Action { get; set; } = null!;
}

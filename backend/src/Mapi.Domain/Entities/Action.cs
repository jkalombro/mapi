using Mapi.Domain.Enums;

namespace Mapi.Domain.Entities;

public class Action : BaseEntity
{
    public Guid UserId { get; set; }
    public ActionType ActionType { get; set; }
    public string ResponseTemplate { get; set; } = string.Empty;

    public User User { get; set; } = null!;
    public ICollection<TriggerActionMap> TriggerActionMaps { get; set; } = new List<TriggerActionMap>();
}

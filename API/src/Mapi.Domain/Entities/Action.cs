using Mapi.Domain.Enums;

namespace Mapi.Domain.Entities;

public class Action : BaseEntity
{
    public ActionType ActionType { get; set; }
    public string ResponseTemplate { get; set; } = string.Empty;
}

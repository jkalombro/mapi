using Mapi.Domain.Entities;

namespace Mapi.Domain.Interfaces;

public interface IActionRepository : IRepository<Entities.Action>
{
    Task<IReadOnlyList<Entities.Action>> GetAllByUserAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<bool> IsLinkedToAnyTriggerAsync(Guid actionId, CancellationToken cancellationToken = default);
}

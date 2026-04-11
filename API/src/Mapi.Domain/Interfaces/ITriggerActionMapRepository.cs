using Mapi.Domain.Entities;

namespace Mapi.Domain.Interfaces;

public interface ITriggerActionMapRepository : IRepository<TriggerActionMap>
{
    Task<TriggerActionMap?> FindByTriggerAndActionAsync(
        Guid triggerId,
        Guid actionId,
        CancellationToken cancellationToken = default);

    Task DeleteByTriggerAndActionAsync(
        Guid triggerId,
        Guid actionId,
        CancellationToken cancellationToken = default);
}

using Mapi.Domain.Entities;

namespace Mapi.Domain.Interfaces;

public interface ITriggerRepository : IRepository<Trigger>
{
    Task<IReadOnlyList<Trigger>> GetAllByUserAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Trigger>> GetAllWithActionsAsync(Guid userId, CancellationToken cancellationToken = default);
}

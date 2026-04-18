using Mapi.Domain.Entities;

namespace Mapi.Domain.Interfaces;

public interface ITriggerRepository : IRepository<Trigger>
{
    Task<IReadOnlyList<Trigger>> GetAllByUserAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<Trigger?> GetByIdWithActionAsync(Guid id, CancellationToken cancellationToken = default);
}

using Mapi.Domain.Entities;

namespace Mapi.Domain.Interfaces;

public interface IItemRepository : IRepository<Item>
{
    Task<IReadOnlyList<Item>> GetAllByUserAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Item>> FindByNameAsync(string name, Guid userId, CancellationToken cancellationToken = default);
}

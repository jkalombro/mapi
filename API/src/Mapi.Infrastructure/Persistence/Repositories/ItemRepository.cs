using Mapi.Domain.Entities;
using Mapi.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Mapi.Infrastructure.Persistence.Repositories;

public class ItemRepository : GenericRepository<Item>, IItemRepository
{
    public ItemRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IReadOnlyList<Item>> GetAllByUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Items
            .IgnoreQueryFilters()
            .Where(i => i.UserId == userId)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Item>> FindByNameAsync(string name, Guid userId, CancellationToken cancellationToken = default)
    {
        var lowerName = name.ToLowerInvariant();
        return await _context.Items
            .IgnoreQueryFilters()
            .Where(i => i.UserId == userId &&
                (i.ItemName.ToLower().StartsWith(lowerName) ||
                 i.BisayaName.ToLower().StartsWith(lowerName)))
            .ToListAsync(cancellationToken);
    }
}

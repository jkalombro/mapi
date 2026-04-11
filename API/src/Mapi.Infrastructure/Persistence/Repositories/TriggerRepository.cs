using Mapi.Domain.Entities;
using Mapi.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Mapi.Infrastructure.Persistence.Repositories;

public class TriggerRepository : GenericRepository<Trigger>, ITriggerRepository
{
    public TriggerRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IReadOnlyList<Trigger>> GetAllByUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Triggers
            .IgnoreQueryFilters()
            .Where(t => t.UserId == userId)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Trigger>> GetAllWithActionsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Triggers
            .IgnoreQueryFilters()
            .Where(t => t.UserId == userId)
            .Include(t => t.TriggerActionMaps)
                .ThenInclude(tam => tam.Action)
            .ToListAsync(cancellationToken);
    }
}

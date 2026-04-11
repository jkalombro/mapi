using Mapi.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Mapi.Infrastructure.Persistence.Repositories;

public class ActionRepository : GenericRepository<Domain.Entities.Action>, IActionRepository
{
    public ActionRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IReadOnlyList<Domain.Entities.Action>> GetAllByUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Actions
            .IgnoreQueryFilters()
            .Where(a => a.UserId == userId)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> IsLinkedToAnyTriggerAsync(Guid actionId, CancellationToken cancellationToken = default)
    {
        return await _context.TriggerActionMaps
            .AnyAsync(tam => tam.ActionId == actionId, cancellationToken);
    }
}

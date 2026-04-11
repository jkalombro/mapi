using Mapi.Domain.Entities;
using Mapi.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Mapi.Infrastructure.Persistence.Repositories;

public class TriggerActionMapRepository : GenericRepository<TriggerActionMap>, ITriggerActionMapRepository
{
    public TriggerActionMapRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<TriggerActionMap?> FindByTriggerAndActionAsync(
        Guid triggerId,
        Guid actionId,
        CancellationToken cancellationToken = default)
    {
        return await _context.TriggerActionMaps
            .FirstOrDefaultAsync(tam => tam.TriggerId == triggerId && tam.ActionId == actionId, cancellationToken);
    }

    public async Task DeleteByTriggerAndActionAsync(
        Guid triggerId,
        Guid actionId,
        CancellationToken cancellationToken = default)
    {
        var map = await FindByTriggerAndActionAsync(triggerId, actionId, cancellationToken);
        if (map is not null)
        {
            _context.TriggerActionMaps.Remove(map);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}

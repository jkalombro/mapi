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
            .Include(t => t.Action)
            .ToListAsync(cancellationToken);
    }

    public async Task<Trigger?> GetByIdWithActionAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Triggers
            .IgnoreQueryFilters()
            .Include(t => t.Action)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }
}

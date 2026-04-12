using Mapi.Domain.Interfaces;

namespace Mapi.Infrastructure.Persistence.Repositories;

public class ActionRepository : GenericRepository<Domain.Entities.Action>, IActionRepository
{
    public ActionRepository(ApplicationDbContext context) : base(context)
    {
    }
}

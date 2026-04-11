using Mapi.Domain.Entities;

namespace Mapi.Domain.Interfaces;

public interface IUserRepository : IRepository<User>
{
    Task<User?> FindByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<User?> FindByAlexaUserIdAsync(string alexaUserId, CancellationToken cancellationToken = default);
}

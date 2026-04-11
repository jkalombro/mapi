using Mapi.Domain.Entities;

namespace Mapi.Application.Common.Interfaces;

public interface ITokenService
{
    string GenerateToken(User user);
}

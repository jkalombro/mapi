using Mapi.Application.Auth.DTOs;
using Mapi.Application.Common.Interfaces;
using Mapi.Domain.Exceptions;
using Mapi.Domain.Interfaces;
using MediatR;

namespace Mapi.Application.Auth.Commands;

public record LoginCommand(string Email, string Password) : IRequest<AuthResponse>;

public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;

    public LoginCommandHandler(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        ITokenService tokenService)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
    }

    public async Task<AuthResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.FindByEmailAsync(request.Email, cancellationToken);
        if (user is null)
        {
            throw new NotFoundException(nameof(user), request.Email);
        }

        if (!_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            throw new NotFoundException(nameof(user), request.Email);
        }

        var token = _tokenService.GenerateToken(user);
        return new AuthResponse(token);
    }
}

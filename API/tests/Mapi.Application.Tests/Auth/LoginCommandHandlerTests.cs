using Mapi.Application.Auth.Commands;
using Mapi.Application.Common.Interfaces;
using Mapi.Domain.Entities;
using Mapi.Domain.Exceptions;
using Mapi.Domain.Interfaces;
using Moq;

namespace Mapi.Application.Tests.Auth;

public class LoginCommandHandlerTests
{
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<IPasswordHasher> _passwordHasherMock;
    private readonly Mock<ITokenService> _tokenServiceMock;
    private readonly LoginCommandHandler _handler;

    public LoginCommandHandlerTests()
    {
        _userRepositoryMock = new Mock<IUserRepository>();
        _passwordHasherMock = new Mock<IPasswordHasher>();
        _tokenServiceMock = new Mock<ITokenService>();
        _handler = new LoginCommandHandler(
            _userRepositoryMock.Object,
            _passwordHasherMock.Object,
            _tokenServiceMock.Object);
    }

    [Fact]
    public async Task Handle_WhenValidCredentials_ReturnsAuthResponse()
    {
        // Arrange
        var command = new LoginCommand("user@example.com", "correct_password");
        var user = new User { Email = "user@example.com", PasswordHash = "hashed_pw" };
        _userRepositoryMock
            .Setup(r => r.FindByEmailAsync(command.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);
        _passwordHasherMock
            .Setup(h => h.Verify(command.Password, user.PasswordHash))
            .Returns(true);
        _tokenServiceMock
            .Setup(t => t.GenerateToken(user))
            .Returns("valid_token");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("valid_token", result.AccessToken);
    }

    [Fact]
    public async Task Handle_WhenWrongPassword_ThrowsNotFoundException()
    {
        // Arrange
        var command = new LoginCommand("user@example.com", "wrong_password");
        var user = new User { Email = "user@example.com", PasswordHash = "hashed_pw" };
        _userRepositoryMock
            .Setup(r => r.FindByEmailAsync(command.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);
        _passwordHasherMock
            .Setup(h => h.Verify(command.Password, user.PasswordHash))
            .Returns(false);

        // Act & Assert
        await Assert.ThrowsAsync<NotFoundException>(() =>
            _handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenUnknownEmail_ThrowsNotFoundException()
    {
        // Arrange
        var command = new LoginCommand("unknown@example.com", "any_password");
        _userRepositoryMock
            .Setup(r => r.FindByEmailAsync(command.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);

        // Act & Assert
        await Assert.ThrowsAsync<NotFoundException>(() =>
            _handler.Handle(command, CancellationToken.None));
        _passwordHasherMock.Verify(h => h.Verify(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
    }
}

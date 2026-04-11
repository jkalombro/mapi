using Mapi.Application.Auth.Commands;
using Mapi.Application.Common.Interfaces;
using Mapi.Domain.Entities;
using Mapi.Domain.Exceptions;
using Mapi.Domain.Interfaces;
using Moq;

namespace Mapi.Application.Tests.Auth;

public class RegisterCommandHandlerTests
{
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<IPasswordHasher> _passwordHasherMock;
    private readonly Mock<ITokenService> _tokenServiceMock;
    private readonly RegisterCommandHandler _handler;

    public RegisterCommandHandlerTests()
    {
        _userRepositoryMock = new Mock<IUserRepository>();
        _passwordHasherMock = new Mock<IPasswordHasher>();
        _tokenServiceMock = new Mock<ITokenService>();
        _handler = new RegisterCommandHandler(
            _userRepositoryMock.Object,
            _passwordHasherMock.Object,
            _tokenServiceMock.Object);
    }

    [Fact]
    public async Task Handle_WhenValidRegistration_ReturnsAuthResponse()
    {
        // Arrange
        var command = new RegisterCommand("test@example.com", "password123", "Test Store");
        _userRepositoryMock
            .Setup(r => r.FindByEmailAsync(command.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);
        _passwordHasherMock
            .Setup(h => h.Hash(command.Password))
            .Returns("hashed_password");
        _tokenServiceMock
            .Setup(t => t.GenerateToken(It.IsAny<User>()))
            .Returns("jwt_token");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("jwt_token", result.AccessToken);
        Assert.Equal("Bearer", result.TokenType);
        _userRepositoryMock.Verify(r => r.AddAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenDuplicateEmail_ThrowsConflictException()
    {
        // Arrange
        var command = new RegisterCommand("duplicate@example.com", "password123", "Test Store");
        var existingUser = new User { Email = "duplicate@example.com" };
        _userRepositoryMock
            .Setup(r => r.FindByEmailAsync(command.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingUser);

        // Act & Assert
        await Assert.ThrowsAsync<ConflictException>(() =>
            _handler.Handle(command, CancellationToken.None));
        _userRepositoryMock.Verify(r => r.AddAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenValidRegistration_NormalizesEmailToLowercase()
    {
        // Arrange
        var command = new RegisterCommand("Test@Example.COM", "password123", "Test Store");
        _userRepositoryMock
            .Setup(r => r.FindByEmailAsync(command.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);
        _passwordHasherMock.Setup(h => h.Hash(It.IsAny<string>())).Returns("hashed");
        _tokenServiceMock.Setup(t => t.GenerateToken(It.IsAny<User>())).Returns("token");

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _userRepositoryMock.Verify(r => r.AddAsync(
            It.Is<User>(u => u.Email == "test@example.com"),
            It.IsAny<CancellationToken>()), Times.Once);
    }
}

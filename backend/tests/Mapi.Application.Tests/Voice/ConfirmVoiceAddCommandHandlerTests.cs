using Mapi.Application.Common.Interfaces;
using Mapi.Application.Voice.Commands;
using Mapi.Application.Voice.DTOs;
using Moq;

namespace Mapi.Application.Tests.Voice;

public class ConfirmVoiceAddCommandHandlerTests
{
    private readonly Mock<ICommandService> _commandServiceMock;
    private readonly Mock<ICurrentUserService> _currentUserServiceMock;
    private readonly ConfirmVoiceAddCommandHandler _handler;
    private readonly Guid _userId = Guid.NewGuid();

    public ConfirmVoiceAddCommandHandlerTests()
    {
        _commandServiceMock = new Mock<ICommandService>();
        _currentUserServiceMock = new Mock<ICurrentUserService>();
        _currentUserServiceMock.Setup(s => s.UserId).Returns(_userId);
        _handler = new ConfirmVoiceAddCommandHandler(_commandServiceMock.Object, _currentUserServiceMock.Object);
    }

    [Fact]
    public async Task Handle_WhenItemUpdated_ReturnsSuccessResponse()
    {
        // Arrange
        var command = new ConfirmVoiceAddCommand("Gatas", 50.00m);
        var expectedResult = new VoiceCommandResult("Done. Gatas is now 50 pesos.");
        _commandServiceMock
            .Setup(s => s.ConfirmAddAsync("Gatas", 50.00m, _userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.Equal(expectedResult, result);
        _commandServiceMock.Verify(s => s.ConfirmAddAsync("Gatas", 50.00m, _userId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenItemNotFound_ReturnsNotFoundResponse()
    {
        // Arrange
        var command = new ConfirmVoiceAddCommand("NonExistent", 30.00m);
        var notFoundResult = new VoiceCommandResult("I couldn't find that item.");
        _commandServiceMock
            .Setup(s => s.ConfirmAddAsync("NonExistent", 30.00m, _userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(notFoundResult);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.Contains("couldn't find", result.ResponseText);
    }
}

using Mapi.Application.Common.Interfaces;
using Mapi.Application.Voice.Commands;
using Mapi.Application.Voice.DTOs;
using Moq;

namespace Mapi.Application.Tests.Voice;

public class ProcessVoiceCommandHandlerTests
{
    private readonly Mock<ICommandService> _commandServiceMock;
    private readonly Mock<ICurrentUserService> _currentUserServiceMock;
    private readonly ProcessVoiceCommandHandler _handler;
    private readonly Guid _userId = Guid.NewGuid();

    public ProcessVoiceCommandHandlerTests()
    {
        _commandServiceMock = new Mock<ICommandService>();
        _currentUserServiceMock = new Mock<ICurrentUserService>();
        _currentUserServiceMock.Setup(s => s.UserId).Returns(_userId);
        _handler = new ProcessVoiceCommandHandler(_commandServiceMock.Object, _currentUserServiceMock.Object);
    }

    [Fact]
    public async Task Handle_WhenTranscriptProvided_DispatchesToCommandService()
    {
        // Arrange
        var transcript = "How much is Gatas?";
        var command = new ProcessVoiceCommand(transcript, null, null);
        var expectedResult = new VoiceCommandResult("Gatas costs 50 pesos.");
        _commandServiceMock
            .Setup(s => s.ExecuteAsync(transcript, _userId, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.Equal(expectedResult, result);
        _commandServiceMock.Verify(
            s => s.ExecuteAsync(transcript, _userId, null, null, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WhenPendingContextProvided_ForwardsPendingContextToCommandService()
    {
        // Arrange
        var transcript = "50";
        var pendingIntent = "Add";
        var pendingItemName = "Gatas";
        var command = new ProcessVoiceCommand(transcript, pendingIntent, pendingItemName);
        var expectedResult = new VoiceCommandResult("Got it. Gatas has been added at 50 pesos.", ItemsModified: true);
        _commandServiceMock
            .Setup(s => s.ExecuteAsync(transcript, _userId, pendingIntent, pendingItemName, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.Equal(expectedResult, result);
        _commandServiceMock.Verify(
            s => s.ExecuteAsync(transcript, _userId, pendingIntent, pendingItemName, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WhenCommandServiceReturnsAmbiguousResult_ReturnsAmbiguousResult()
    {
        // Arrange
        var command = new ProcessVoiceCommand("How much is G?", null, null);
        var ambiguousResult = new VoiceCommandResult(
            "Multiple matches found.",
            IsAmbiguous: true,
            MatchedNames: new List<string> { "Gatas", "Gabi" });
        _commandServiceMock
            .Setup(s => s.ExecuteAsync(It.IsAny<string>(), _userId, It.IsAny<string?>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(ambiguousResult);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsAmbiguous);
        Assert.NotNull(result.MatchedNames);
        Assert.Equal(2, result.MatchedNames!.Count);
    }
}

using Mapi.Application.Common.Interfaces;
using Mapi.Application.Triggers.Commands;
using Mapi.Domain.Entities;
using Mapi.Domain.Exceptions;
using Mapi.Domain.Interfaces;
using Moq;

namespace Mapi.Application.Tests.Triggers;

public class TriggerCommandHandlerTests
{
    private readonly Mock<ITriggerRepository> _triggerRepositoryMock;
    private readonly Mock<ITriggerActionMapRepository> _triggerActionMapRepositoryMock;
    private readonly Mock<ICurrentUserService> _currentUserServiceMock;
    private readonly Guid _userId = Guid.NewGuid();

    private readonly CreateTriggerCommandHandler _createHandler;
    private readonly UpdateTriggerCommandHandler _updateHandler;
    private readonly DeleteTriggerCommandHandler _deleteHandler;
    private readonly LinkActionCommandHandler _linkHandler;
    private readonly UnlinkActionCommandHandler _unlinkHandler;

    public TriggerCommandHandlerTests()
    {
        _triggerRepositoryMock = new Mock<ITriggerRepository>();
        _triggerActionMapRepositoryMock = new Mock<ITriggerActionMapRepository>();
        _currentUserServiceMock = new Mock<ICurrentUserService>();
        _currentUserServiceMock.Setup(s => s.UserId).Returns(_userId);

        _createHandler = new CreateTriggerCommandHandler(_triggerRepositoryMock.Object, _currentUserServiceMock.Object);
        _updateHandler = new UpdateTriggerCommandHandler(_triggerRepositoryMock.Object);
        _deleteHandler = new DeleteTriggerCommandHandler(_triggerRepositoryMock.Object);
        _linkHandler = new LinkActionCommandHandler(_triggerRepositoryMock.Object, _triggerActionMapRepositoryMock.Object);
        _unlinkHandler = new UnlinkActionCommandHandler(_triggerActionMapRepositoryMock.Object);
    }

    [Fact]
    public async Task CreateTrigger_WhenValidCommand_ReturnsTriggerResponse()
    {
        // Arrange
        var command = new CreateTriggerCommand("What's the price of");

        // Act
        var result = await _createHandler.Handle(command, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("What's the price of", result.Phrase);
        _triggerRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Trigger>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateTrigger_WhenTriggerExists_UpdatesAndReturns()
    {
        // Arrange
        var triggerId = Guid.NewGuid();
        var existing = new Trigger { Id = triggerId, Phrase = "Old phrase" };
        var command = new UpdateTriggerCommand(triggerId, "New phrase");
        _triggerRepositoryMock
            .Setup(r => r.GetByIdAsync(triggerId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existing);

        // Act
        var result = await _updateHandler.Handle(command, CancellationToken.None);

        // Assert
        Assert.Equal("New phrase", result.Phrase);
        _triggerRepositoryMock.Verify(r => r.UpdateAsync(existing, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateTrigger_WhenTriggerNotFound_ThrowsNotFoundException()
    {
        // Arrange
        var triggerId = Guid.NewGuid();
        _triggerRepositoryMock
            .Setup(r => r.GetByIdAsync(triggerId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Trigger?)null);

        // Act & Assert
        await Assert.ThrowsAsync<NotFoundException>(() =>
            _updateHandler.Handle(new UpdateTriggerCommand(triggerId, "phrase"), CancellationToken.None));
    }

    [Fact]
    public async Task DeleteTrigger_WhenTriggerExists_DeletesTrigger()
    {
        // Arrange
        var triggerId = Guid.NewGuid();
        var existing = new Trigger { Id = triggerId, Phrase = "Some phrase" };
        _triggerRepositoryMock
            .Setup(r => r.GetByIdAsync(triggerId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existing);

        // Act
        await _deleteHandler.Handle(new DeleteTriggerCommand(triggerId), CancellationToken.None);

        // Assert
        _triggerRepositoryMock.Verify(r => r.DeleteAsync(existing, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteTrigger_WhenTriggerNotFound_ThrowsNotFoundException()
    {
        // Arrange
        var triggerId = Guid.NewGuid();
        _triggerRepositoryMock
            .Setup(r => r.GetByIdAsync(triggerId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Trigger?)null);

        // Act & Assert
        await Assert.ThrowsAsync<NotFoundException>(() =>
            _deleteHandler.Handle(new DeleteTriggerCommand(triggerId), CancellationToken.None));
    }

    [Fact]
    public async Task LinkAction_WhenTriggerExists_CreatesMapping()
    {
        // Arrange
        var triggerId = Guid.NewGuid();
        var actionId = Guid.NewGuid();
        var existing = new Trigger { Id = triggerId, Phrase = "phrase" };
        _triggerRepositoryMock
            .Setup(r => r.GetByIdAsync(triggerId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existing);

        // Act
        await _linkHandler.Handle(new LinkActionCommand(triggerId, actionId, 1), CancellationToken.None);

        // Assert
        _triggerActionMapRepositoryMock.Verify(r => r.AddAsync(
            It.Is<TriggerActionMap>(m => m.TriggerId == triggerId && m.ActionId == actionId && m.SortOrder == 1),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task LinkAction_WhenTriggerNotFound_ThrowsNotFoundException()
    {
        // Arrange
        var triggerId = Guid.NewGuid();
        _triggerRepositoryMock
            .Setup(r => r.GetByIdAsync(triggerId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Trigger?)null);

        // Act & Assert
        await Assert.ThrowsAsync<NotFoundException>(() =>
            _linkHandler.Handle(new LinkActionCommand(triggerId, Guid.NewGuid(), 1), CancellationToken.None));
    }
}

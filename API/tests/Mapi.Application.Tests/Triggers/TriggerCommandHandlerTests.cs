using Mapi.Application.Common.Interfaces;
using Mapi.Application.Triggers.Commands;
using Mapi.Domain.Entities;
using Mapi.Domain.Enums;
using Mapi.Domain.Exceptions;
using Mapi.Domain.Interfaces;
using Moq;

namespace Mapi.Application.Tests.Triggers;

public class TriggerCommandHandlerTests
{
    private readonly Mock<ITriggerRepository> _triggerRepositoryMock;
    private readonly Mock<ICurrentUserService> _currentUserServiceMock;
    private readonly Guid _userId = Guid.NewGuid();
    private readonly Guid _queryActionId = new("00000000-0000-0000-0000-000000000001");

    private readonly CreateTriggerCommandHandler _createHandler;
    private readonly UpdateTriggerCommandHandler _updateHandler;
    private readonly DeleteTriggerCommandHandler _deleteHandler;

    public TriggerCommandHandlerTests()
    {
        _triggerRepositoryMock = new Mock<ITriggerRepository>();
        _currentUserServiceMock = new Mock<ICurrentUserService>();
        _currentUserServiceMock.Setup(s => s.UserId).Returns(_userId);

        _createHandler = new CreateTriggerCommandHandler(_triggerRepositoryMock.Object, _currentUserServiceMock.Object);
        _updateHandler = new UpdateTriggerCommandHandler(_triggerRepositoryMock.Object);
        _deleteHandler = new DeleteTriggerCommandHandler(_triggerRepositoryMock.Object);
    }

    [Fact]
    public async Task CreateTrigger_WhenValidCommand_ReturnsTriggerResponse()
    {
        // Arrange
        var command = new CreateTriggerCommand("What's the price of", _queryActionId);
        var seededAction = new Domain.Entities.Action { Id = _queryActionId, ActionType = ActionType.Query, ResponseTemplate = "The {item} is {value}." };

        _triggerRepositoryMock
            .Setup(r => r.GetByIdWithActionAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Guid id, CancellationToken _) => new Trigger
            {
                Id = id,
                UserId = _userId,
                Phrase = command.Phrase,
                ActionId = _queryActionId,
                Action = seededAction
            });

        // Act
        var result = await _createHandler.Handle(command, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("What's the price of", result.Phrase);
        Assert.Equal(_queryActionId, result.ActionId);
        Assert.Equal("Query", result.ActionType);
        _triggerRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Trigger>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateTrigger_SetsActionIdOnEntity()
    {
        // Arrange
        var command = new CreateTriggerCommand("How much is", _queryActionId);
        var seededAction = new Domain.Entities.Action { Id = _queryActionId, ActionType = ActionType.Query, ResponseTemplate = "Template" };
        Trigger? capturedTrigger = null;

        _triggerRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<Trigger>(), It.IsAny<CancellationToken>()))
            .Callback<Trigger, CancellationToken>((t, _) => capturedTrigger = t)
            .ReturnsAsync((Trigger t, CancellationToken _) => t);

        _triggerRepositoryMock
            .Setup(r => r.GetByIdWithActionAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Guid id, CancellationToken _) => new Trigger
            {
                Id = id,
                UserId = _userId,
                Phrase = command.Phrase,
                ActionId = _queryActionId,
                Action = seededAction
            });

        // Act
        await _createHandler.Handle(command, CancellationToken.None);

        // Assert
        Assert.NotNull(capturedTrigger);
        Assert.Equal(_queryActionId, capturedTrigger!.ActionId);
        Assert.Equal(_userId, capturedTrigger.UserId);
    }

    [Fact]
    public async Task UpdateTrigger_WhenTriggerExists_UpdatesPhraseAndActionId()
    {
        // Arrange
        var triggerId = Guid.NewGuid();
        var newActionId = new Guid("00000000-0000-0000-0000-000000000002");
        var seededAction = new Domain.Entities.Action { Id = newActionId, ActionType = ActionType.Add, ResponseTemplate = "I've added {item}." };
        var existing = new Trigger { Id = triggerId, Phrase = "Old phrase", ActionId = _queryActionId };

        _triggerRepositoryMock
            .Setup(r => r.GetByIdAsync(triggerId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existing);

        _triggerRepositoryMock
            .Setup(r => r.GetByIdWithActionAsync(triggerId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Trigger
            {
                Id = triggerId,
                Phrase = "New phrase",
                ActionId = newActionId,
                Action = seededAction
            });

        var command = new UpdateTriggerCommand(triggerId, "New phrase", newActionId);

        // Act
        var result = await _updateHandler.Handle(command, CancellationToken.None);

        // Assert
        Assert.Equal("New phrase", result.Phrase);
        Assert.Equal(newActionId, result.ActionId);
        Assert.Equal("Add", result.ActionType);
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
            _updateHandler.Handle(new UpdateTriggerCommand(triggerId, "phrase", _queryActionId), CancellationToken.None));
    }

    [Fact]
    public async Task DeleteTrigger_WhenTriggerExists_DeletesTrigger()
    {
        // Arrange
        var triggerId = Guid.NewGuid();
        var existing = new Trigger { Id = triggerId, Phrase = "Some phrase", ActionId = _queryActionId };
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
}

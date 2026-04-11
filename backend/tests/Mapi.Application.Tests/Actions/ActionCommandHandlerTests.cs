using Mapi.Application.Actions.Commands;
using Mapi.Application.Common.Interfaces;
using Mapi.Domain.Enums;
using Mapi.Domain.Exceptions;
using Mapi.Domain.Interfaces;
using Moq;

namespace Mapi.Application.Tests.Actions;

public class ActionCommandHandlerTests
{
    private readonly Mock<IActionRepository> _actionRepositoryMock;
    private readonly Mock<ICurrentUserService> _currentUserServiceMock;
    private readonly Guid _userId = Guid.NewGuid();

    private readonly CreateActionCommandHandler _createHandler;
    private readonly UpdateActionCommandHandler _updateHandler;
    private readonly DeleteActionCommandHandler _deleteHandler;

    public ActionCommandHandlerTests()
    {
        _actionRepositoryMock = new Mock<IActionRepository>();
        _currentUserServiceMock = new Mock<ICurrentUserService>();
        _currentUserServiceMock.Setup(s => s.UserId).Returns(_userId);

        _createHandler = new CreateActionCommandHandler(_actionRepositoryMock.Object, _currentUserServiceMock.Object);
        _updateHandler = new UpdateActionCommandHandler(_actionRepositoryMock.Object);
        _deleteHandler = new DeleteActionCommandHandler(_actionRepositoryMock.Object);
    }

    [Fact]
    public async Task CreateAction_WhenValidCommand_ReturnsActionResponse()
    {
        // Arrange
        var command = new CreateActionCommand(ActionType.Query, "{name} costs {price}.");

        // Act
        var result = await _createHandler.Handle(command, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(ActionType.Query, result.ActionType);
        Assert.Equal("{name} costs {price}.", result.ResponseTemplate);
        _actionRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Domain.Entities.Action>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateAction_WhenActionExists_UpdatesAndReturns()
    {
        // Arrange
        var actionId = Guid.NewGuid();
        var existing = new Domain.Entities.Action
        {
            Id = actionId,
            ActionType = ActionType.Query,
            ResponseTemplate = "Old template"
        };
        _actionRepositoryMock
            .Setup(r => r.GetByIdAsync(actionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existing);

        // Act
        var result = await _updateHandler.Handle(
            new UpdateActionCommand(actionId, ActionType.Add, "New template"),
            CancellationToken.None);

        // Assert
        Assert.Equal(ActionType.Add, result.ActionType);
        Assert.Equal("New template", result.ResponseTemplate);
        _actionRepositoryMock.Verify(r => r.UpdateAsync(existing, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateAction_WhenActionNotFound_ThrowsNotFoundException()
    {
        // Arrange
        var actionId = Guid.NewGuid();
        _actionRepositoryMock
            .Setup(r => r.GetByIdAsync(actionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Domain.Entities.Action?)null);

        // Act & Assert
        await Assert.ThrowsAsync<NotFoundException>(() =>
            _updateHandler.Handle(new UpdateActionCommand(actionId, ActionType.Query, "template"), CancellationToken.None));
    }

    [Fact]
    public async Task DeleteAction_WhenNotLinked_DeletesAction()
    {
        // Arrange
        var actionId = Guid.NewGuid();
        var existing = new Domain.Entities.Action { Id = actionId, ActionType = ActionType.Query };
        _actionRepositoryMock
            .Setup(r => r.GetByIdAsync(actionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existing);
        _actionRepositoryMock
            .Setup(r => r.IsLinkedToAnyTriggerAsync(actionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act
        await _deleteHandler.Handle(new DeleteActionCommand(actionId), CancellationToken.None);

        // Assert
        _actionRepositoryMock.Verify(r => r.DeleteAsync(existing, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteAction_WhenLinkedToTrigger_ThrowsConflictException()
    {
        // Arrange
        var actionId = Guid.NewGuid();
        var existing = new Domain.Entities.Action { Id = actionId, ActionType = ActionType.Query };
        _actionRepositoryMock
            .Setup(r => r.GetByIdAsync(actionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existing);
        _actionRepositoryMock
            .Setup(r => r.IsLinkedToAnyTriggerAsync(actionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act & Assert
        await Assert.ThrowsAsync<ConflictException>(() =>
            _deleteHandler.Handle(new DeleteActionCommand(actionId), CancellationToken.None));
        _actionRepositoryMock.Verify(r => r.DeleteAsync(It.IsAny<Domain.Entities.Action>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task DeleteAction_WhenNotFound_ThrowsNotFoundException()
    {
        // Arrange
        var actionId = Guid.NewGuid();
        _actionRepositoryMock
            .Setup(r => r.GetByIdAsync(actionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Domain.Entities.Action?)null);

        // Act & Assert
        await Assert.ThrowsAsync<NotFoundException>(() =>
            _deleteHandler.Handle(new DeleteActionCommand(actionId), CancellationToken.None));
    }
}

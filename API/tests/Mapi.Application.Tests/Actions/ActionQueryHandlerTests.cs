using Mapi.Application.Actions.Queries;
using Mapi.Application.Common.Interfaces;
using Mapi.Domain.Enums;
using Mapi.Domain.Exceptions;
using Mapi.Domain.Interfaces;
using Moq;

namespace Mapi.Application.Tests.Actions;

public class ActionQueryHandlerTests
{
    private readonly Mock<IActionRepository> _actionRepositoryMock;
    private readonly Mock<ICurrentUserService> _currentUserServiceMock;
    private readonly Guid _userId = Guid.NewGuid();

    private readonly GetActionsQueryHandler _getAllHandler;
    private readonly GetActionByIdQueryHandler _getByIdHandler;

    public ActionQueryHandlerTests()
    {
        _actionRepositoryMock = new Mock<IActionRepository>();
        _currentUserServiceMock = new Mock<ICurrentUserService>();
        _currentUserServiceMock.Setup(s => s.UserId).Returns(_userId);

        _getAllHandler = new GetActionsQueryHandler(_actionRepositoryMock.Object, _currentUserServiceMock.Object);
        _getByIdHandler = new GetActionByIdQueryHandler(_actionRepositoryMock.Object);
    }

    [Fact]
    public async Task GetActions_WhenUserHasActions_ReturnsActionList()
    {
        // Arrange
        var actions = new List<Domain.Entities.Action>
        {
            new() { Id = Guid.NewGuid(), UserId = _userId, ActionType = ActionType.Query, ResponseTemplate = "Template 1" },
            new() { Id = Guid.NewGuid(), UserId = _userId, ActionType = ActionType.Add, ResponseTemplate = "Template 2" },
        };
        _actionRepositoryMock
            .Setup(r => r.GetAllByUserAsync(_userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(actions);

        // Act
        var result = await _getAllHandler.Handle(new GetActionsQuery(), CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count);
        Assert.Contains(result, a => a.ResponseTemplate == "Template 1");
        Assert.Contains(result, a => a.ResponseTemplate == "Template 2");
    }

    [Fact]
    public async Task GetActions_WhenUserHasNoActions_ReturnsEmptyList()
    {
        // Arrange
        _actionRepositoryMock
            .Setup(r => r.GetAllByUserAsync(_userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Domain.Entities.Action>());

        // Act
        var result = await _getAllHandler.Handle(new GetActionsQuery(), CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact]
    public async Task GetActions_ExcludesOtherUsersActions()
    {
        // Arrange
        var otherUserId = Guid.NewGuid();
        var myActions = new List<Domain.Entities.Action>
        {
            new() { Id = Guid.NewGuid(), UserId = _userId, ActionType = ActionType.Query, ResponseTemplate = "My Template" },
        };
        _actionRepositoryMock
            .Setup(r => r.GetAllByUserAsync(_userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(myActions);
        _actionRepositoryMock
            .Setup(r => r.GetAllByUserAsync(otherUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Domain.Entities.Action>
            {
                new() { Id = Guid.NewGuid(), UserId = otherUserId, ActionType = ActionType.Query, ResponseTemplate = "Other Template" },
            });

        // Act
        var result = await _getAllHandler.Handle(new GetActionsQuery(), CancellationToken.None);

        // Assert
        Assert.Single(result);
        Assert.Equal("My Template", result[0].ResponseTemplate);
        _actionRepositoryMock.Verify(r => r.GetAllByUserAsync(_userId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetActionById_WhenActionExists_ReturnsActionResponse()
    {
        // Arrange
        var actionId = Guid.NewGuid();
        var action = new Domain.Entities.Action
        {
            Id = actionId,
            UserId = _userId,
            ActionType = ActionType.Query,
            ResponseTemplate = "Template content"
        };
        _actionRepositoryMock
            .Setup(r => r.GetByIdAsync(actionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(action);

        // Act
        var result = await _getByIdHandler.Handle(new GetActionByIdQuery(actionId), CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(actionId, result.Id);
        Assert.Equal(ActionType.Query, result.ActionType);
        Assert.Equal("Template content", result.ResponseTemplate);
    }

    [Fact]
    public async Task GetActionById_WhenActionNotFound_ThrowsNotFoundException()
    {
        // Arrange
        var actionId = Guid.NewGuid();
        _actionRepositoryMock
            .Setup(r => r.GetByIdAsync(actionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Domain.Entities.Action?)null);

        // Act & Assert
        await Assert.ThrowsAsync<NotFoundException>(() =>
            _getByIdHandler.Handle(new GetActionByIdQuery(actionId), CancellationToken.None));
    }
}

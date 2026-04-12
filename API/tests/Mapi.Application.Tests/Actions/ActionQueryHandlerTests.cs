using Mapi.Application.Actions.Queries;
using Mapi.Domain.Enums;
using Mapi.Domain.Interfaces;
using Moq;

namespace Mapi.Application.Tests.Actions;

public class ActionQueryHandlerTests
{
    private readonly Mock<IActionRepository> _actionRepositoryMock;
    private readonly GetActionsQueryHandler _handler;

    public ActionQueryHandlerTests()
    {
        _actionRepositoryMock = new Mock<IActionRepository>();
        _handler = new GetActionsQueryHandler(_actionRepositoryMock.Object);
    }

    [Fact]
    public async Task GetActions_WhenSeededActionsExist_ReturnsAllActions()
    {
        // Arrange
        var seededActions = new List<Domain.Entities.Action>
        {
            new() { Id = new Guid("00000000-0000-0000-0000-000000000001"), ActionType = ActionType.Query,  ResponseTemplate = "The {item} is {value}." },
            new() { Id = new Guid("00000000-0000-0000-0000-000000000002"), ActionType = ActionType.Add,    ResponseTemplate = "I've added {item}." },
            new() { Id = new Guid("00000000-0000-0000-0000-000000000003"), ActionType = ActionType.Update, ResponseTemplate = "I've updated {item} to {value}." },
            new() { Id = new Guid("00000000-0000-0000-0000-000000000004"), ActionType = ActionType.Remove, ResponseTemplate = "I've removed {item}." },
        };
        _actionRepositoryMock
            .Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(seededActions);

        // Act
        var result = await _handler.Handle(new GetActionsQuery(), CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(4, result.Count);
        Assert.Contains(result, a => a.ActionType == ActionType.Query);
        Assert.Contains(result, a => a.ActionType == ActionType.Add);
        Assert.Contains(result, a => a.ActionType == ActionType.Update);
        Assert.Contains(result, a => a.ActionType == ActionType.Remove);
    }

    [Fact]
    public async Task GetActions_MapsActionTypeAndResponseTemplate_Correctly()
    {
        // Arrange
        var queryActionId = new Guid("00000000-0000-0000-0000-000000000001");
        _actionRepositoryMock
            .Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Domain.Entities.Action>
            {
                new() { Id = queryActionId, ActionType = ActionType.Query, ResponseTemplate = "The {item} is {value}." }
            });

        // Act
        var result = await _handler.Handle(new GetActionsQuery(), CancellationToken.None);

        // Assert
        var action = result.Single();
        Assert.Equal(queryActionId, action.Id);
        Assert.Equal(ActionType.Query, action.ActionType);
        Assert.Equal("The {item} is {value}.", action.ResponseTemplate);
    }

    [Fact]
    public async Task GetActions_DoesNotFilterByUser_ReturnsGlobalActions()
    {
        // Arrange — repository returns actions without any user filter involved
        _actionRepositoryMock
            .Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Domain.Entities.Action>
            {
                new() { Id = Guid.NewGuid(), ActionType = ActionType.Query, ResponseTemplate = "Template" }
            });

        // Act
        var result = await _handler.Handle(new GetActionsQuery(), CancellationToken.None);

        // Assert — GetAllAsync called without any user ID argument
        _actionRepositoryMock.Verify(r => r.GetAllAsync(It.IsAny<CancellationToken>()), Times.Once);
        Assert.Single(result);
    }

    [Fact]
    public async Task GetActions_WhenRepositoryReturnsEmpty_ReturnsEmptyList()
    {
        // Arrange
        _actionRepositoryMock
            .Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Domain.Entities.Action>());

        // Act
        var result = await _handler.Handle(new GetActionsQuery(), CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);
    }
}

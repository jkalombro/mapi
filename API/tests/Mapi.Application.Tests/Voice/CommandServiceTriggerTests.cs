using Mapi.Domain.Entities;
using Mapi.Domain.Enums;
using Mapi.Domain.Interfaces;
using Mapi.Infrastructure.Services;
using Moq;

namespace Mapi.Application.Tests.Voice;

public class CommandServiceTriggerTests
{
    private readonly Mock<IItemRepository> _itemRepositoryMock;
    private readonly Mock<ITriggerRepository> _triggerRepositoryMock;
    private readonly CommandService _service;
    private readonly Guid _userId = Guid.NewGuid();

    public CommandServiceTriggerTests()
    {
        _itemRepositoryMock = new Mock<IItemRepository>();
        _triggerRepositoryMock = new Mock<ITriggerRepository>();
        _service = new CommandService(_itemRepositoryMock.Object, _triggerRepositoryMock.Object);
    }

    [Fact]
    public async Task ExecuteAsync_WhenTriggerPhraseMatches_ExecutesAssignedAction()
    {
        // Arrange
        var item = new Item { ItemName = "Milk", BisayaName = "Gatas", Price = 50m };
        var action = new Domain.Entities.Action
        {
            Id = new Guid("00000000-0000-0000-0000-000000000001"),
            ActionType = ActionType.Query,
            ResponseTemplate = "{item} is {value}"
        };
        var trigger = new Trigger
        {
            UserId = _userId,
            Phrase = "What's the price of",
            ActionId = action.Id,
            Action = action
        };

        _triggerRepositoryMock
            .Setup(r => r.GetAllByUserAsync(_userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Trigger> { trigger });
        _itemRepositoryMock
            .Setup(r => r.FindByNameAsync("milk", _userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Item> { item });

        // Act
        var result = await _service.ExecuteAsync("What's the price of Milk", _userId);

        // Assert
        Assert.Contains("Milk", result.ResponseText);
        Assert.Contains("50", result.ResponseText);
    }

    [Fact]
    public async Task ExecuteAsync_WhenNoTriggerMatches_FallsBackToBuiltInPatterns()
    {
        // Arrange
        _triggerRepositoryMock
            .Setup(r => r.GetAllByUserAsync(_userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Trigger>());
        _itemRepositoryMock
            .Setup(r => r.FindByNameAsync("milk", _userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Item> { new() { ItemName = "Milk", Price = 50m } });

        // Act
        var result = await _service.ExecuteAsync("How much is Milk?", _userId);

        // Assert
        Assert.Contains("Milk", result.ResponseText);
    }

    [Fact]
    public async Task ExecuteAsync_WhenTriggerMatchesButItemNotFound_ReturnsNotFoundResponse()
    {
        // Arrange
        var action = new Domain.Entities.Action
        {
            Id = new Guid("00000000-0000-0000-0000-000000000001"),
            ActionType = ActionType.Query,
            ResponseTemplate = "{item} costs {value}"
        };
        var trigger = new Trigger
        {
            UserId = _userId,
            Phrase = "price of",
            ActionId = action.Id,
            Action = action
        };

        _triggerRepositoryMock
            .Setup(r => r.GetAllByUserAsync(_userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Trigger> { trigger });
        _itemRepositoryMock
            .Setup(r => r.FindByNameAsync(It.IsAny<string>(), _userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Item>());

        // Act
        var result = await _service.ExecuteAsync("price of unknown", _userId);

        // Assert
        Assert.Contains("couldn't find", result.ResponseText);
    }

    [Fact]
    public async Task ExecuteAsync_WhenTriggerWithRemoveActionMatchesItem_CallsDeleteAndReturnsTemplate()
    {
        // Arrange
        var item = new Item { ItemName = "Milk", BisayaName = "Gatas", Price = 50m };
        var action = new Domain.Entities.Action
        {
            Id = new Guid("00000000-0000-0000-0000-000000000004"),
            ActionType = ActionType.Remove,
            ResponseTemplate = "I've removed {item}."
        };
        var trigger = new Trigger
        {
            UserId = _userId,
            Phrase = "remove",
            ActionId = action.Id,
            Action = action
        };

        _triggerRepositoryMock
            .Setup(r => r.GetAllByUserAsync(_userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Trigger> { trigger });
        _itemRepositoryMock
            .Setup(r => r.FindByNameAsync("milk", _userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Item> { item });

        // Act
        var result = await _service.ExecuteAsync("remove milk", _userId);

        // Assert
        _itemRepositoryMock.Verify(r => r.DeleteAsync(item, It.IsAny<CancellationToken>()), Times.Once);
        Assert.Contains("Milk", result.ResponseText);
        Assert.True(result.ItemsModified);
    }

    [Fact]
    public async Task ExecuteAsync_WhenTriggerWithRemoveActionButItemNotFound_DoesNotDeleteAndReturnsNotFound()
    {
        // Arrange
        var action = new Domain.Entities.Action
        {
            Id = new Guid("00000000-0000-0000-0000-000000000004"),
            ActionType = ActionType.Remove,
            ResponseTemplate = "I've removed {item}."
        };
        var trigger = new Trigger
        {
            UserId = _userId,
            Phrase = "remove",
            ActionId = action.Id,
            Action = action
        };

        _triggerRepositoryMock
            .Setup(r => r.GetAllByUserAsync(_userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Trigger> { trigger });
        _itemRepositoryMock
            .Setup(r => r.FindByNameAsync(It.IsAny<string>(), _userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Item>());

        // Act
        var result = await _service.ExecuteAsync("remove unknown", _userId);

        // Assert
        _itemRepositoryMock.Verify(r => r.DeleteAsync(It.IsAny<Item>(), It.IsAny<CancellationToken>()), Times.Never);
        Assert.Contains("couldn't find", result.ResponseText);
        Assert.False(result.ItemsModified);
    }

    [Fact]
    public async Task ExecuteAsync_WhenLongerTriggerPhraseMatches_UsesMostSpecificTrigger()
    {
        // Arrange
        var action = new Domain.Entities.Action
        {
            Id = new Guid("00000000-0000-0000-0000-000000000001"),
            ActionType = ActionType.Query,
            ResponseTemplate = "{item} is {value}"
        };
        var shortTrigger = new Trigger { UserId = _userId, Phrase = "price", ActionId = action.Id, Action = action };
        var longTrigger = new Trigger { UserId = _userId, Phrase = "price of", ActionId = action.Id, Action = action };
        var item = new Item { ItemName = "Rice", BisayaName = "Bugas", Price = 60m };

        _triggerRepositoryMock
            .Setup(r => r.GetAllByUserAsync(_userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Trigger> { shortTrigger, longTrigger });
        _itemRepositoryMock
            .Setup(r => r.FindByNameAsync(It.IsAny<string>(), _userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Item> { item });

        // Act
        var result = await _service.ExecuteAsync("price of rice", _userId);

        // Assert — longest matching phrase wins
        Assert.Contains("Rice", result.ResponseText);
    }
}

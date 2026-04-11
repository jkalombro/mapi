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
    public async Task ExecuteAsync_WhenTriggerPhraseMatches_ExecutesLinkedActions()
    {
        // Arrange
        var item = new Item { ItemName = "Milk", BisayaName = "Gatas", Price = 50m };
        var action = new Domain.Entities.Action
        {
            Id = Guid.NewGuid(),
            ActionType = ActionType.Query,
            ResponseTemplate = "{name} is {price}"
        };
        var map = new TriggerActionMap { ActionId = action.Id, SortOrder = 1, Action = action };
        var trigger = new Trigger
        {
            UserId = _userId,
            Phrase = "What's the price of",
            TriggerActionMaps = new List<TriggerActionMap> { map }
        };

        _triggerRepositoryMock
            .Setup(r => r.GetAllWithActionsAsync(_userId, It.IsAny<CancellationToken>()))
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
    public async Task ExecuteAsync_WhenMultipleActionsLinked_ExecutesInSortOrder()
    {
        // Arrange
        var firstAction = new Domain.Entities.Action
        {
            Id = Guid.NewGuid(),
            ActionType = ActionType.Query,
            ResponseTemplate = "First: {name}"
        };
        var secondAction = new Domain.Entities.Action
        {
            Id = Guid.NewGuid(),
            ActionType = ActionType.Query,
            ResponseTemplate = "Second: {price}"
        };
        var map1 = new TriggerActionMap { ActionId = firstAction.Id, SortOrder = 2, Action = firstAction };
        var map2 = new TriggerActionMap { ActionId = secondAction.Id, SortOrder = 1, Action = secondAction };
        var trigger = new Trigger
        {
            UserId = _userId,
            Phrase = "check",
            TriggerActionMaps = new List<TriggerActionMap> { map1, map2 }
        };

        _triggerRepositoryMock
            .Setup(r => r.GetAllWithActionsAsync(_userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Trigger> { trigger });
        var item = new Item { ItemName = "Sugar", BisayaName = "Asukal", Price = 75m };
        _itemRepositoryMock
            .Setup(r => r.FindByNameAsync(It.IsAny<string>(), _userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Item> { item });

        // Act
        var result = await _service.ExecuteAsync("check something", _userId);

        // Assert: The last action in sort order wins (Second: {price})
        Assert.Contains("75", result.ResponseText);
    }

    [Fact]
    public async Task ExecuteAsync_WhenNoTriggerMatches_FallsBackToBuiltInPatterns()
    {
        // Arrange
        _triggerRepositoryMock
            .Setup(r => r.GetAllWithActionsAsync(_userId, It.IsAny<CancellationToken>()))
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
            Id = Guid.NewGuid(),
            ActionType = ActionType.Query,
            ResponseTemplate = "{name} costs {price}"
        };
        var map = new TriggerActionMap { ActionId = action.Id, SortOrder = 1, Action = action };
        var trigger = new Trigger
        {
            UserId = _userId,
            Phrase = "price of",
            TriggerActionMaps = new List<TriggerActionMap> { map }
        };

        _triggerRepositoryMock
            .Setup(r => r.GetAllWithActionsAsync(_userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Trigger> { trigger });
        _itemRepositoryMock
            .Setup(r => r.FindByNameAsync(It.IsAny<string>(), _userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Item>());

        // Act
        var result = await _service.ExecuteAsync("price of unknown", _userId);

        // Assert
        Assert.Contains("couldn't find", result.ResponseText);
    }
}

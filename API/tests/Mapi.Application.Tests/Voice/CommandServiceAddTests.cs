using Mapi.Domain.Entities;
using Mapi.Domain.Enums;
using Mapi.Domain.Interfaces;
using Mapi.Infrastructure.Services;
using Moq;

namespace Mapi.Application.Tests.Voice;

public class CommandServiceAddTests
{
    private readonly Mock<IItemRepository> _itemRepositoryMock;
    private readonly Mock<ITriggerRepository> _triggerRepositoryMock;
    private readonly CommandService _service;
    private readonly Guid _userId = Guid.NewGuid();

    private readonly Domain.Entities.Action _addAction = new()
    {
        Id = new Guid("00000000-0000-0000-0000-000000000002"),
        ActionType = ActionType.Add,
        ResponseTemplate = "I've added {item}.",
    };

    private readonly Domain.Entities.Action _updateAction = new()
    {
        Id = new Guid("00000000-0000-0000-0000-000000000003"),
        ActionType = ActionType.Update,
        ResponseTemplate = "I've updated {item} to {value}.",
    };

    public CommandServiceAddTests()
    {
        _itemRepositoryMock = new Mock<IItemRepository>();
        _triggerRepositoryMock = new Mock<ITriggerRepository>();
        _triggerRepositoryMock
            .Setup(r => r.GetAllByUserAsync(_userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Trigger>());
        _service = new CommandService(_itemRepositoryMock.Object, _triggerRepositoryMock.Object);
    }

    // ── Add trigger → ask for price (item not found) ──────────────────────────

    [Fact]
    public async Task ExecuteAsync_WhenAddTriggerFiredAndItemNotFound_ReturnsAskForPricePrompt()
    {
        // Arrange
        var trigger = new Trigger { UserId = _userId, Phrase = "add", ActionId = _addAction.Id, Action = _addAction };
        _triggerRepositoryMock
            .Setup(r => r.GetAllByUserAsync(_userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Trigger> { trigger });
        _itemRepositoryMock
            .Setup(r => r.FindByNameAsync("gatas", _userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Item>());

        // Act
        var result = await _service.ExecuteAsync("add gatas", _userId);

        // Assert
        Assert.Contains("price", result.ResponseText, StringComparison.OrdinalIgnoreCase);
        Assert.Equal("Add", result.PendingIntent);
        Assert.Equal("gatas", result.PendingItemName);
        _itemRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Item>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task ExecuteAsync_WhenAddTriggerFiredAndItemExists_ReturnsConfirmUpdatePrompt()
    {
        // Arrange
        var existing = new Item { ItemName = "Gatas", BisayaName = "Gatas", Price = 40m };
        var trigger = new Trigger { UserId = _userId, Phrase = "add", ActionId = _addAction.Id, Action = _addAction };
        _triggerRepositoryMock
            .Setup(r => r.GetAllByUserAsync(_userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Trigger> { trigger });
        _itemRepositoryMock
            .Setup(r => r.FindByNameAsync("gatas", _userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Item> { existing });

        // Act
        var result = await _service.ExecuteAsync("add gatas", _userId);

        // Assert
        Assert.True(result.IsConfirmationRequired);
        Assert.Equal("ConfirmUpdate", result.PendingIntent);
        Assert.Equal("Gatas", result.PendingItemName);
        _itemRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Item>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    // ── PendingIntent=Add → price provided ────────────────────────────────────

    [Fact]
    public async Task ExecuteAsync_WhenPendingAddAndValidPrice_CreatesItemAndReturnsConfirmation()
    {
        // Arrange
        _itemRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<Item>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Item item, CancellationToken _) => item);

        // Act
        var result = await _service.ExecuteAsync("50", _userId, pendingIntent: "Add", pendingItemName: "gatas");

        // Assert
        Assert.True(result.ItemsModified);
        Assert.Null(result.PendingIntent);
        Assert.Contains("added", result.ResponseText, StringComparison.OrdinalIgnoreCase);
        _itemRepositoryMock.Verify(r => r.AddAsync(
            It.Is<Item>(i => i.Price == 50m && i.UserId == _userId),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ExecuteAsync_WhenPendingAddAndDecimalPrice_ParsesPriceCorrectly()
    {
        // Arrange
        _itemRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<Item>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Item item, CancellationToken _) => item);

        // Act
        var result = await _service.ExecuteAsync("45.50", _userId, pendingIntent: "Add", pendingItemName: "sugar");

        // Assert
        Assert.True(result.ItemsModified);
        _itemRepositoryMock.Verify(r => r.AddAsync(
            It.Is<Item>(i => i.Price == 45.50m),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ExecuteAsync_WhenPendingAddAndInvalidPrice_ReturnsInvalidPriceWithPendingIntact()
    {
        // Act
        var result = await _service.ExecuteAsync("not a number", _userId, pendingIntent: "Add", pendingItemName: "gatas");

        // Assert
        Assert.False(result.ItemsModified);
        Assert.Equal("Add", result.PendingIntent);
        Assert.Equal("gatas", result.PendingItemName);
        _itemRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Item>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    // ── PendingIntent=ConfirmUpdate ────────────────────────────────────────────

    [Fact]
    public async Task ExecuteAsync_WhenPendingConfirmUpdateAndYes_ReturnsUpdatePricePrompt()
    {
        // Act
        var result = await _service.ExecuteAsync("yes", _userId, pendingIntent: "ConfirmUpdate", pendingItemName: "gatas");

        // Assert
        Assert.Equal("Update", result.PendingIntent);
        Assert.Equal("gatas", result.PendingItemName);
        Assert.Contains("new price", result.ResponseText, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task ExecuteAsync_WhenPendingConfirmUpdateAndNo_CancelsAndClearsPending()
    {
        // Act
        var result = await _service.ExecuteAsync("no", _userId, pendingIntent: "ConfirmUpdate", pendingItemName: "gatas");

        // Assert
        Assert.Null(result.PendingIntent);
        Assert.Null(result.PendingItemName);
        Assert.Contains("cancelled", result.ResponseText, StringComparison.OrdinalIgnoreCase);
    }

    // ── Update trigger → ask for price ────────────────────────────────────────

    [Fact]
    public async Task ExecuteAsync_WhenUpdateTriggerFiredAndItemFound_ReturnsAskForNewPricePrompt()
    {
        // Arrange
        var existing = new Item { ItemName = "Gatas", BisayaName = "Gatas", Price = 40m };
        var trigger = new Trigger { UserId = _userId, Phrase = "update", ActionId = _updateAction.Id, Action = _updateAction };
        _triggerRepositoryMock
            .Setup(r => r.GetAllByUserAsync(_userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Trigger> { trigger });
        _itemRepositoryMock
            .Setup(r => r.FindByNameAsync("gatas", _userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Item> { existing });

        // Act
        var result = await _service.ExecuteAsync("update gatas", _userId);

        // Assert
        Assert.Contains("new price", result.ResponseText, StringComparison.OrdinalIgnoreCase);
        Assert.Equal("Update", result.PendingIntent);
        Assert.Equal("Gatas", result.PendingItemName);
        _itemRepositoryMock.Verify(r => r.UpdateAsync(It.IsAny<Item>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task ExecuteAsync_WhenUpdateTriggerFiredAndItemNotFound_ReturnsNotFound()
    {
        // Arrange
        var trigger = new Trigger { UserId = _userId, Phrase = "update", ActionId = _updateAction.Id, Action = _updateAction };
        _triggerRepositoryMock
            .Setup(r => r.GetAllByUserAsync(_userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Trigger> { trigger });
        _itemRepositoryMock
            .Setup(r => r.FindByNameAsync(It.IsAny<string>(), _userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Item>());

        // Act
        var result = await _service.ExecuteAsync("update unknown", _userId);

        // Assert
        Assert.Contains("couldn't find", result.ResponseText, StringComparison.OrdinalIgnoreCase);
        Assert.Null(result.PendingIntent);
    }

    // ── PendingIntent=Update → price provided ─────────────────────────────────

    [Fact]
    public async Task ExecuteAsync_WhenPendingUpdateAndValidPrice_UpdatesItemAndReturnsConfirmation()
    {
        // Arrange
        var existing = new Item { ItemName = "Gatas", BisayaName = "Gatas", Price = 40m };
        _itemRepositoryMock
            .Setup(r => r.FindByNameAsync("gatas", _userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Item> { existing });
        _itemRepositoryMock
            .Setup(r => r.UpdateAsync(It.IsAny<Item>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _service.ExecuteAsync("60", _userId, pendingIntent: "Update", pendingItemName: "gatas");

        // Assert
        Assert.True(result.ItemsModified);
        Assert.Null(result.PendingIntent);
        Assert.Contains("60", result.ResponseText);
        _itemRepositoryMock.Verify(r => r.UpdateAsync(
            It.Is<Item>(i => i.Price == 60m),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ExecuteAsync_WhenPendingUpdateAndItemGoneBeforePrice_ReturnsNotFound()
    {
        // Arrange
        _itemRepositoryMock
            .Setup(r => r.FindByNameAsync(It.IsAny<string>(), _userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Item>());

        // Act
        var result = await _service.ExecuteAsync("60", _userId, pendingIntent: "Update", pendingItemName: "gatas");

        // Assert
        Assert.False(result.ItemsModified);
        Assert.Contains("couldn't find", result.ResponseText, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task ExecuteAsync_WhenPendingUpdateAndInvalidPrice_ReturnsInvalidPriceWithPendingIntact()
    {
        // Act
        var result = await _service.ExecuteAsync("abc", _userId, pendingIntent: "Update", pendingItemName: "gatas");

        // Assert
        Assert.False(result.ItemsModified);
        Assert.Equal("Update", result.PendingIntent);
        Assert.Equal("gatas", result.PendingItemName);
        _itemRepositoryMock.Verify(r => r.UpdateAsync(It.IsAny<Item>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}

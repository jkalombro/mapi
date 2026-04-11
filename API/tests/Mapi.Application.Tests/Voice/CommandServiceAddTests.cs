using Mapi.Domain.Entities;
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

    public CommandServiceAddTests()
    {
        _itemRepositoryMock = new Mock<IItemRepository>();
        _triggerRepositoryMock = new Mock<ITriggerRepository>();
        _triggerRepositoryMock
            .Setup(r => r.GetAllWithActionsAsync(_userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Trigger>());
        _service = new CommandService(_itemRepositoryMock.Object, _triggerRepositoryMock.Object);
    }

    [Fact]
    public async Task ExecuteAsync_WhenAddNewItem_CreatesItemAndReturnsConfirmation()
    {
        // Arrange
        _itemRepositoryMock
            .Setup(r => r.FindByNameAsync("gatas", _userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Item>());

        // Act
        var result = await _service.ExecuteAsync("Add Gatas price 50", _userId);

        // Assert
        Assert.False(result.IsConfirmationRequired);
        Assert.Contains("added", result.ResponseText, StringComparison.OrdinalIgnoreCase);
        _itemRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Item>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ExecuteAsync_WhenAddDuplicateItem_ReturnsConfirmationRequired()
    {
        // Arrange
        var existing = new Item { ItemName = "Gatas", BisayaName = "Gatas", Price = 40m };
        _itemRepositoryMock
            .Setup(r => r.FindByNameAsync("gatas", _userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Item> { existing });

        // Act
        var result = await _service.ExecuteAsync("Add Gatas price 50", _userId);

        // Assert
        Assert.True(result.IsConfirmationRequired);
        _itemRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Item>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task ExecuteAsync_WhenMalformedAddCommand_ReturnsMalformedResponse()
    {
        // Act
        var result = await _service.ExecuteAsync("Add Gatas", _userId);

        // Assert
        Assert.False(result.IsConfirmationRequired);
        Assert.Contains("didn't understand", result.ResponseText, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task ExecuteAsync_WhenAddWithDecimalPrice_ParsesPriceCorrectly()
    {
        // Arrange
        _itemRepositoryMock
            .Setup(r => r.FindByNameAsync("sugar", _userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Item>());

        // Act
        var result = await _service.ExecuteAsync("Add Sugar price 45.50", _userId);

        // Assert
        Assert.False(result.IsConfirmationRequired);
        _itemRepositoryMock.Verify(r => r.AddAsync(
            It.Is<Item>(i => i.Price == 45.50m),
            It.IsAny<CancellationToken>()), Times.Once);
    }
}

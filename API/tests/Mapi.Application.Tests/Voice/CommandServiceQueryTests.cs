using Mapi.Domain.Entities;
using Mapi.Domain.Interfaces;
using Mapi.Infrastructure.Services;
using Moq;

namespace Mapi.Application.Tests.Voice;

public class CommandServiceQueryTests
{
    private readonly Mock<IItemRepository> _itemRepositoryMock;
    private readonly Mock<ITriggerRepository> _triggerRepositoryMock;
    private readonly CommandService _service;
    private readonly Guid _userId = Guid.NewGuid();

    public CommandServiceQueryTests()
    {
        _itemRepositoryMock = new Mock<IItemRepository>();
        _triggerRepositoryMock = new Mock<ITriggerRepository>();
        _triggerRepositoryMock
            .Setup(r => r.GetAllByUserAsync(_userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Trigger>());
        _service = new CommandService(_itemRepositoryMock.Object, _triggerRepositoryMock.Object);
    }

    [Fact]
    public async Task ExecuteAsync_WhenExactItemNameMatch_ReturnsPriceResponse()
    {
        // Arrange
        var item = new Item { ItemName = "Milk", BisayaName = "Gatas", Price = 50m };
        _itemRepositoryMock
            .Setup(r => r.FindByNameAsync("milk", _userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Item> { item });

        // Act
        var result = await _service.ExecuteAsync("How much is Milk?", _userId);

        // Assert
        Assert.Contains("Milk", result.ResponseText);
        Assert.Contains("50", result.ResponseText);
        Assert.False(result.IsAmbiguous);
    }

    [Fact]
    public async Task ExecuteAsync_WhenBisayaNameMatch_ReturnsPriceResponse()
    {
        // Arrange
        var item = new Item { ItemName = "Milk", BisayaName = "Gatas", Price = 50m };
        _itemRepositoryMock
            .Setup(r => r.FindByNameAsync("gatas", _userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Item> { item });

        // Act
        var result = await _service.ExecuteAsync("How much is Gatas?", _userId);

        // Assert
        Assert.Contains("Milk", result.ResponseText);
        Assert.False(result.IsAmbiguous);
    }

    [Fact]
    public async Task ExecuteAsync_WhenNoMatch_ReturnsNotFoundResponse()
    {
        // Arrange
        _itemRepositoryMock
            .Setup(r => r.FindByNameAsync(It.IsAny<string>(), _userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Item>());

        // Act
        var result = await _service.ExecuteAsync("How much is Unknown?", _userId);

        // Assert
        Assert.False(result.IsAmbiguous);
        Assert.Contains("couldn't find", result.ResponseText);
    }

    [Fact]
    public async Task ExecuteAsync_WhenAmbiguousMultiMatch_ReturnsAmbiguousResult()
    {
        // Arrange
        var items = new List<Item>
        {
            new() { ItemName = "Gabi", BisayaName = "Gabi", Price = 30m },
            new() { ItemName = "Gatas", BisayaName = "Gatas", Price = 50m }
        };
        _itemRepositoryMock
            .Setup(r => r.FindByNameAsync("g", _userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(items);

        // Act
        var result = await _service.ExecuteAsync("How much is g?", _userId);

        // Assert
        Assert.True(result.IsAmbiguous);
        Assert.NotNull(result.MatchedNames);
        Assert.Equal(2, result.MatchedNames!.Count);
    }

    [Fact]
    public async Task ExecuteAsync_WhenMalformedCommand_ReturnsMalformedResponse()
    {
        // Arrange & Act
        var result = await _service.ExecuteAsync("random gibberish", _userId);

        // Assert
        Assert.False(result.IsAmbiguous);
        Assert.Contains("didn't understand", result.ResponseText);
    }

    [Fact]
    public async Task ExecuteAsync_WhenEmptyTranscript_ReturnsDidntCatchResponse()
    {
        // Act
        var result = await _service.ExecuteAsync(string.Empty, _userId);

        // Assert
        Assert.Contains("Didn't catch that", result.ResponseText);
    }
}

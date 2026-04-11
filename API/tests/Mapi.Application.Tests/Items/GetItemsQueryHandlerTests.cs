using Mapi.Application.Common.Interfaces;
using Mapi.Application.Items.Queries;
using Mapi.Domain.Entities;
using Mapi.Domain.Exceptions;
using Mapi.Domain.Interfaces;
using Moq;

namespace Mapi.Application.Tests.Items;

public class GetItemsQueryHandlerTests
{
    private readonly Mock<IItemRepository> _itemRepositoryMock;
    private readonly Mock<ICurrentUserService> _currentUserServiceMock;
    private readonly GetItemsQueryHandler _getItemsHandler;
    private readonly GetItemByIdQueryHandler _getItemByIdHandler;
    private readonly Guid _userId = Guid.NewGuid();

    public GetItemsQueryHandlerTests()
    {
        _itemRepositoryMock = new Mock<IItemRepository>();
        _currentUserServiceMock = new Mock<ICurrentUserService>();
        _currentUserServiceMock.Setup(s => s.UserId).Returns(_userId);
        _getItemsHandler = new GetItemsQueryHandler(_itemRepositoryMock.Object, _currentUserServiceMock.Object);
        _getItemByIdHandler = new GetItemByIdQueryHandler(_itemRepositoryMock.Object);
    }

    [Fact]
    public async Task GetItemsQuery_WhenUserHasItems_ReturnsAllItems()
    {
        // Arrange
        var items = new List<Item>
        {
            new() { Id = Guid.NewGuid(), ItemName = "Milk", BisayaName = "Gatas", Price = 50m, UserId = _userId },
            new() { Id = Guid.NewGuid(), ItemName = "Rice", BisayaName = "Bugas", Price = 100m, UserId = _userId }
        };
        _itemRepositoryMock
            .Setup(r => r.GetAllByUserAsync(_userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(items);

        // Act
        var result = await _getItemsHandler.Handle(new GetItemsQuery(), CancellationToken.None);

        // Assert
        Assert.Equal(2, result.Count);
        Assert.Contains(result, r => r.ItemName == "Milk");
        Assert.Contains(result, r => r.ItemName == "Rice");
    }

    [Fact]
    public async Task GetItemsQuery_WhenUserHasNoItems_ReturnsEmptyList()
    {
        // Arrange
        _itemRepositoryMock
            .Setup(r => r.GetAllByUserAsync(_userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Item>());

        // Act
        var result = await _getItemsHandler.Handle(new GetItemsQuery(), CancellationToken.None);

        // Assert
        Assert.Empty(result);
    }

    [Fact]
    public async Task GetItemByIdQuery_WhenItemExists_ReturnsItem()
    {
        // Arrange
        var itemId = Guid.NewGuid();
        var item = new Item { Id = itemId, ItemName = "Sugar", BisayaName = "Asukal", Price = 75m };
        _itemRepositoryMock
            .Setup(r => r.GetByIdAsync(itemId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(item);

        // Act
        var result = await _getItemByIdHandler.Handle(new GetItemByIdQuery(itemId), CancellationToken.None);

        // Assert
        Assert.Equal(itemId, result.Id);
        Assert.Equal("Sugar", result.ItemName);
    }

    [Fact]
    public async Task GetItemByIdQuery_WhenItemNotFound_ThrowsNotFoundException()
    {
        // Arrange
        var itemId = Guid.NewGuid();
        _itemRepositoryMock
            .Setup(r => r.GetByIdAsync(itemId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Item?)null);

        // Act & Assert
        await Assert.ThrowsAsync<NotFoundException>(() =>
            _getItemByIdHandler.Handle(new GetItemByIdQuery(itemId), CancellationToken.None));
    }
}

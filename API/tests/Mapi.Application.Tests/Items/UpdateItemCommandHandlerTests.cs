using Mapi.Application.Items.Commands;
using Mapi.Domain.Entities;
using Mapi.Domain.Exceptions;
using Mapi.Domain.Interfaces;
using Moq;

namespace Mapi.Application.Tests.Items;

public class UpdateItemCommandHandlerTests
{
    private readonly Mock<IItemRepository> _itemRepositoryMock;
    private readonly UpdateItemCommandHandler _handler;

    public UpdateItemCommandHandlerTests()
    {
        _itemRepositoryMock = new Mock<IItemRepository>();
        _handler = new UpdateItemCommandHandler(_itemRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WhenItemExists_UpdatesAndReturnsResponse()
    {
        // Arrange
        var itemId = Guid.NewGuid();
        var existingItem = new Item
        {
            Id = itemId,
            ItemName = "OldName",
            BisayaName = "OldBisaya",
            Price = 10.00m
        };
        var command = new UpdateItemCommand(itemId, "NewName", "NewBisaya", 20.00m);

        _itemRepositoryMock
            .Setup(r => r.GetByIdAsync(itemId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingItem);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.Equal("NewName", result.ItemName);
        Assert.Equal("NewBisaya", result.BisayaName);
        Assert.Equal(20.00m, result.Price);
        _itemRepositoryMock.Verify(r => r.UpdateAsync(existingItem, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenItemNotFound_ThrowsNotFoundException()
    {
        // Arrange
        var itemId = Guid.NewGuid();
        var command = new UpdateItemCommand(itemId, "Name", "Bisaya", 10.00m);
        _itemRepositoryMock
            .Setup(r => r.GetByIdAsync(itemId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Item?)null);

        // Act & Assert
        await Assert.ThrowsAsync<NotFoundException>(() =>
            _handler.Handle(command, CancellationToken.None));
        _itemRepositoryMock.Verify(r => r.UpdateAsync(It.IsAny<Item>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}

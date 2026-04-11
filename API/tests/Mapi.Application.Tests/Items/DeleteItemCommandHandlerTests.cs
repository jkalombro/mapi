using Mapi.Application.Items.Commands;
using Mapi.Domain.Entities;
using Mapi.Domain.Exceptions;
using Mapi.Domain.Interfaces;
using Moq;

namespace Mapi.Application.Tests.Items;

public class DeleteItemCommandHandlerTests
{
    private readonly Mock<IItemRepository> _itemRepositoryMock;
    private readonly DeleteItemCommandHandler _handler;

    public DeleteItemCommandHandlerTests()
    {
        _itemRepositoryMock = new Mock<IItemRepository>();
        _handler = new DeleteItemCommandHandler(_itemRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WhenItemExists_DeletesItem()
    {
        // Arrange
        var itemId = Guid.NewGuid();
        var existingItem = new Item { Id = itemId, ItemName = "Milk" };
        var command = new DeleteItemCommand(itemId);

        _itemRepositoryMock
            .Setup(r => r.GetByIdAsync(itemId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingItem);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _itemRepositoryMock.Verify(r => r.DeleteAsync(existingItem, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenItemNotFound_ThrowsNotFoundException()
    {
        // Arrange
        var itemId = Guid.NewGuid();
        var command = new DeleteItemCommand(itemId);
        _itemRepositoryMock
            .Setup(r => r.GetByIdAsync(itemId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Item?)null);

        // Act & Assert
        await Assert.ThrowsAsync<NotFoundException>(() =>
            _handler.Handle(command, CancellationToken.None));
        _itemRepositoryMock.Verify(r => r.DeleteAsync(It.IsAny<Item>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}

using Mapi.Application.Common.Interfaces;
using Mapi.Application.Items.Commands;
using Mapi.Domain.Entities;
using Mapi.Domain.Interfaces;
using Moq;

namespace Mapi.Application.Tests.Items;

public class CreateItemCommandHandlerTests
{
    private readonly Mock<IItemRepository> _itemRepositoryMock;
    private readonly Mock<ICurrentUserService> _currentUserServiceMock;
    private readonly CreateItemCommandHandler _handler;
    private readonly Guid _userId = Guid.NewGuid();

    public CreateItemCommandHandlerTests()
    {
        _itemRepositoryMock = new Mock<IItemRepository>();
        _currentUserServiceMock = new Mock<ICurrentUserService>();
        _currentUserServiceMock.Setup(s => s.UserId).Returns(_userId);
        _handler = new CreateItemCommandHandler(_itemRepositoryMock.Object, _currentUserServiceMock.Object);
    }

    [Fact]
    public async Task Handle_WhenValidCommand_ReturnsItemResponse()
    {
        // Arrange
        var command = new CreateItemCommand("Milk", "Gatas", 50.00m);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Milk", result.ItemName);
        Assert.Equal("Gatas", result.BisayaName);
        Assert.Equal(50.00m, result.Price);
        _itemRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Item>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenValidCommand_SetsUserIdFromCurrentUser()
    {
        // Arrange
        var command = new CreateItemCommand("Rice", "Bugas", 100.00m);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _itemRepositoryMock.Verify(r => r.AddAsync(
            It.Is<Item>(i => i.UserId == _userId),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenValidCommand_ReturnsNewId()
    {
        // Arrange
        var command = new CreateItemCommand("Sugar", "Asukal", 75.00m);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.NotEqual(Guid.Empty, result.Id);
    }
}

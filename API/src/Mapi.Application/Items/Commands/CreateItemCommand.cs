using Mapi.Application.Common.Interfaces;
using Mapi.Application.Items.DTOs;
using Mapi.Domain.Entities;
using Mapi.Domain.Interfaces;
using MediatR;

namespace Mapi.Application.Items.Commands;

public record CreateItemCommand(string ItemName, string BisayaName, decimal Price) : IRequest<ItemResponse>;

public class CreateItemCommandHandler : IRequestHandler<CreateItemCommand, ItemResponse>
{
    private readonly IItemRepository _itemRepository;
    private readonly ICurrentUserService _currentUserService;

    public CreateItemCommandHandler(IItemRepository itemRepository, ICurrentUserService currentUserService)
    {
        _itemRepository = itemRepository;
        _currentUserService = currentUserService;
    }

    public async Task<ItemResponse> Handle(CreateItemCommand request, CancellationToken cancellationToken)
    {
        var item = new Item
        {
            UserId = _currentUserService.UserId,
            ItemName = request.ItemName,
            BisayaName = request.BisayaName,
            Price = request.Price
        };

        await _itemRepository.AddAsync(item, cancellationToken);

        return new ItemResponse(item.Id, item.ItemName, item.BisayaName, item.Price, item.CreatedAt, item.UpdatedAt);
    }
}

using Mapi.Application.Items.DTOs;
using Mapi.Domain.Exceptions;
using Mapi.Domain.Interfaces;
using MediatR;

namespace Mapi.Application.Items.Commands;

public record UpdateItemCommand(Guid Id, string ItemName, string BisayaName, decimal Price) : IRequest<ItemResponse>;

public class UpdateItemCommandHandler : IRequestHandler<UpdateItemCommand, ItemResponse>
{
    private readonly IItemRepository _itemRepository;

    public UpdateItemCommandHandler(IItemRepository itemRepository)
    {
        _itemRepository = itemRepository;
    }

    public async Task<ItemResponse> Handle(UpdateItemCommand request, CancellationToken cancellationToken)
    {
        var item = await _itemRepository.GetByIdAsync(request.Id, cancellationToken);
        if (item is null)
        {
            throw new NotFoundException(nameof(item), request.Id);
        }

        item.ItemName = request.ItemName;
        item.BisayaName = request.BisayaName;
        item.Price = request.Price;

        await _itemRepository.UpdateAsync(item, cancellationToken);

        return new ItemResponse(item.Id, item.ItemName, item.BisayaName, item.Price, item.CreatedAt, item.UpdatedAt);
    }
}

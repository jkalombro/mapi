using Mapi.Application.Items.DTOs;
using Mapi.Domain.Exceptions;
using Mapi.Domain.Interfaces;
using MediatR;

namespace Mapi.Application.Items.Queries;

public record GetItemByIdQuery(Guid Id) : IRequest<ItemResponse>;

public class GetItemByIdQueryHandler : IRequestHandler<GetItemByIdQuery, ItemResponse>
{
    private readonly IItemRepository _itemRepository;

    public GetItemByIdQueryHandler(IItemRepository itemRepository)
    {
        _itemRepository = itemRepository;
    }

    public async Task<ItemResponse> Handle(GetItemByIdQuery request, CancellationToken cancellationToken)
    {
        var item = await _itemRepository.GetByIdAsync(request.Id, cancellationToken);
        if (item is null)
        {
            throw new NotFoundException(nameof(item), request.Id);
        }

        return new ItemResponse(item.Id, item.ItemName, item.BisayaName, item.Price, item.CreatedAt, item.UpdatedAt);
    }
}

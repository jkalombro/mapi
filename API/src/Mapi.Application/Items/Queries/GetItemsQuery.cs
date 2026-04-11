using Mapi.Application.Common.Interfaces;
using Mapi.Application.Items.DTOs;
using Mapi.Domain.Interfaces;
using MediatR;

namespace Mapi.Application.Items.Queries;

public record GetItemsQuery : IRequest<IReadOnlyList<ItemResponse>>;

public class GetItemsQueryHandler : IRequestHandler<GetItemsQuery, IReadOnlyList<ItemResponse>>
{
    private readonly IItemRepository _itemRepository;
    private readonly ICurrentUserService _currentUserService;

    public GetItemsQueryHandler(IItemRepository itemRepository, ICurrentUserService currentUserService)
    {
        _itemRepository = itemRepository;
        _currentUserService = currentUserService;
    }

    public async Task<IReadOnlyList<ItemResponse>> Handle(GetItemsQuery request, CancellationToken cancellationToken)
    {
        var items = await _itemRepository.GetAllByUserAsync(_currentUserService.UserId, cancellationToken);
        return items.Select(i => new ItemResponse(i.Id, i.ItemName, i.BisayaName, i.Price, i.CreatedAt, i.UpdatedAt)).ToList();
    }
}

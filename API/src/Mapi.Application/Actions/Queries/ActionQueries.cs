using Mapi.Application.Actions.DTOs;
using Mapi.Domain.Interfaces;
using MediatR;

namespace Mapi.Application.Actions.Queries;

public record GetActionsQuery : IRequest<IReadOnlyList<ActionResponse>>;

public class GetActionsQueryHandler : IRequestHandler<GetActionsQuery, IReadOnlyList<ActionResponse>>
{
    private readonly IActionRepository _actionRepository;

    public GetActionsQueryHandler(IActionRepository actionRepository)
    {
        _actionRepository = actionRepository;
    }

    public async Task<IReadOnlyList<ActionResponse>> Handle(GetActionsQuery request, CancellationToken cancellationToken)
    {
        var actions = await _actionRepository.GetAllAsync(cancellationToken);
        return actions.Select(a => new ActionResponse(a.Id, a.ActionType, a.ResponseTemplate, a.CreatedAt, a.UpdatedAt)).ToList();
    }
}

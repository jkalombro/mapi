using Mapi.Application.Actions.DTOs;
using Mapi.Application.Common.Interfaces;
using Mapi.Domain.Exceptions;
using Mapi.Domain.Interfaces;
using MediatR;

namespace Mapi.Application.Actions.Queries;

public record GetActionsQuery : IRequest<IReadOnlyList<ActionResponse>>;
public record GetActionByIdQuery(Guid Id) : IRequest<ActionResponse>;

public class GetActionsQueryHandler : IRequestHandler<GetActionsQuery, IReadOnlyList<ActionResponse>>
{
    private readonly IActionRepository _actionRepository;
    private readonly ICurrentUserService _currentUserService;

    public GetActionsQueryHandler(IActionRepository actionRepository, ICurrentUserService currentUserService)
    {
        _actionRepository = actionRepository;
        _currentUserService = currentUserService;
    }

    public async Task<IReadOnlyList<ActionResponse>> Handle(GetActionsQuery request, CancellationToken cancellationToken)
    {
        var actions = await _actionRepository.GetAllByUserAsync(_currentUserService.UserId, cancellationToken);
        return actions.Select(a => new ActionResponse(a.Id, a.ActionType, a.ResponseTemplate, a.CreatedAt, a.UpdatedAt)).ToList();
    }
}

public class GetActionByIdQueryHandler : IRequestHandler<GetActionByIdQuery, ActionResponse>
{
    private readonly IActionRepository _actionRepository;

    public GetActionByIdQueryHandler(IActionRepository actionRepository)
    {
        _actionRepository = actionRepository;
    }

    public async Task<ActionResponse> Handle(GetActionByIdQuery request, CancellationToken cancellationToken)
    {
        var action = await _actionRepository.GetByIdAsync(request.Id, cancellationToken);
        if (action is null)
        {
            throw new NotFoundException("Action", request.Id);
        }

        return new ActionResponse(action.Id, action.ActionType, action.ResponseTemplate, action.CreatedAt, action.UpdatedAt);
    }
}

using Mapi.Application.Common.Interfaces;
using Mapi.Application.Triggers.DTOs;
using Mapi.Domain.Exceptions;
using Mapi.Domain.Interfaces;
using MediatR;

namespace Mapi.Application.Triggers.Queries;

public record GetTriggersQuery : IRequest<IReadOnlyList<TriggerResponse>>;
public record GetTriggerByIdQuery(Guid Id) : IRequest<TriggerResponse>;

public class GetTriggersQueryHandler : IRequestHandler<GetTriggersQuery, IReadOnlyList<TriggerResponse>>
{
    private readonly ITriggerRepository _triggerRepository;
    private readonly ICurrentUserService _currentUserService;

    public GetTriggersQueryHandler(ITriggerRepository triggerRepository, ICurrentUserService currentUserService)
    {
        _triggerRepository = triggerRepository;
        _currentUserService = currentUserService;
    }

    public async Task<IReadOnlyList<TriggerResponse>> Handle(GetTriggersQuery request, CancellationToken cancellationToken)
    {
        var triggers = await _triggerRepository.GetAllWithActionsAsync(_currentUserService.UserId, cancellationToken);

        return triggers.Select(t => new TriggerResponse(
            t.Id,
            t.Phrase,
            t.CreatedAt,
            t.UpdatedAt,
            t.TriggerActionMaps
                .OrderBy(m => m.SortOrder)
                .Select(m => new TriggerActionResponse(
                    m.ActionId,
                    m.Action.ActionType.ToString(),
                    m.Action.ResponseTemplate,
                    m.SortOrder))
                .ToList()
        )).ToList();
    }
}

public class GetTriggerByIdQueryHandler : IRequestHandler<GetTriggerByIdQuery, TriggerResponse>
{
    private readonly ITriggerRepository _triggerRepository;

    public GetTriggerByIdQueryHandler(ITriggerRepository triggerRepository)
    {
        _triggerRepository = triggerRepository;
    }

    public async Task<TriggerResponse> Handle(GetTriggerByIdQuery request, CancellationToken cancellationToken)
    {
        var trigger = await _triggerRepository.GetByIdAsync(request.Id, cancellationToken);
        if (trigger is null)
        {
            throw new NotFoundException("Trigger", request.Id);
        }

        return new TriggerResponse(
            trigger.Id,
            trigger.Phrase,
            trigger.CreatedAt,
            trigger.UpdatedAt,
            trigger.TriggerActionMaps
                .OrderBy(m => m.SortOrder)
                .Select(m => new TriggerActionResponse(
                    m.ActionId,
                    m.Action.ActionType.ToString(),
                    m.Action.ResponseTemplate,
                    m.SortOrder))
                .ToList());
    }
}

using Mapi.Application.Actions.DTOs;
using Mapi.Application.Common.Interfaces;
using Mapi.Domain.Enums;
using Mapi.Domain.Exceptions;
using Mapi.Domain.Interfaces;
using MediatR;

namespace Mapi.Application.Actions.Commands;

public record CreateActionCommand(ActionType ActionType, string ResponseTemplate) : IRequest<ActionResponse>;
public record UpdateActionCommand(Guid Id, string ResponseTemplate) : IRequest<ActionResponse>;
public record DeleteActionCommand(Guid Id) : IRequest;

public class CreateActionCommandHandler : IRequestHandler<CreateActionCommand, ActionResponse>
{
    private readonly IActionRepository _actionRepository;
    private readonly ICurrentUserService _currentUserService;

    public CreateActionCommandHandler(IActionRepository actionRepository, ICurrentUserService currentUserService)
    {
        _actionRepository = actionRepository;
        _currentUserService = currentUserService;
    }

    public async Task<ActionResponse> Handle(CreateActionCommand request, CancellationToken cancellationToken)
    {
        var action = new Domain.Entities.Action
        {
            UserId = _currentUserService.UserId,
            ActionType = request.ActionType,
            ResponseTemplate = request.ResponseTemplate
        };

        await _actionRepository.AddAsync(action, cancellationToken);

        return new ActionResponse(action.Id, action.ActionType, action.ResponseTemplate, action.CreatedAt, action.UpdatedAt);
    }
}

public class UpdateActionCommandHandler : IRequestHandler<UpdateActionCommand, ActionResponse>
{
    private readonly IActionRepository _actionRepository;

    public UpdateActionCommandHandler(IActionRepository actionRepository)
    {
        _actionRepository = actionRepository;
    }

    public async Task<ActionResponse> Handle(UpdateActionCommand request, CancellationToken cancellationToken)
    {
        var action = await _actionRepository.GetByIdAsync(request.Id, cancellationToken);
        if (action is null)
        {
            throw new NotFoundException("Action", request.Id);
        }

        action.ResponseTemplate = request.ResponseTemplate;

        await _actionRepository.UpdateAsync(action, cancellationToken);

        return new ActionResponse(action.Id, action.ActionType, action.ResponseTemplate, action.CreatedAt, action.UpdatedAt);
    }
}

public class DeleteActionCommandHandler : IRequestHandler<DeleteActionCommand>
{
    private readonly IActionRepository _actionRepository;

    public DeleteActionCommandHandler(IActionRepository actionRepository)
    {
        _actionRepository = actionRepository;
    }

    public async Task Handle(DeleteActionCommand request, CancellationToken cancellationToken)
    {
        var action = await _actionRepository.GetByIdAsync(request.Id, cancellationToken);
        if (action is null)
        {
            throw new NotFoundException("Action", request.Id);
        }

        var isLinked = await _actionRepository.IsLinkedToAnyTriggerAsync(request.Id, cancellationToken);
        if (isLinked)
        {
            throw new ConflictException($"Action '{request.Id}' is linked to one or more triggers and cannot be deleted.");
        }

        await _actionRepository.DeleteAsync(action, cancellationToken);
    }
}

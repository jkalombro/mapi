using Mapi.Application.Common.Interfaces;
using Mapi.Application.Triggers.DTOs;
using Mapi.Domain.Entities;
using Mapi.Domain.Exceptions;
using Mapi.Domain.Interfaces;
using MediatR;

namespace Mapi.Application.Triggers.Commands;

public record CreateTriggerCommand(string Phrase, Guid ActionId) : IRequest<TriggerResponse>;
public record UpdateTriggerCommand(Guid Id, string Phrase, Guid ActionId) : IRequest<TriggerResponse>;
public record DeleteTriggerCommand(Guid Id) : IRequest;

public class CreateTriggerCommandHandler : IRequestHandler<CreateTriggerCommand, TriggerResponse>
{
    private readonly ITriggerRepository _triggerRepository;
    private readonly ICurrentUserService _currentUserService;

    public CreateTriggerCommandHandler(ITriggerRepository triggerRepository, ICurrentUserService currentUserService)
    {
        _triggerRepository = triggerRepository;
        _currentUserService = currentUserService;
    }

    public async Task<TriggerResponse> Handle(CreateTriggerCommand request, CancellationToken cancellationToken)
    {
        var trigger = new Trigger
        {
            UserId = _currentUserService.UserId,
            Phrase = request.Phrase,
            ActionId = request.ActionId
        };

        await _triggerRepository.AddAsync(trigger, cancellationToken);

        var created = await _triggerRepository.GetByIdWithActionAsync(trigger.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Trigger), trigger.Id);

        return new TriggerResponse(
            created.Id,
            created.Phrase,
            created.ActionId,
            created.Action.ActionType.ToString(),
            created.CreatedAt,
            created.UpdatedAt);
    }
}

public class UpdateTriggerCommandHandler : IRequestHandler<UpdateTriggerCommand, TriggerResponse>
{
    private readonly ITriggerRepository _triggerRepository;

    public UpdateTriggerCommandHandler(ITriggerRepository triggerRepository)
    {
        _triggerRepository = triggerRepository;
    }

    public async Task<TriggerResponse> Handle(UpdateTriggerCommand request, CancellationToken cancellationToken)
    {
        var trigger = await _triggerRepository.GetByIdAsync(request.Id, cancellationToken);
        if (trigger is null)
        {
            throw new NotFoundException(nameof(Trigger), request.Id);
        }

        trigger.Phrase = request.Phrase;
        trigger.ActionId = request.ActionId;
        await _triggerRepository.UpdateAsync(trigger, cancellationToken);

        var updated = await _triggerRepository.GetByIdWithActionAsync(trigger.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Trigger), trigger.Id);

        return new TriggerResponse(
            updated.Id,
            updated.Phrase,
            updated.ActionId,
            updated.Action.ActionType.ToString(),
            updated.CreatedAt,
            updated.UpdatedAt);
    }
}

public class DeleteTriggerCommandHandler : IRequestHandler<DeleteTriggerCommand>
{
    private readonly ITriggerRepository _triggerRepository;

    public DeleteTriggerCommandHandler(ITriggerRepository triggerRepository)
    {
        _triggerRepository = triggerRepository;
    }

    public async Task Handle(DeleteTriggerCommand request, CancellationToken cancellationToken)
    {
        var trigger = await _triggerRepository.GetByIdAsync(request.Id, cancellationToken);
        if (trigger is null)
        {
            throw new NotFoundException(nameof(Trigger), request.Id);
        }

        await _triggerRepository.DeleteAsync(trigger, cancellationToken);
    }
}

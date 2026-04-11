using Mapi.Application.Common.Interfaces;
using Mapi.Application.Triggers.DTOs;
using Mapi.Domain.Entities;
using Mapi.Domain.Exceptions;
using Mapi.Domain.Interfaces;
using MediatR;

namespace Mapi.Application.Triggers.Commands;

public record CreateTriggerCommand(string Phrase) : IRequest<TriggerResponse>;
public record UpdateTriggerCommand(Guid Id, string Phrase) : IRequest<TriggerResponse>;
public record DeleteTriggerCommand(Guid Id) : IRequest;
public record LinkActionCommand(Guid TriggerId, Guid ActionId, int SortOrder) : IRequest;
public record UnlinkActionCommand(Guid TriggerId, Guid ActionId) : IRequest;

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
            Phrase = request.Phrase
        };

        await _triggerRepository.AddAsync(trigger, cancellationToken);

        return new TriggerResponse(trigger.Id, trigger.Phrase, trigger.CreatedAt, trigger.UpdatedAt, []);
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
        await _triggerRepository.UpdateAsync(trigger, cancellationToken);

        return new TriggerResponse(trigger.Id, trigger.Phrase, trigger.CreatedAt, trigger.UpdatedAt, []);
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

public class LinkActionCommandHandler : IRequestHandler<LinkActionCommand>
{
    private readonly ITriggerRepository _triggerRepository;
    private readonly ITriggerActionMapRepository _triggerActionMapRepository;

    public LinkActionCommandHandler(
        ITriggerRepository triggerRepository,
        ITriggerActionMapRepository triggerActionMapRepository)
    {
        _triggerRepository = triggerRepository;
        _triggerActionMapRepository = triggerActionMapRepository;
    }

    public async Task Handle(LinkActionCommand request, CancellationToken cancellationToken)
    {
        var trigger = await _triggerRepository.GetByIdAsync(request.TriggerId, cancellationToken);
        if (trigger is null)
        {
            throw new NotFoundException(nameof(Trigger), request.TriggerId);
        }

        var map = new TriggerActionMap
        {
            TriggerId = request.TriggerId,
            ActionId = request.ActionId,
            SortOrder = request.SortOrder
        };

        await _triggerActionMapRepository.AddAsync(map, cancellationToken);
    }
}

public class UnlinkActionCommandHandler : IRequestHandler<UnlinkActionCommand>
{
    private readonly ITriggerActionMapRepository _triggerActionMapRepository;

    public UnlinkActionCommandHandler(ITriggerActionMapRepository triggerActionMapRepository)
    {
        _triggerActionMapRepository = triggerActionMapRepository;
    }

    public async Task Handle(UnlinkActionCommand request, CancellationToken cancellationToken)
    {
        await _triggerActionMapRepository.DeleteByTriggerAndActionAsync(
            request.TriggerId,
            request.ActionId,
            cancellationToken);
    }
}

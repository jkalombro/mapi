using Mapi.Application.Common.Interfaces;
using Mapi.Application.Voice.DTOs;
using MediatR;

namespace Mapi.Application.Voice.Commands;

public record ConfirmVoiceAddCommand(string ItemName, decimal Price) : IRequest<VoiceCommandResult>;

public class ConfirmVoiceAddCommandHandler : IRequestHandler<ConfirmVoiceAddCommand, VoiceCommandResult>
{
    private readonly ICommandService _commandService;
    private readonly ICurrentUserService _currentUserService;

    public ConfirmVoiceAddCommandHandler(ICommandService commandService, ICurrentUserService currentUserService)
    {
        _commandService = commandService;
        _currentUserService = currentUserService;
    }

    public async Task<VoiceCommandResult> Handle(ConfirmVoiceAddCommand request, CancellationToken cancellationToken)
    {
        return await _commandService.ConfirmAddAsync(request.ItemName, request.Price, _currentUserService.UserId, cancellationToken);
    }
}

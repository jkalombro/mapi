using Mapi.Application.Common.Interfaces;
using Mapi.Application.Voice.DTOs;
using MediatR;

namespace Mapi.Application.Voice.Commands;

public record ProcessVoiceCommand(string Transcript, string? PendingIntent, string? PendingItemName) : IRequest<VoiceCommandResult>;

public class ProcessVoiceCommandHandler : IRequestHandler<ProcessVoiceCommand, VoiceCommandResult>
{
    private readonly ICommandService _commandService;
    private readonly ICurrentUserService _currentUserService;

    public ProcessVoiceCommandHandler(ICommandService commandService, ICurrentUserService currentUserService)
    {
        _commandService = commandService;
        _currentUserService = currentUserService;
    }

    public async Task<VoiceCommandResult> Handle(ProcessVoiceCommand request, CancellationToken cancellationToken)
    {
        return await _commandService.ExecuteAsync(
            request.Transcript,
            _currentUserService.UserId,
            request.PendingIntent,
            request.PendingItemName,
            cancellationToken);
    }
}

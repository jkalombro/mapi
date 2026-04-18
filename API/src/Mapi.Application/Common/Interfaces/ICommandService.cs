using Mapi.Application.Voice.DTOs;

namespace Mapi.Application.Common.Interfaces;

public interface ICommandService
{
    Task<VoiceCommandResult> ExecuteAsync(
        string transcript,
        Guid userId,
        string? pendingIntent = null,
        string? pendingItemName = null,
        CancellationToken cancellationToken = default);
}

using Mapi.Application.Voice.DTOs;

namespace Mapi.Application.Common.Interfaces;

public interface ICommandService
{
    Task<VoiceCommandResult> ExecuteAsync(string transcript, Guid userId, CancellationToken cancellationToken = default);
    Task<VoiceCommandResult> ConfirmAddAsync(string itemName, decimal price, Guid userId, CancellationToken cancellationToken = default);
}

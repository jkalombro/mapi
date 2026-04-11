namespace Mapi.Application.Voice.DTOs;

public record VoiceCommandResult(
    string ResponseText,
    bool IsAmbiguous = false,
    bool IsConfirmationRequired = false,
    IReadOnlyList<string>? MatchedNames = null
);

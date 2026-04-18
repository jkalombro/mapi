namespace Mapi.Application.Voice.DTOs;

public record VoiceCommandRequest(string Transcript, string? PendingIntent = null, string? PendingItemName = null);

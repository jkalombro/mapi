export interface VoiceCommandResult {
  responseText: string;
  isAmbiguous: boolean;
  isConfirmationRequired: boolean;
  matchedNames: string[] | null;
  itemsModified: boolean;
  pendingIntent: string | null;
  pendingItemName: string | null;
}

export interface VoiceState {
  isListening: boolean;
  transcript: string | null;
  commandResult: VoiceCommandResult | null;
  isProcessing: boolean;
  error: string | null;
  pendingIntent: string | null;
  pendingItemName: string | null;
}

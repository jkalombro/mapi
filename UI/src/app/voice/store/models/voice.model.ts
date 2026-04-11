export interface VoiceCommandResult {
  responseText: string;
  isAmbiguous: boolean;
  isConfirmationRequired: boolean;
  matchedNames: string[] | null;
}

export interface VoiceState {
  isListening: boolean;
  transcript: string | null;
  commandResult: VoiceCommandResult | null;
  isProcessing: boolean;
  error: string | null;
}

export interface ConfirmAddRequest {
  itemName: string;
  price: number;
}

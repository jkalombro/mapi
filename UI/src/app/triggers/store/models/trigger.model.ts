export interface Trigger {
  id: string;
  phrase: string;
  actionId: string;
  actionType: string;
  createdAt: string;
  updatedAt: string;
}

export interface TriggerRequest {
  phrase: string;
  actionId: string;
}

export interface UpdateTriggerRequest {
  phrase: string;
  actionId: string;
}

export interface TriggersState {
  triggers: Trigger[];
  isLoading: boolean;
  error: string | null;
  selectedTrigger: Trigger | null;
}

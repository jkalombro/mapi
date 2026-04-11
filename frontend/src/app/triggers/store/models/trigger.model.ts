export interface TriggerAction {
  actionId: string;
  actionType: string;
  responseTemplate: string;
  sortOrder: number;
}

export interface Trigger {
  id: string;
  phrase: string;
  createdAt: string;
  updatedAt: string;
  actions: TriggerAction[];
}

export interface TriggerRequest {
  phrase: string;
}

export interface ActionLinkRequest {
  actionId: string;
  sortOrder: number;
}

export interface TriggersState {
  triggers: Trigger[];
  isLoading: boolean;
  error: string | null;
}

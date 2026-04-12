export interface Action {
  id: string;
  actionType: string;
  responseTemplate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateActionRequest {
  actionType: string;
  responseTemplate: string;
}

export interface UpdateActionRequest {
  responseTemplate: string;
}

export interface ActionsState {
  actions: Action[];
  isLoading: boolean;
  error: string | null;
  selectedAction: Action | null;
}

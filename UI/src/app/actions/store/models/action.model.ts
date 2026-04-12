export interface Action {
  id: string;
  actionType: string;
  responseTemplate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActionsState {
  actions: Action[];
  isLoading: boolean;
  error: string | null;
}

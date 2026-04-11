export interface Item {
  id: string;
  itemName: string;
  bisayaName: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface ItemRequest {
  itemName: string;
  bisayaName: string;
  price: number;
}

export interface ItemsState {
  items: Item[];
  isLoading: boolean;
  error: string | null;
  selectedItem: Item | null;
}

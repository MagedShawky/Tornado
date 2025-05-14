
export interface Rental {
  id?: string;
  bookingId?: string;
  bedNumber?: number | null;
  equipmentType: string;
  size: string;
  brand: string;
  quantity: number;
  rentPeriodDays: number;
  pricePerUnit: number;
  totalPrice: number;
  status: string;
  notes: string;
}

export interface SaveResult {
  success: boolean;
  error?: string;
}

export interface RentalsHookState {
  rentalItems: Rental[];
  isLoading: boolean;
  handleRentalChange: (index: number, field: keyof Rental, value: any) => void;
  handleAddRental: () => void;
  handleRemoveRental: (index: number) => void;
  handleSave: () => Promise<SaveResult>;
}

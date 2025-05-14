
export interface TourismService {
  id?: string;
  bookingId?: string;
  bedNumber?: number | null;
  serviceType: string;
  serviceName: string;
  serviceDate: Date | null;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  status: string;
  notes: string;
}

export interface SaveResult {
  success: boolean;
  error?: string;
}

export interface TourismServicesHookState {
  services: TourismService[];
  isLoading: boolean;
  handleServiceChange: (index: number, field: keyof TourismService, value: any) => void;
  handleAddService: () => void;
  handleRemoveService: (index: number) => void;
  handleSave: () => Promise<SaveResult>;
}

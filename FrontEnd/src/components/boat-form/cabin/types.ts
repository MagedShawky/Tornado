export type CabinType = 'twin_beds' | 'twin_beds_bunk' | 'suite_double';

export interface CabinConfig {
  id?: string;
  deck: string;
  cabinNumber: string;
  type: CabinType;
  bedCount: number;
  bedNumbers: string[];
  basePrice: number;
}
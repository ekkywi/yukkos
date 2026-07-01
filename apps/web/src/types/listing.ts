export type ListingStatus = 'AVAILABLE' | 'FEW_LEFT' | 'FULL';

export interface WebListingResponseDto {
  id: string;
  name: string;
  city: string;
  fullAddress: string;
  monthlyPrice: number;
  description: string;
  status: ListingStatus;
  facilities: string[];
}
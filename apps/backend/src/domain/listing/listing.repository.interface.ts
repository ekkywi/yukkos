import { Listing } from '@prisma/client'; 

export const LISTING_REPOSITORY = Symbol('LISTING_REPOSITORY');

export type ListingDetail = Listing & {
  facilities: {
    facility: {
      id: number;
      name: string;
    };
  }[];
};

export interface IListingRepository {
  findAllActive(): Promise<Listing[]>;
  findById(id: string): Promise<ListingDetail | null>;
}
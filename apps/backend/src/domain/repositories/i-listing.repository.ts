import { ListingEntity } from "../entities/listing.entity";

export const I_LISTING_REPOSITORY = 'IListngRepository';

export type CreateListingPayload = Omit<ListingEntity, 'id' | 'createdAt' | 'updatedAt' | 'facilities'> & {
  facilityIds?: number[];
};

export type UpdateListingPayload = Partial<CreateListingPayload>;

export interface IListingRepository {
    create(data: CreateListingPayload): Promise<ListingEntity>;
    update(id: string, providerId: string, data: UpdateListingPayload): Promise<ListingEntity>;
    delete(id: string, providerId: string): Promise<boolean>;

    findAllByProviderId(providerId: string): Promise<ListingEntity[]>;
    findByIdAndProviderId(id: string, providerId: string): Promise<ListingEntity | null>;

    findAllActive(): Promise<ListingEntity[]>;
    findById(id: string): Promise<ListingEntity | null>;
}
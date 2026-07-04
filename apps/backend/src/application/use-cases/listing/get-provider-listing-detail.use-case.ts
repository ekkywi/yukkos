import { Injectable, Inject } from '@nestjs/common';
import { I_LISTING_REPOSITORY } from '../../../domain/repositories/i-listing.repository';
import type { IListingRepository } from '../../../domain/repositories/i-listing.repository';
import { ListingEntity } from '../../../domain/entities/listing.entity';
import { ListingNotFoundError } from '../../../domain/exceptions/database.exception';

@Injectable()
export class GetProviderListingDetailUseCase {
    constructor(
        @Inject(I_LISTING_REPOSITORY)
        private readonly listingRepository: IListingRepository,
    ) {}

    async execute(id: string, providerId: string): Promise<ListingEntity> {
        const listing = await this.listingRepository.findByIdAndProviderId(id, providerId);

        if (!listing) {
            throw new ListingNotFoundError(`Data kos tidak ditemukan atau Anda tidak memiliki akses.`);
        }

        return listing;
    }
}
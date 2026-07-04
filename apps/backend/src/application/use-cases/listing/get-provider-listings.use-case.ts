import { Injectable, Inject } from '@nestjs/common';
import { I_LISTING_REPOSITORY } from '../../../domain/repositories/i-listing.repository';
import type { IListingRepository } from '../../../domain/repositories/i-listing.repository';
import { ProviderListingResponseDto } from '../../dtos/listing/provider-listing-response.dto';

@Injectable()
export class GetProviderListingsUseCase {
    constructor(
        @Inject(I_LISTING_REPOSITORY)
        private readonly listingRepository: IListingRepository,
    ) {}

    async execute(providerId: string): Promise<ProviderListingResponseDto[]> {
        const listings = await this.listingRepository.findAllByProviderId(providerId);

        return listings.map((listing) => ({
            id: listing.id,
            name: listing.name,
            city: listing.city,
            monthlyPrice: listing.monthlyPrice,
            status: listing.status,
            createdAt: listing.createdAt!,
        }));
    }
}
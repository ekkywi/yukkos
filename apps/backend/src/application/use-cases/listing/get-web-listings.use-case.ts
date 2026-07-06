import { Injectable, Inject } from '@nestjs/common';
import { I_LISTING_REPOSITORY } from '../../../domain/repositories/i-listing.repository';
import type { IListingRepository } from '../../../domain/repositories/i-listing.repository';
import { WebListingResponseDto } from '../../dtos/listing/web-listing-response.dto';

@Injectable()
export class GetWebListingsUseCase {
    constructor(
        @Inject(I_LISTING_REPOSITORY)
        private readonly listingRepository: IListingRepository,
    ) {}

    async execute(): Promise<WebListingResponseDto[]> {
        const listings = await this.listingRepository.findAllActive();

        return listings.map((listing) => ({
            id: listing.id,
            name: listing.name,
            providerName: listing.providerName ?? '',
            city: listing.city,
            monthlyPrice: listing.monthlyPrice,
            shortDescription: listing.description.substring(0, 50) + '...',
            status: listing.status,
            mainImage: listing.mainImage,
        }));
    }
}

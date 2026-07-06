import { Injectable, Inject } from '@nestjs/common';
import { I_LISTING_REPOSITORY } from '../../../domain/repositories/i-listing.repository';
import type { IListingRepository } from '../../../domain/repositories/i-listing.repository';
import { WebListingDetailResponseDto } from '../../dtos/listing/web-listing-detail-response.dto';
import { ListingNotFoundError } from '../../../domain/exceptions/database.exception';

@Injectable()
export class GetWebListingDetailUseCase {
    constructor(
        @Inject(I_LISTING_REPOSITORY)
        private readonly listingRepository: IListingRepository,
    ) {}

    async execute(id: string): Promise<WebListingDetailResponseDto> {
        const listing = await this.listingRepository.findById(id);

        if (!listing) {
            throw new ListingNotFoundError(`Hunian dengan ID ${id} tidak ditemukan.`);
        }

        return {
            id: listing.id,
            providerId: listing.providerId,
            name: listing.name,
            providerName: listing.providerName ?? '',
            city: listing.city,
            fullAddress: listing.fullAddress,
            monthlyPrice: listing.monthlyPrice,
            description: listing.description,
            status: listing.status,
            mainImage: listing.mainImage,
            images: listing.images || [],
            facilities: listing.facilities || [],
        };
    }
}

import { Injectable, Inject } from '@nestjs/common';
import { I_LISTING_REPOSITORY } from '../../../domain/repositories/i-listing.repository';
import type { IListingRepository } from '../../../domain/repositories/i-listing.repository';
import { MobileListingDetailResponseDto } from '../../dtos/listing/mobile-listing-detail-response.dto';
import { ListingNotFoundError } from '../../../domain/exceptions/database.exception';

@Injectable()
export class GetMobileListingDetailUseCase {
    constructor(
        @Inject(I_LISTING_REPOSITORY)
        private readonly listingRepository: IListingRepository
    ) {}

    async execute(id: string): Promise<MobileListingDetailResponseDto> {
        const listing = await this.listingRepository.findById(id);

        if (!listing) {
            throw new ListingNotFoundError(`Data hunian dengan ID ${id} tidak ditemukan.`);
        }

        return {
            id: listing.id,
            name: listing.name,
            city: listing.city,
            fullAddress: listing.fullAddress,
            monthlyPrice: listing.monthlyPrice,
            description: listing.description,
            status: listing.status,
            facilities: listing.facilities || [],
            mainImage: listing.mainImage,
            images: listing.images || [],
        };
    }
}

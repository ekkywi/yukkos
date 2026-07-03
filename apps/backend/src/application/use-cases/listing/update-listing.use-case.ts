import { Injectable, Inject } from '@nestjs/common';
import { I_LISTING_REPOSITORY } from '../../../domain/repositories/i-listing.repository';
import type { IListingRepository } from '../../../domain/repositories/i-listing.repository';
import { UpdateListingDto } from '../../dtos/listing/update-listing.dto';
import { ListingEntity } from '../../../domain/entities/listing.entity';

@Injectable()
export class UpdateListingUseCase {
    constructor(
        @Inject(I_LISTING_REPOSITORY)
        private readonly listingRepository: IListingRepository,
    ) {}

    async execute(id: string, providerId: string, dto: UpdateListingDto): Promise<ListingEntity> {
        return this.listingRepository.update(id, providerId, dto);
    }
}
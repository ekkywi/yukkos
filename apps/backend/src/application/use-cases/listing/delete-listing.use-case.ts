import { Injectable, Inject } from '@nestjs/common';
import { I_LISTING_REPOSITORY } from '../../../domain/repositories/i-listing.repository';
import type { IListingRepository } from '../../../domain/repositories/i-listing.repository';

@Injectable()
export class DeleteListingUseCase {
    constructor(
        @Inject(I_LISTING_REPOSITORY)
        private readonly listingRepository: IListingRepository,
    ) {}

    async execute(id: string, providerId: string): Promise<boolean> {
        return this.listingRepository.delete(id, providerId);
    }
}
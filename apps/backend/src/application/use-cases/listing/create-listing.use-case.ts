import { Injectable, Inject } from '@nestjs/common';
import { I_LISTING_REPOSITORY } from '../../../domain/repositories/i-listing.repository';
import type { IListingRepository } from '../../../domain/repositories/i-listing.repository';
import { CreateListingDto } from '../../dtos/listing/create-listing.dto';
import { ListingEntity, StatusListing } from '../../../domain/entities/listing.entity';

@Injectable()
export class CreateListingUseCase {
  constructor(
    @Inject(I_LISTING_REPOSITORY)
    private readonly listingRepository: IListingRepository,
  ) {}

  async execute(dto: CreateListingDto, providerId: string): Promise<ListingEntity> {
    return this.listingRepository.create({
      providerId,
      name: dto.name,
      city: dto.city,
      fullAddress: dto.fullAddress,
      monthlyPrice: dto.monthlyPrice,
      description: dto.description,
      status: dto.status || StatusListing.AVAILABLE,
      facilityIds: dto.facilityIds || [],
    });
  }
}

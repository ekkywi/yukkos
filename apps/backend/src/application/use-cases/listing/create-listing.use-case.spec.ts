import { CreateListingUseCase } from './create-listing.use-case';
import type { IListingRepository } from '../../../domain/repositories/i-listing.repository';
import { StatusListing, TypeListing, ListingEntity } from '../../../domain/entities/listing.entity';
import { CreateListingDto } from '../../dtos/listing/create-listing.dto';

describe('CreateListingUseCase', () => {
  it('passes images and mainImage to the repository', async () => {
    const create = jest.fn().mockResolvedValue(
      new ListingEntity(
        'listing-1',
        'provider-1',
        'Hunian Kenanga',
        'Bandung',
        'Jl. Kenanga No. 12',
        850000,
        'Hunian nyaman dekat kampus.',
        TypeListing.MIXED,
        StatusListing.AVAILABLE,
        ['WiFi'],
        ['https://example.com/image-1.jpg', 'https://example.com/image-2.jpg'],
        'https://example.com/image-1.jpg',
        'Provider A',
        new Date('2026-01-01T00:00:00.000Z'),
        new Date('2026-01-02T00:00:00.000Z'),
      ),
    );

    const repository = { create } as Pick<IListingRepository, 'create'>;
    const useCase = new CreateListingUseCase(repository as IListingRepository);
    const dto: CreateListingDto = {
      name: 'Hunian Kenanga',
      city: 'Bandung',
      fullAddress: 'Jl. Kenanga No. 12',
      monthlyPrice: 850000,
      description: 'Hunian nyaman dekat kampus.',
      type: TypeListing.MIXED,
      images: ['https://example.com/image-1.jpg', 'https://example.com/image-2.jpg'],
      mainImage: 'https://example.com/image-1.jpg',
      facilityIds: [1],
    };

    await useCase.execute('provider-1', dto);

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        providerId: 'provider-1',
        images: ['https://example.com/image-1.jpg', 'https://example.com/image-2.jpg'],
        mainImage: 'https://example.com/image-1.jpg',
      }),
    );
  });
});

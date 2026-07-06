import { GetProviderListingsUseCase } from './get-provider-listings.use-case';
import type { IListingRepository } from '../../../domain/repositories/i-listing.repository';
import { ListingEntity, StatusListing, TypeListing } from '../../../domain/entities/listing.entity';

describe('GetProviderListingsUseCase', () => {
  it('keeps facilities in the provider listing response', async () => {
    const repository: Pick<IListingRepository, 'findAllByProviderId'> = {
      findAllByProviderId: jest.fn().mockResolvedValue([
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
          ['WiFi', 'Parkir Motor', 'Laundry'],
          ['https://example.com/image-1.jpg', 'https://example.com/image-2.jpg'],
          'https://example.com/image.jpg',
          'Provider A',
          new Date('2026-01-01T00:00:00.000Z'),
          new Date('2026-01-02T00:00:00.000Z'),
        ),
      ]),
    };

    const useCase = new GetProviderListingsUseCase(repository as IListingRepository);

    const result = await useCase.execute('provider-1');

    expect(result).toEqual([
      expect.objectContaining({
        id: 'listing-1',
        description: 'Hunian nyaman dekat kampus.',
        facilities: ['WiFi', 'Parkir Motor', 'Laundry'],
        images: ['https://example.com/image-1.jpg', 'https://example.com/image-2.jpg'],
        mainImage: 'https://example.com/image.jpg',
      }),
    ]);
  });
});

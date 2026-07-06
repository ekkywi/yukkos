import { GetMobileListingDetailUseCase } from './get-mobile-listing-detail.use-case';
import type { IListingRepository } from '../../../domain/repositories/i-listing.repository';
import { ListingEntity, StatusListing, TypeListing } from '../../../domain/entities/listing.entity';

describe('GetMobileListingDetailUseCase', () => {
  it('returns images for the mobile detail response', async () => {
    const repository: Pick<IListingRepository, 'findById'> = {
      findById: jest.fn().mockResolvedValue(
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
      ),
    };

    const useCase = new GetMobileListingDetailUseCase(repository as IListingRepository);
    const result = await useCase.execute('listing-1');

    expect(result.images).toEqual(['https://example.com/image-1.jpg', 'https://example.com/image-2.jpg']);
    expect(result.mainImage).toBe('https://example.com/image-1.jpg');
  });
});

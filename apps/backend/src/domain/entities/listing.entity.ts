export enum StatusListing {
    AVAILABLE = 'AVAILABLE',
    FEW_LEFT = 'FEW_LEFT',
    FULL = 'FULL',
}

export class ListingEntity {
  constructor(
    public readonly id: string,
    public readonly providerId: string,
    public readonly name: string,
    public readonly city: string,
    public readonly fullAddress: string,
    public readonly monthlyPrice: number,
    public readonly description: string,
    public readonly status: StatusListing,
    public readonly facilities: string[],
    public readonly mainImage: string | null,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}

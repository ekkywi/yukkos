export enum BookingStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export class BookingEntity {
  constructor(
    public readonly id: string,
    public readonly listingId: string,
    public readonly tenantId: string,
    public readonly status: BookingStatus,
    public readonly checkInDate: Date,
    public readonly durationMonths: number,
    public readonly totalPrice: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
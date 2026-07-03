export enum StatusListing {
    AVAILABLE = 'AVAILABLE',
    FEW_LEFT = 'FEW_LEFT',
    FULL = 'FULL',
}

export class ListingEntity {
    constructor(
        public readonly id: string,
        public providerId: string,
        public name: string,
        public city: string,
        public fullAddress: string,
        public monthlyPrice: number,
        public description: string,
        public status: StatusListing,
        public facilities?: string[], 
        public readonly createdAt?: Date,
        public readonly updatedAt?: Date,
    ) {}
}

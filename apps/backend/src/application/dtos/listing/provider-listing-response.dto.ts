export class ProviderListingResponseDto {
    id!: string;
    name!: string;
    city!: string;
    description!: string;
    monthlyPrice!: number;
    status!: string;
    createdAt!: Date;
    images!: string[];
    mainImage!: string | null;
    facilities!: string[];
}

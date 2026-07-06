export class WebListingDetailResponseDto {
    id!: string;
    providerId!: string;
    name!: string;
    providerName!: string;
    city!: string;
    fullAddress!: string;
    monthlyPrice!: number;
    description!: string;
    status!: string;
    mainImage!: string | null;
    facilities!: string[];
}

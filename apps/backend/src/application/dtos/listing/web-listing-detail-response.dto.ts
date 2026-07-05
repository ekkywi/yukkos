export class WebListingDetailResponseDto {
    id!: string;
    providerId!: string;
    name!: string;
    city!: string;
    fullAddress!: string;
    monthlyPrice!: number;
    descrption!: string;
    status!: string;
    mainImage!: string | null;
    facilities!: string[];
}
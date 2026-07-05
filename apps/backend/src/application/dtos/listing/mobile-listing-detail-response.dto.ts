export class MobileListingDetailResponseDto {
    id!: string;
    name!: string;
    city!: string;
    fullAddress!: string;
    monthlyPrice!: number;
    description!: string;
    status!: string;
    mainImage!: string | null;
    facilities!: string[];
}
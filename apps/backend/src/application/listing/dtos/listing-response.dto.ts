import { ApiProperty } from '@nestjs/swagger';

export enum StatusListingDto {
    AVAILABLE = 'AVAILABLE',
    FEW_LEFT = 'FEW_LEFT',
    FULL = 'FULL',
}

export class MobileListingResponseDto {
    @ApiProperty({ example: '123-abc-456' })
    id: string;

    @ApiProperty({ example: 'Kos Bintang Terang' })
    name: string;

    @ApiProperty({ example: 'Semarang' })
    city: string;

    @ApiProperty({ example: 850000})
    monthlyPrice: number;

    @ApiProperty({ enum: StatusListingDto, example: StatusListingDto.AVAILABLE })
    status: StatusListingDto;
}

export class WebListingResponseDto {
    @ApiProperty({ example: '123-abc-456' })
    id: string;

    @ApiProperty({ example: 'Kos Bintang Terang' })
    name: string;

    @ApiProperty({ example: 'Semarang' })
    city: string;

    @ApiProperty({ example: 'Jl. Tlogosari Raya No.15, Pedurungan' })
    fullAddress: string;

    @ApiProperty({ example: 850000})
    monthlyPrice: number;

    @ApiProperty({ example: 'Kos nyaman dengan sirkulasi udara baik.' })
    description: string;

    @ApiProperty({ enum: StatusListingDto, example: StatusListingDto.AVAILABLE })
    status: StatusListingDto;

    @ApiProperty({ type: [String], example: ['WiFi', 'Kamar Mandi Dalam'] })
    facilities: string[];
}
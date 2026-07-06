import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetMobileListingsUseCase } from '../../application/use-cases/listing/get-mobile-listings.use-case';
import { GetMobileListingDetailUseCase } from '../../application/use-cases/listing/get-mobile-listing-detail.use-case';

@ApiTags('BFF Mobile - Katalog Hunian Ringkas')
@Controller('v1/mobile/listings')
export class MobileListingController {
    constructor(
        private readonly getMobileListingsUseCase: GetMobileListingsUseCase,
        private readonly getMobileListingDetailUseCase: GetMobileListingDetailUseCase,
    ) {}

    @Get()
    @ApiOperation({ summary: 'Mendapatkan daftar hunian berformat ringkas untuk Mobile' })
    @ApiResponse({ status: 200, description: 'Berhasil mengambil data ringkas' })
    async findAll() {
        const data = await this.getMobileListingsUseCase.execute();
        return { success: true, count: data.length, data };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Mendapatkan detail spesifik hunian untuk halaman mobile' })
    @ApiResponse({ status: 200, description: 'Berhasil mendapatkan detail hunian.' })
    @ApiResponse({ status: 404, description: 'Hunian tidak ditemukan.' })
    async findOne(@Param('id') id: string) {
        const data = await this.getMobileListingDetailUseCase.execute(id);
        return { success: true, data };
    }
}

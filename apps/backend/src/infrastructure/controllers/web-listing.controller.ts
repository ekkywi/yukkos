import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetWebListingDetailUseCase } from '../../application/use-cases/listing/get-web-listing-detail.use-case';
import { GetWebListingsUseCase } from '../../application/use-cases/listing/get-web-listings.use-case';

@ApiTags('BFF Web - Katalog Kos Detail')
@Controller('v1/web/listings')
export class WebListingController {
    constructor(
        private readonly getWebListingUseCase: GetWebListingsUseCase,
        private readonly getWebListingDetailUseCase: GetWebListingDetailUseCase,
    ) {}

    @Get()
    @ApiOperation({ summary: 'Mendapatkan daftar kos untuk beranda Web (dengan snippet)' })
    @ApiResponse({ status: 200, description: 'Berhasil mengambil daftar kos web.' })
    async findAll() {
        const data = await this.getWebListingUseCase.execute()
        return { execute: true, count: data.length, data };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Mendapatkan detail lengkap satu kos untuk halaman Web' })
    @ApiResponse({ status: 200, description: 'Berhasil mengambil detail kos.' })
    @ApiResponse({ status: 404, description: 'Kos tidak ditemukan.'})
    async findOne(@Param('id') id: string) {
        const data = await this.getWebListingDetailUseCase.execute(id);
        return { success: true, data };
    }
}
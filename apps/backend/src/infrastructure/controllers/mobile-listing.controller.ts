import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetMobileListingsUseCase } from '../../application/use-cases/listing/get-mobile-listings.use-case';

@ApiTags('BFF Mobile - Katalog Kos Ringkas')
@Controller('v1/mobile/listings')
export class MobileListingController {
    constructor(private readonly getMobileListingsUseCase: GetMobileListingsUseCase) {}

    @Get()
    @ApiOperation({ summary: 'Mendapatkan daftar kos berformat ringkas untuk Mobile' })
    @ApiResponse({ status: 200, description: 'Berhasil mengambil data ringkas' })
    async findAll() {
        const data = await this.getMobileListingsUseCase.execute();
        return { success: true, count: data.length, data };
    }
}
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MobileListingResponseDto, StatusListingDto } from '../../application/listing/dtos/listing-response.dto';
import { GetMobileListingsUseCase } from '../../application/listing/use-cases/get-mobile-listings.usecase';

@ApiTags('Mobile')
@Controller('v1/mobile/listings')
export class MobileListingController {

    constructor(private readonly getMobileListingsUseCase: GetMobileListingsUseCase) {}

    @Get()
    @ApiOperation({ summary: 'Mendapatkan daftar kos ringkas untuk tampilan Mobile '})
    @ApiResponse({ status: 200, description: 'Berhasil mengambil data', type: [MobileListingResponseDto] })
    async getMobileListings(): Promise<{ success: boolean, data: MobileListingResponseDto[] }> {

        const data = await this.getMobileListingsUseCase.execute();

        return { success: true, data };
    }
}
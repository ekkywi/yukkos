import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WebListingResponseDto } from '../../application/listing/dtos/listing-response.dto';
import { GetWebListingDetailUseCase } from '../../application/listing/use-cases/get-web-listing-detail.usecase';

@ApiTags('Web')
@Controller('v1/web/listings')
export class WebListingController {
  
  constructor(private readonly getWebListingDetailUseCase: GetWebListingDetailUseCase) {}

  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan detail kos secara lengkap untuk tampilan Web' })
  @ApiResponse({ status: 200, description: 'Berhasil mengambil detail data', type: WebListingResponseDto })
  async getWebListingDetail(@Param('id') id: string): Promise<{ success: boolean, data: WebListingResponseDto }> {
    
    const data = await this.getWebListingDetailUseCase.execute(id);

    return { success: true, data };
  }
}
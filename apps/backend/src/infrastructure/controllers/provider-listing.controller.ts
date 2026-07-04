import { Controller, Post, Put, Delete, Get, Body, Param, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CreateListingUseCase } from '../../application/use-cases/listing/create-listing.use-case';
import { UpdateListingUseCase } from '../../application/use-cases/listing/update-listing.use-case';
import { DeleteListingUseCase } from '../../application/use-cases/listing/delete-listing.use-case';
import { GetProviderListingsUseCase } from '../../application/use-cases/listing/get-provider-listings.use-case';
import { GetProviderListingDetailUseCase } from '../../application/use-cases/listing/get-provider-listing-detail.use-case';
import { CreateListingDto } from '../../application/dtos/listing/create-listing.dto';
import { UpdateListingDto } from '../../application/dtos/listing/update-listing.dto';
import { JwtAuthGuard } from '../security/jwt-auth.guard';
import { RolesGuard } from '../security/roles.guard';
import { Roles } from '../security/roles.decorator';

@ApiTags('Provider - Manajemen Kos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PROVIDER')
@Controller('v1/provider/listings')
export class ProviderListingController {
    constructor(
        private readonly createListingUseCase: CreateListingUseCase,
        private readonly updateListingUseCase: UpdateListingUseCase,
        private readonly deleteListingUseCase: DeleteListingUseCase,
        private readonly getProviderListingsUseCase: GetProviderListingsUseCase,
        private readonly getProviderListingDetailUseCase: GetProviderListingDetailUseCase,
    ) {}

    @Get()
    @ApiOperation({ summary: 'Mendapatkan seluruh daftar kos milik Provider (Dasbor)' })
    @ApiResponse({ status: 200, description: 'Berhasil mengambil daftar inventaris.' })
    async findAllMyListings(@Request() req: any) {
        const providerId = req.user?.sub;
        if (!providerId) throw new BadRequestException('Provider tidak terautentikasi');

        const data = await this.getProviderListingsUseCase.execute(providerId);
        return { success: true, count: data.length, data };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Mendapatkan detail spesifik kos milik Provider (Untuk Form Edit)' })
    @ApiResponse({ status: 200, description: 'Berhasil mengambil detail kos.' })
    async findOneMyListing(@Param('id') id: string, @Request() req: any) {
        const providerId = req.user?.sub;
        if (!providerId) throw new BadRequestException('Provider tidak terautentikasi');

        const data = await this.getProviderListingDetailUseCase.execute(id, providerId);
        return { success: true, data };
    }

    @Post()
    @ApiOperation({ summary: 'Menambah data kos baru beserta fasilitasnya' })
    @ApiResponse({ status: 201, description: 'Data kos berhasil dibuat.' })
    @ApiResponse({ status: 403, description: 'Akses ditolak (Bukan Provider).' })
    async create(@Body() dto: CreateListingDto, @Request() req: any) {
        const providerId = req.user?.sub;

        if (!providerId) {
            throw new BadRequestException('Provider tidak terautentikasi');
        }

        const data = await this.createListingUseCase.execute(dto, providerId);
        return { success: true, data };
    }

    @Put(':id')
    @ApiOperation({ summary: 'Memperbarui data kos (hanya properti milik sendiri)' })
    @ApiResponse({ status:200, description: 'Data kos berhasil diperbarui.' })
    async update(@Param('id') id: string, @Body() dto: UpdateListingDto, @Request() req: any) {
        const providerId = req.user?.sub;
        if(!providerId) throw new BadRequestException('Provider tidak terautentikasi');

        const data = await this.updateListingUseCase.execute(id, providerId, dto);
        return { success: true, data };
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Menghapus data kos secara permanen' })
    @ApiResponse({ status: 200, description: 'Data kos berhasil dihapus.' })
    async remove(@Param('id') id: string, @Request() req: any) {
        const providerId = req.user?.sub;
        if (!providerId) throw new BadRequestException('Provider tidak terautentikasi');

        await this.deleteListingUseCase.execute(id, providerId);
        return { success: true, message: 'Data kos berhasil dihapus.'}
    }
}

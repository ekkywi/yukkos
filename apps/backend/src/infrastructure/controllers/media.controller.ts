import { 
  Controller, 
  Post, 
  UseInterceptors, 
  UploadedFile, 
  Inject, 
  UseGuards,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { I_STORAGE_SERVICE } from '../../application/ports/i-storage.service';
import type { IStorageService } from '../../application/ports/i-storage.service';
import { JwtAuthGuard } from '../security/jwt-auth.guard';

@ApiTags('Media - Pengunggahan Berkas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/media')
export class MediaController {
  constructor(
    @Inject(I_STORAGE_SERVICE)
    private readonly storageService: IStorageService,
  ) {}

  @Post('upload')
  @ApiOperation({ summary: 'Mengunggah foto kos ke Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({ status: 201, description: 'Gambar berhasil diunggah.' })
  @ApiResponse({ status: 400, description: 'Berkas tidak disertakan atau format salah.' })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Harap sertakan berkas gambar yang valid.');
    }

    const imageUrl = await this.storageService.uploadImage(file);

    return {
      success: true,
      data: {
        url: imageUrl,
      },
    };
  }
}
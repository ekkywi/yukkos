import { Module } from '@nestjs/common';
import { FacilityController } from '../controllers/facility.controller';
import { PrismaService } from '../database/prisma/prisma.service';

@Module({
  controllers: [FacilityController],
  providers: [PrismaService],
})
export class FacilityModule {}

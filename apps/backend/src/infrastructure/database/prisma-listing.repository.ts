import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { IListingRepository, ListingDetail } from '../../domain/listing/listing.repository.interface';
import { Listing } from '@prisma/client';

@Injectable()
export class PrismaListingRepository implements IListingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllActive(): Promise<Listing[]> {
    return this.prisma.listing.findMany({
      where: {
        status: {
          not: 'FULL',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string): Promise<ListingDetail | null> {
    return this.prisma.listing.findUnique({
      where: { id },
      include: {
        facilities: {
          include: { facility: true },
        },
      },
    });
  }
}
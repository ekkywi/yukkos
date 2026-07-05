import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Facility, Prisma, StatusListing as PrismaStatusListing } from '@prisma/client';
import { IListingRepository, CreateListingPayload } from '../../../domain/repositories/i-listing.repository';
import { UpdateListingPayload } from '../../../domain/repositories/i-listing.repository';
import { ListingEntity, StatusListing } from '../../../domain/entities/listing.entity';
import { PrismaService } from './prisma.service';
import { RelationalConstraintError, DatabaseOperationError, ListingNotFoundError } from '../../../domain/exceptions/database.exception';

@Injectable()
export class PrismaListingRepository implements IListingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateListingPayload): Promise<ListingEntity> {
    try {
      const model = await this.prisma.listing.create({
        data: {
          providerId: data.providerId,
          name: data.name,
          city: data.city,
          fullAddress: data.fullAddress,
          monthlyPrice: data.monthlyPrice,
          description: data.description,
          status: data.status as PrismaStatusListing,
          mainImage: data.mainImage,
          facilities: {
            create: data.facilityIds?.map(facilityId => ({
              facility: { connect: { id: facilityId } }
            })) || []
          }
        },
        include: {
          facilities: {
            include: {
              facility: true
            }
          }
        }
      }) as Prisma.ListingGetPayload<{
        include: {
          facilities: {
            include: {
              facility: true;
            };
          };
        };
      }>;

      const facilityNames = model.facilities.map(f => f.facility.name);

      return new ListingEntity(
        model.id,
        model.providerId,
        model.name,
        model.city,
        model.fullAddress,
        model.monthlyPrice,
        model.description,
        model.status as StatusListing,
        facilityNames,
        model.mainImage,
        model.createdAt,
        model.updatedAt
      );
    } catch (error: any) {
      console.error('Gagal membuat listing', {
        providerId: data.providerId,
        facilityIds: data.facilityIds,
        prismaCode: error?.code,
        message: error?.message,
      });

      if (error?.code === 'P2003' || error?.code === 'P2025') {
        throw new RelationalConstraintError('Provider atau fasilitas yang dipilih tidak ditemukan di dalam sistem.');
      }

      throw new DatabaseOperationError('Terjadi kegagalan saat menyimpan data listing.');
    }
  }

  async update(id: string, providerId: string, data: UpdateListingPayload): Promise<ListingEntity> {
    try {
      const existing = await this.prisma.listing.findUnique({ where: { id } });
        if (!existing || existing.providerId !== providerId) {
          throw new ListingNotFoundError('Data kos tidak ditemukan atau Anda tidak memiliki hak akses.');
        }

        const facilitiesUpdate = data.facilityIds ? {
          deleteMany: {},
          create: data.facilityIds.map(facilityId => ({
            facility: { connect: { id: facilityId } }
          }))
        } : undefined;

        const model = await this.prisma.listing.update({
          where: { id },
          data: {
            name: data.name,
            city: data.city,
            fullAddress: data.fullAddress,
            monthlyPrice: data.monthlyPrice,
            description: data.description,
            status: data.status as PrismaStatusListing,
            mainImage: data.mainImage,
            facilities: facilitiesUpdate,
          },
          include: {
            facilities: { include: { facility: true } }
          }
        }) as Prisma.ListingGetPayload<{ include: { facilities: { include: { facility: true } } } }>;

        const facilityNames = model.facilities.map(f => f.facility.name);

        return new ListingEntity(
          model.id, 
          model.providerId, 
          model.name, 
          model.city, 
          model.fullAddress,
          model.monthlyPrice, 
          model.description, 
          model.status as StatusListing,
          facilityNames, 
          model.mainImage,
          model.createdAt, 
          model.updatedAt
        );
      } catch (error: any) {
        if (error instanceof ListingNotFoundError) throw error;
        if (error?.code === 'P2003' || error?.code === 'P2025') {
          throw new RelationalConstraintError('Fasilitas yang dipilih tidak valid.');
        }
        throw new DatabaseOperationError('Gagal memperbarui data kos.');
      }
  }

  async delete(id: string, providerId: string): Promise<boolean> {
    try {
      const existing = await this.prisma.listing.findUnique({ where: { id } });
      if (!existing || existing.providerId !== providerId) {
        throw new ListingNotFoundError('Data kos tidak ditemukan atau Anda tidak memiliki hak akses.')
      }

      await this.prisma.listing.delete({ where: { id } });
      return true;
    } catch (error: any) {
      if (error instanceof ListingNotFoundError) throw error;
      throw new DatabaseOperationError('Gagal menghapus data kos.');
    }
  }

  async findAllByProviderId(providerId: string): Promise<ListingEntity[]> {
    const models = await this.prisma.listing.findMany({
      where: { providerId },
      include: {
        facilities: {
          include: { facility: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return models.map((model) => {
      const facilityNames = model.facilities.map((f) => f.facility.name);
      return new ListingEntity(
        model.id,
        model.providerId,
        model.name,
        model.city,
        model.fullAddress,
        model.monthlyPrice,
        model.description,
        model.status as StatusListing,
        facilityNames,
        model.mainImage,
        model.createdAt,
        model.updatedAt
      );
    });
  }

  async findByIdAndProviderId(id: string, providerId: string): Promise<ListingEntity | null> {
    const model = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        facilities: {
          include: { facility: true }
        }
      },
    });

    if (!model || model.providerId !== providerId) {
      return null;
    }

    const facilityNames = model.facilities.map((f) => f.facility.name);

    return new ListingEntity(
      model.id,
      model.providerId,
      model.name,
      model.city,
      model.fullAddress,
      model.monthlyPrice,
      model.description,
      model.status as StatusListing,
      facilityNames,
      model.mainImage,
      model.createdAt,
      model.updatedAt
    );
  }

  async findAllActive(): Promise<ListingEntity[]> {
    const models = await this.prisma.listing.findMany({
      where: {
        status: 'AVAILABLE',
      },
      include: {
        facilities: {
          include: {
            facility: true,
          },
        },
      },
    });

    return models.map((model) => {
      const facilityNames = model.facilities.map((f) => f.facility.name);
      return new ListingEntity(
        model.id,
        model.providerId,
        model.name,
        model.city,
        model.fullAddress,
        model.monthlyPrice,
        model.description,
        model.status as StatusListing,
        facilityNames,
        model.mainImage,
        model.createdAt,
        model.updatedAt
      );
    });
  }

  async findById(id: string): Promise<ListingEntity | null> {
    const model = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        facilities: {
          include: {
            facility: true,
          },
        },
      },
    });

    if (!model) return null;

    const facilityNames = model.facilities.map((f) => f.facility.name);

    return new ListingEntity(
      model.id,
      model.providerId,
      model.name,
      model.city,
      model.fullAddress,
      model.monthlyPrice,
      model.description,
      model.status as StatusListing,
      facilityNames,
      model.mainImage,
      model.createdAt,
      model.updatedAt
    );
  }
}

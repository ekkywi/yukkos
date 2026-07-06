import { Injectable } from '@nestjs/common';
import { Prisma, StatusListing as PrismaStatusListing } from '@prisma/client';
import { IListingRepository, CreateListingPayload } from '../../../domain/repositories/i-listing.repository';
import { UpdateListingPayload } from '../../../domain/repositories/i-listing.repository';
import { ListingEntity, StatusListing, TypeListing } from '../../../domain/entities/listing.entity';
import { PrismaService } from './prisma.service';
import { RelationalConstraintError, DatabaseOperationError, ListingNotFoundError } from '../../../domain/exceptions/database.exception';

type ListingModelWithType = Prisma.ListingGetPayload<{
  include: {
    facilities: {
      include: {
        facility: true;
      };
    };
    provider: {
      select: {
        name: true;
      };
    };
  };
}>;

const normalizeImageUrls = (images?: string[] | null, mainImage?: string | null) => {
  const normalizedImages = Array.isArray(images)
    ? images.filter((image): image is string => typeof image === 'string' && image.length > 0)
    : [];

  if (mainImage && !normalizedImages.includes(mainImage)) {
    normalizedImages.unshift(mainImage);
  }

  return Array.from(new Set(normalizedImages));
};

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
          type: data.type as any,
          status: data.status as PrismaStatusListing,
          images: normalizeImageUrls(data.images, data.mainImage),
          mainImage: data.mainImage,
          facilities: {
            create: data.facilityIds?.map(facilityId => ({
              facility: { connect: { id: facilityId } }
            })) || []
          }
        } as any,
        include: {
          facilities: {
            include: {
              facility: true
            }
          },
          provider: {
            select: {
              name: true,
            },
          },
        }
      }) as ListingModelWithType;

      const facilityNames = model.facilities.map(f => f.facility.name);

      return new ListingEntity(
        model.id,
        model.providerId,
        model.name,
        model.city,
        model.fullAddress,
        model.monthlyPrice,
        model.description,
        model.type as TypeListing,
        model.status as StatusListing,
        facilityNames,
        model.images,
        model.mainImage,
        model.provider?.name ?? null,
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
        throw new ListingNotFoundError('Data hunian tidak ditemukan atau Anda tidak memiliki hak akses.');
      }

      const facilitiesUpdate = data.facilityIds
        ? {
            deleteMany: {},
            create: data.facilityIds.map((facilityId) => ({
              facility: { connect: { id: facilityId } },
            })),
          }
        : undefined;

      const model = await this.prisma.listing.update({
        where: { id },
        data: {
          name: data.name,
          city: data.city,
          fullAddress: data.fullAddress,
          monthlyPrice: data.monthlyPrice,
          description: data.description,
          type: data.type as any,
          status: data.status as PrismaStatusListing,
          images: data.images !== undefined ? normalizeImageUrls(data.images, data.mainImage) : undefined,
          mainImage: data.mainImage,
          facilities: facilitiesUpdate,
        } as any,
        include: {
          facilities: { include: { facility: true } },
          provider: {
            select: {
              name: true,
            },
          },
        },
      }) as ListingModelWithType;

      const facilityNames = model.facilities.map((f) => f.facility.name);

      return new ListingEntity(
        model.id,
        model.providerId,
        model.name,
        model.city,
        model.fullAddress,
        model.monthlyPrice,
        model.description,
        model.type as TypeListing,
        model.status as StatusListing,
        facilityNames,
        model.images,
        model.mainImage,
        model.provider?.name ?? null,
        model.createdAt,
        model.updatedAt
      );
    } catch (error: any) {
      if (error instanceof ListingNotFoundError) throw error;
      if (error?.code === 'P2003' || error?.code === 'P2025') {
        throw new RelationalConstraintError('Fasilitas yang dipilih tidak valid.');
      }
      throw new DatabaseOperationError('Gagal memperbarui data hunian.');
    }
  }

  async delete(id: string, providerId: string): Promise<boolean> {
    try {
      const existing = await this.prisma.listing.findUnique({ where: { id } });
      if (!existing || existing.providerId !== providerId) {
        throw new ListingNotFoundError('Data hunian tidak ditemukan atau Anda tidak memiliki hak akses.')
      }

      await this.prisma.listing.delete({ where: { id } });
      return true;
    } catch (error: any) {
      if (error instanceof ListingNotFoundError) throw error;
      throw new DatabaseOperationError('Gagal menghapus data hunian.');
    }
  }

  async findAllByProviderId(providerId: string): Promise<ListingEntity[]> {
    const models = await this.prisma.listing.findMany({
      where: { providerId },
      include: {
        facilities: {
          include: { facility: true }
        },
        provider: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' }
    }) as ListingModelWithType[];

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
        model.type as TypeListing,
        model.status as StatusListing,
        facilityNames, 
        model.images,
        model.mainImage,
        model.provider?.name ?? null,
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
        },
        provider: {
          select: {
            name: true,
          },
        },
      },
    }) as ListingModelWithType | null;

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
      model.type as TypeListing,
      model.status as StatusListing,
      facilityNames,
      model.images,
      model.mainImage,
      model.provider?.name ?? null,
      model.createdAt,
      model.updatedAt
    );
  }

  async findAllActive(): Promise<ListingEntity[]> {
    const models = await this.prisma.listing.findMany({
      where: {
        status: PrismaStatusListing.AVAILABLE,
      },
      include: {
        facilities: {
          include: {
            facility: true,
          },
        },
        provider: {
          select: {
            name: true,
          },
        },
      },
    }) as ListingModelWithType[];

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
        model.type as TypeListing,
        model.status as StatusListing,
        facilityNames,
        model.images,
        model.mainImage,
        model.provider?.name ?? null,
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
        provider: {
          select: {
            name: true,
          },
        },
      },
    }) as ListingModelWithType | null;

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
      model.type as TypeListing,
      model.status as StatusListing,
      facilityNames,
      model.images,
      model.mainImage,
      model.provider?.name ?? null,
      model.createdAt,
      model.updatedAt
    );
  }
}

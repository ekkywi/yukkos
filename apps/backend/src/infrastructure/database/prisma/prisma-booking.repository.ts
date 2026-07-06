import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { IBookingRepository, CreateBookingPayload } from '../../../domain/repositories/i-booking.repository';
import { BookingEntity, BookingStatus } from '../../../domain/entities/booking.entity';
import { BookingStatus as PrismaBookingStatus } from '@prisma/client';
import { DatabaseOperationError } from '../../../domain/exceptions/database.exception';

@Injectable()
export class PrismaBookingRepository implements IBookingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateBookingPayload): Promise<BookingEntity> {
    try {
      const model = await this.prisma.booking.create({
        data: {
          listingId: data.listingId,
          tenantId: data.tenantId,
          checkInDate: data.checkInDate,
          durationMonths: data.durationMonths,
          totalPrice: data.totalPrice,
          status: PrismaBookingStatus.PENDING,
        },
      });

      return new BookingEntity(
        model.id,
        model.listingId,
        model.tenantId,
        model.status as BookingStatus,
        model.checkInDate,
        model.durationMonths,
        model.totalPrice,
        model.createdAt,
        model.updatedAt,
      );
    } catch (error: any) {
      console.error('Prisma Error [Booking Create]:', error?.message);
      throw new DatabaseOperationError('Gagal merekam data pemesanan ke basis data.');
    }
  }

  async updateStatus(id: string, status: BookingStatus): Promise<BookingEntity> {
    try {
      const model = await this.prisma.booking.update({
        where: { id },
        data: {
          status: status as PrismaBookingStatus,
        },
      });

      return new BookingEntity(
        model.id,
        model.listingId,
        model.tenantId,
        model.status as BookingStatus,
        model.checkInDate,
        model.durationMonths,
        model.totalPrice,
        model.createdAt,
        model.updatedAt,
      );
    } catch (error: any) {
      console.error('Prisma Error [Booking Update]:', error?.message);
      throw new DatabaseOperationError('Gagal memperbarui status pemesanan.');
    }
  }

  async findById(id: string): Promise<BookingEntity | null> {
    const model = await this.prisma.booking.findUnique({ where: { id } });
    if (!model) return null;

    return new BookingEntity(
      model.id,
      model.listingId,
      model.tenantId,
      model.status as BookingStatus,
      model.checkInDate,
      model.durationMonths,
      model.totalPrice,
      model.createdAt,
      model.updatedAt,
    );
  }

  async findAllByTenantId(tenantId: string): Promise<BookingEntity[]> {
    const models = await this.prisma.booking.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    return models.map(
      (model) =>
        new BookingEntity(
          model.id,
          model.listingId,
          model.tenantId,
          model.status as BookingStatus,
          model.checkInDate,
          model.durationMonths,
          model.totalPrice,
          model.createdAt,
          model.updatedAt,
        ),
    );
  }

  async findAllByProviderId(providerId: string): Promise<BookingEntity[]> {
    const models = await this.prisma.booking.findMany({
      where: {
        listing: {
          providerId: providerId,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        listing: true,
        tenant: true,
      },
    });

    return models.map(
      (model) =>
        new BookingEntity(
          model.id,
          model.listingId,
          model.tenantId,
          model.status as BookingStatus,
          model.checkInDate,
          model.durationMonths,
          model.totalPrice,
          model.createdAt,
          model.updatedAt,
          model.listing?.name,
          model.tenant?.name,
          model.listing?.city,
        ),
    );
  }
}

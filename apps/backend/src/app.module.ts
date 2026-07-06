import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './infrastructure/modules/auth.module';
import { FacilityModule } from './infrastructure/modules/facility.module';
import { ListingModule } from './infrastructure/modules/listing.module';
import { MediaModule } from './infrastructure/modules/media.module';
import { BookingModule } from './infrastructure/modules/booking.module';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    FacilityModule,
    ListingModule,
    MediaModule,
    BookingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

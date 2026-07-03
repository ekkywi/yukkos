import { Module } from '@nestjs/common';
import { AuthModule } from './infrastructure/modules/auth.module';
import { ListingModule } from './infrastructure/modules/listing.module';

@Module({
  imports: [
    AuthModule,
    ListingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
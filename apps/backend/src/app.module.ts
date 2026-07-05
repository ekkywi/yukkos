import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './infrastructure/modules/auth.module';
import { ListingModule } from './infrastructure/modules/listing.module';
import { MediaModule } from './infrastructure/modules/media.module';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    ListingModule,
    MediaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
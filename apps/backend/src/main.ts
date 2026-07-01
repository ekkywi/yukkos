import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './infrastructure/filters/global-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalFilters(new GlobalExceptionFilter());
  app. enableCors();

  const config = new DocumentBuilder()
    .setTitle('Yukkos API')
    .setDescription('Dokumentasi API (BFF) untuk Yukkos - Web dan Mobile')
    .setVersion('1.0')
    .addTag('Mobile')
    .addTag('Web')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document)

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import { AllExceptionsFilter } from './exceptions/AllExceptions';
import { ProductService } from './modules/product/product.service';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app: NestExpressApplication = await NestFactory.create(AppModule);
  app.enableCors();

  const config: ConfigService = app.get(ConfigService);
  const port: number = config.get<number>('PORT') || 3002;
  const tcpPort: number = config.get<number>('TCPPORT') || 4002;
  const tcpHost = config.get<string>('TCPHOST');

  // health check route
  app.use('/health', (_req: express.Request, res: express.Response) => {
    res.status(200).json({ status: 'ok' });
  });

  app.useGlobalFilters(new AllExceptionsFilter());

  const productService = app.get(ProductService);
  await productService.seedProducts();


  await app.listen(port, () => {
    console.log('[PRODUCT SERVICE RUNNING]', `http://localhost:${port}`);
  });

  // Start TCP microservice for inter-service communication
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: tcpHost,
      port: tcpPort,
    },
  });

  await app.startAllMicroservices();
  console.log(`[TCP] Order Service Microservice running on port ${tcpPort}`);
}
bootstrap();
